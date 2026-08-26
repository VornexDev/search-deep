/* =========================================================
   SEARCH DEEP — App principal
   ========================================================= */
(function(){
'use strict';

const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

// Normaliza texto pra comparação de busca: minúsculo e sem acentos.
// Sem isso, "Alimentação"/"Fast Food" (com acento/espaço) nunca batiam
// com os campos internos "alimentacao"/"fastfood" (sem acento/espaço),
// zerando os resultados de categorias inteiras.
const norm = (s) => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/* ----------------- ESTADO GLOBAL ----------------- */
const state = {
  query: '',
  filters: { cats:new Set(), bairro:'', dist:20, rate:0, open:false, web:false, ig:false, opp:new Set() },
  sort: 'rel',
  view: 'split',
  biz: SD.BIZ.slice(),
  prospects: new Map(),   // id -> {stage, note, demo}
  hoveredId: null,
  map: null,
  markers: new Map(),     // id -> leaflet marker
  activeBiz: null,
};

/* Persistência simples */
try{
  const saved = localStorage.getItem('sd_prospects');
  if(saved) Object.entries(JSON.parse(saved)).forEach(([k,v]) => state.prospects.set(k,v));
}catch(e){}

/* Sessão do usuário (preenchida de forma assíncrona pelo Supabase, ver initAuth) */
state.user = null;

/* ====================================================
   AUTH - LOGIN / SIGNUP / GATE (Supabase Auth)
   ==================================================== */
// Mapa entre o nome interno da view e o data-route do link de nav
// correspondente, pra manter o menu sempre sincronizado com a página
// realmente visível (antes "Explorar" ficava marcado fixo no HTML,
// mesmo quando a página mostrada era outra).
const VIEW_TO_NAV_ROUTE = { about:'home', mapa:'explore', demos:'demos', opportunities:'opportunities', sobre:'about' };

function setView(view){
  $$('.route').forEach(r => r.classList.remove('active'));
  const el = document.querySelector(`.route[data-view="${view}"]`);
  if(el) el.classList.add('active');
  window.scrollTo({ top:0, behavior:'instant' });

  const navRoute = VIEW_TO_NAV_ROUTE[view];
  $$('.nav-link').forEach(l => l.classList.toggle('active', navRoute && l.dataset.route === navRoute));
}

/* ====================================================
   PARTÍCULAS — pontos azuis piscando no fundo do login
   ==================================================== */
function initAuthParticles(){
  const canvas = document.getElementById('authParticles');
  if(!canvas || canvas.dataset.bound) return;
  canvas.dataset.bound = '1';

  const ctx = canvas.getContext('2d');
  let w, h, dots = [];
  const COLORS = ['rgba(56,189,248,', 'rgba(30,108,255,', 'rgba(34,211,238,'];

  function resize(){
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function makeDots(){
    const count = Math.max(40, Math.min(90, Math.floor((w * h) / 18000)));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.012,
    }));
  }

  function tick(t){
    ctx.clearRect(0, 0, w, h);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if(d.x < 0) d.x = w; if(d.x > w) d.x = 0;
      if(d.y < 0) d.y = h; if(d.y > h) d.y = 0;
      const alpha = 0.15 + (Math.sin(t * d.speed + d.phase) * 0.5 + 0.5) * 0.7;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.color + alpha.toFixed(2) + ')';
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(56,189,248,.6)';
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  resize();
  makeDots();
  requestAnimationFrame(tick);
  window.addEventListener('resize', () => { resize(); makeDots(); });
}

function showAppUI(logged){
  const hc = $('#hotbar');
  if(hc) hc.style.display = logged ? 'block' : 'none';
  const ft = $('.footer');
  if(ft) ft.style.display = logged ? 'block' : 'none';
  const uc = $('#userChip');
  if(uc) uc.style.display = logged ? 'flex' : 'none';
}

function setBtnLoading(btn, loading, labelWhenIdle){
  if(!btn) return;
  btn.disabled = loading;
  btn.style.opacity = loading ? '0.7' : '';
  const span = btn.querySelector('span');
  if(span) span.textContent = loading ? 'Aguarde...' : labelWhenIdle;
}

// Chamado quando o Supabase confirma que existe um usuário autenticado
function applyLoggedInUser(supabaseUser){
  const meta = supabaseUser.user_metadata || {};
  const name = meta.full_name || meta.name || supabaseUser.email.split('@')[0];
  state.user = { id: supabaseUser.id, name, email: supabaseUser.email };

  const av = $('#userAvatar');
  const nm = $('#userName');
  if(av) av.textContent = name.slice(0,2).toUpperCase();
  if(nm) nm.textContent = name;
  showAppUI(true);
  setView('about');
}

async function logoutUser(){
  try{ await sb.auth.signOut(); }catch(e){}
  state.user = null;
  showAppUI(false);
  setView('auth');
  const lf = $('#loginForm'); if(lf) lf.reset();
  const sf = $('#signupForm'); if(sf) sf.reset();
}

// Traduz os erros mais comuns do Supabase para mensagens em português
function translateAuthError(err){
  const msg = (err && err.message) || '';
  if(/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if(/User already registered/i.test(msg)) return 'Já existe uma conta com esse e-mail.';
  if(/Password should be at least/i.test(msg)) return 'A senha é muito curta.';
  if(/Email not confirmed/i.test(msg)) return 'Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).';
  if(/rate limit/i.test(msg)) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  return msg || 'Ocorreu um erro. Tente novamente.';
}

function bindAuth(){
  // Tabs
  $$('.auth-tab').forEach(t => {
    t.addEventListener('click', () => {
      const tab = t.dataset.tab;
      $$('.auth-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      $('#loginForm').style.display = tab==='login' ? 'flex' : 'none';
      $('#signupForm').style.display = tab==='signup' ? 'flex' : 'none';
    });
  });

  // Links que trocam tab
  $$('.auth-link').forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      const tab = l.dataset.tab;
      const target = document.querySelector(`.auth-tab[data-tab="${tab}"]`);
      if(target) target.click();
    });
  });

  // Mostrar/ocultar senha
  $$('.af-eye').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.target;
      const input = document.getElementById(id);
      if(!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // Login submit — autenticação real via Supabase
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    if(!sb){ toast('Configure as chaves do Supabase em js/supabase-config.js', 'warn'); return; }
    const email = $('#loginEmail').value.trim();
    const pass  = $('#loginPass').value;
    if(!email || !pass){ toast('Preencha e-mail e senha', 'warn'); return; }

    const btn = e.target.querySelector('button[type="submit"]');
    setBtnLoading(btn, true, 'Entrar no Search Deep');
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    setBtnLoading(btn, false, 'Entrar no Search Deep');

    if(error){ toast(translateAuthError(error), 'warn'); return; }
    applyLoggedInUser(data.user);
    toast(`Bem-vindo, ${state.user.name.split(' ')[0]}!`, 'success');
  });

  // Signup submit — cria conta real via Supabase
  $('#signupForm').addEventListener('submit', async e => {
    e.preventDefault();
    if(!sb){ toast('Configure as chaves do Supabase em js/supabase-config.js', 'warn'); return; }
    const name  = $('#signupName').value.trim();
    const email = $('#signupEmail').value.trim();
    const pass  = $('#signupPass').value;
    if(!name || !email || !pass){ toast('Preencha todos os campos', 'warn'); return; }
    if(pass.length < 6){ toast('A senha deve ter pelo menos 6 caracteres', 'warn'); return; }

    const btn = e.target.querySelector('button[type="submit"]');
    setBtnLoading(btn, true, 'Criar conta gratuita');
    const { data, error } = await sb.auth.signUp({
      email, password: pass, options: { data: { full_name: name } }
    });
    setBtnLoading(btn, false, 'Criar conta gratuita');

    if(error){ toast(translateAuthError(error), 'warn'); return; }

    // Se a confirmação por e-mail estiver ativada no projeto Supabase,
    // ainda não existe sessão nesse ponto — avisa o usuário.
    if(!data.session){
      toast('Conta criada! Confirme seu e-mail para poder entrar.', 'info');
      const target = document.querySelector('.auth-tab[data-tab="login"]');
      if(target) target.click();
      return;
    }
    applyLoggedInUser(data.user);
    toast(`Conta criada. Bem-vindo, ${name.split(' ')[0]}!`, 'success');
  });

  // Login social real via Supabase OAuth (Google / GitHub)
  $$('.af-sbtn').forEach(b => {
    b.addEventListener('click', async () => {
      if(!sb){ toast('Configure as chaves do Supabase em js/supabase-config.js', 'warn'); return; }
      const prov = b.dataset.prov;
      const providerMap = { google: 'google', gh: 'github' };
      const provider = providerMap[prov];
      if(!provider) return;
      const { error } = await sb.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.href }
      });
      if(error) toast(translateAuthError(error), 'warn');
      // Se der certo, o Supabase redireciona a página; a sessão é
      // detectada em initAuth() quando o usuário voltar.
    });
  });
}

// Verifica sessão existente ao carregar a página e escuta mudanças
// (login, logout, retorno de OAuth) em tempo real.
async function initAuth(){
  // Sempre garante a tela de login como estado inicial visível,
  // mesmo que o Supabase ainda não esteja configurado corretamente.
  showAppUI(false);
  setView('auth');

  try{
    if(!sb) throw new Error('Cliente Supabase não inicializado. Preencha js/supabase-config.js.');
    const { data, error } = await sb.auth.getSession();
    if(error) throw error;
    if(data.session && data.session.user){
      applyLoggedInUser(data.session.user);
    }

    sb.auth.onAuthStateChange((event, session) => {
      if(event === 'SIGNED_IN' && session && session.user && !state.user){
        applyLoggedInUser(session.user);
      }
      if(event === 'SIGNED_OUT'){
        state.user = null;
        showAppUI(false);
        setView('auth');
      }
    });
  }catch(err){
    console.error('Supabase não configurado corretamente:', err);
    toast('Configure as chaves do Supabase em js/supabase-config.js', 'warn');
  }
}

/* Botões data-goto removidos — CTAs agora usam data-route, unificado com bindNav() */

/* Logout pelo user chip */
function bindUserChip(){
  const chip = $('#userChip');
  if(!chip) return;
  chip.addEventListener('click', () => {
    if(confirm('Deseja sair da conta?')) logoutUser();
  });
}

/* ====================================================
   UTILITÁRIOS
   ==================================================== */
const SVG = {
  star: '<svg viewBox="0 0 24 24"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.4-.2.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',
  star_o: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  bookmark_fill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
};

/* ICONS por categoria */
SD.CAT_ICON = (key) => ({
  pizza:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M3.5 9.5h17M9 9l1 5M15 9l-1 5M11 16l-1 3M13 16l1 3"/></svg>',
  coffee:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>',
  burger:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12h18a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M3 12V8a9 9 0 0 1 18 0v4"/><path d="M7 16v2M11 16v2M15 16v2"/></svg>',
  shirt:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
  scissors:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
  dumbbell:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.5 6.5 17.5 17.5M2 12l4-4M22 12l-4 4M12 2l-4 4M12 22l-4-4M9 9l6 6"/></svg>',
  paw:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="7" cy="14" r="2.5"/><circle cx="11" cy="11" r="2.5"/><circle cx="15" cy="14" r="2.5"/><path d="M8 18a4 4 0 0 1 8 0c0 2-2 4-4 4s-4-2-4-4z"/></svg>',
  car:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
  bed:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20"/><path d="M6 8v9"/></svg>',
  chip:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
  bag:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  tool:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
})[key] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/></svg>';

/* Toast */
function toast(msg, type='success'){
  const t = document.createElement('div');
  t.className = 'toast ' + (type==='success'?'success':type);
  t.innerHTML = `<div class="toast-icon">${type==='success'?'✓':type==='warn'?'!':'i'}</div><div>${msg}</div>`;
  $('#toastWrap').appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(20px)'; setTimeout(()=>t.remove(),300); }, 2400);
}

/* Persist prospects */
function saveProspects(){
  try{ localStorage.setItem('sd_prospects', JSON.stringify(Object.fromEntries(state.prospects))); }catch(e){}
}

/* ====================================================
   INTERPRETAÇÃO DE BUSCA (linguagem natural)
   ==================================================== */
function parseQuery(q){
  const ql = norm(q).trim();
  const filters = { cats:new Set(), bairro:'', dist:state.filters.dist, rate:0, open:false, web:false, ig:false, opp:new Set() };
  let catKey = null;

  // Detecta categoria (comparação normalizada, sem acento)
  SD.CATEGORIES.forEach(c => {
    if(ql.includes(norm(c.key)) || ql.includes(norm(c.label))){
      filters.cats.add(c.key);
    }
  });
  // Aliases
  const aliases = {
    'pizza':'alimentacao','pizzaria':'alimentacao','pizzarias':'alimentacao',
    'restaurante':'alimentacao','restaurantes':'alimentacao','comida':'alimentacao',
    'lanche':'fastfood','hamburguer':'fastfood','hamburgueria':'fastfood',
    'bar':'alimentacao','barbearia':'beleza','barbearias':'beleza',
    'salao':'beleza','cabeleireiro':'beleza',
    'cafe':'cafes','cafeteria':'cafes','cafeterias':'cafes',
    'academia':'fitness','academias':'fitness','crossfit':'fitness',
    'roupa':'moda','roupas':'moda','loja':'moda',
    'pet':'pets','petshop':'pets','pet shop':'pets',
    'oficina':'automovel','mecanica':'automovel',
    'hotel':'hoteis','hoteis':'hoteis','pousada':'hoteis',
    'celular':'tecnologia','informatica':'tecnologia',
  };
  Object.entries(aliases).forEach(([k,v])=>{
    if(ql.includes(norm(k)) && !filters.cats.size) filters.cats.add(v);
  });

  // Detecta bairro (comparação normalizada, sem acento)
  SD.NEIGHBORHOODS.forEach(b => {
    const bl = norm(b);
    if(ql.includes('em ' + bl) || ql.includes('no ' + bl) || ql.includes('na ' + bl) || ql.includes(bl)){
      filters.bairro = b;
    }
  });

  // Status
  if(ql.includes('aberto') || ql.includes('agora')) filters.open = true;
  if(ql.includes('com site') || ql.includes('com website')) filters.web = true;
  if(ql.includes('com instagram')) filters.ig = true;

  return filters;
}

/* Aplica busca+filtros */
function applyFilters(){
  const f = state.filters;
  let list = SD.BIZ.slice();

  // Query -> match nome/categoria (normalizado: sem acento, minúsculo)
  if(state.query){
    const q = norm(state.query);
    list = list.filter(b =>
      norm(b.name).includes(q) ||
      norm(b.subcat).includes(q) ||
      norm(b.cat).includes(q) ||
      norm(SD.CAT_INFO(b.cat)?.label).includes(q) ||
      norm(b.bairro).includes(q) ||
      b.tags.some(t => norm(t).includes(q))
    );
  }

  if(f.cats.size) list = list.filter(b => f.cats.has(b.cat));
  if(f.bairro) list = list.filter(b => b.bairro === f.bairro);
  if(f.dist < 20) list = list.filter(b => b.dist <= f.dist);
  if(f.rate > 0) list = list.filter(b => b.rate >= f.rate);
  if(f.open) list = list.filter(b => b.open);
  if(f.web) list = list.filter(b => !!b.site);
  if(f.ig)  list = list.filter(b => !!b.ig);
  if(f.opp.size) list = list.filter(b => f.opp.has(b.opp));

  // Sort
  if(state.sort==='rate') list.sort((a,b)=>b.rate-a.rate);
  else if(state.sort==='dist') list.sort((a,b)=>a.dist-b.dist);
  else if(state.sort==='opp'){
    const order = {alta:0, media:1, baixa:2};
    list.sort((a,b)=>order[a.opp]-order[b.opp]);
  }

  state.biz = list;
  renderResults();
  renderMap();
  renderPipeline();
  updateKpis();
}

/* ====================================================
   CATEGORIAS
   ==================================================== */
function renderCategories(){
  const counts = {};
  SD.BIZ.forEach(b => counts[b.cat] = (counts[b.cat]||0)+1);
  const grid = $('#catGrid');
  grid.innerHTML = SD.CATEGORIES.map(c => `
    <button class="cat-card" data-cat="${c.key}">
      <div class="cat-icon">${SD.CAT_ICON(c.icon)}</div>
      <div class="cat-name">${c.label}</div>
      <div class="cat-count">${counts[c.key] || 0} locais</div>
    </button>
  `).join('');

  grid.querySelectorAll('.cat-card').forEach(el => {
    el.addEventListener('click', () => {
      const cat = el.dataset.cat;
      state.query = SD.CAT_INFO(cat).label.toLowerCase();
      state.filters.cats = new Set([cat]);
      $('#searchInput').value = state.query;
      runSearch();
      scrollToExplore();
    });
  });
}

function renderFilterCats(){
  const c = $('#filterCat');
  c.innerHTML = SD.CATEGORIES.map(x =>
    `<button class="pill ${state.filters.cats.has(x.key)?'active':''}" data-cat="${x.key}">${x.label}</button>`
  ).join('');
  c.querySelectorAll('.pill').forEach(p => {
    p.addEventListener('click', () => {
      const k = p.dataset.cat;
      if(state.filters.cats.has(k)) state.filters.cats.delete(k); else state.filters.cats.add(k);
      p.classList.toggle('active');
      applyFilters();
    });
  });
}

function renderFilterBairros(){
  const s = $('#filterBairro');
  s.innerHTML = '<option value="">Todos os bairros</option>' + SD.NEIGHBORHOODS.map(n => `<option ${state.filters.bairro===n?'selected':''} value="${n}">${n}</option>`).join('');
  s.addEventListener('change', () => {
    state.filters.bairro = s.value;
    applyFilters();
  });
}

function bindFilterSwitches(){
  $('#filterDist').addEventListener('input', e => {
    state.filters.dist = +e.target.value;
    $('#filterDistVal').textContent = state.filters.dist + ' km';
  });
  $('#filterDist').addEventListener('change', applyFilters);
  $('#filterRate').addEventListener('input', e => {
    state.filters.rate = +e.target.value;
    $('#filterRateVal').textContent = state.filters.rate.toFixed(1);
  });
  $('#filterRate').addEventListener('change', applyFilters);
  $('#filterOpen').addEventListener('change', e => { state.filters.open = e.target.checked; applyFilters(); });
  $('#filterWeb').addEventListener('change',  e => { state.filters.web  = e.target.checked; applyFilters(); });
  $('#filterIg').addEventListener('change',   e => { state.filters.ig   = e.target.checked; applyFilters(); });

  $$('#filterOpp .pill').forEach(p => {
    p.addEventListener('click', () => {
      const k = p.dataset.opp;
      if(state.filters.opp.has(k)) state.filters.opp.delete(k); else state.filters.opp.add(k);
      p.classList.toggle('active');
      applyFilters();
    });
  });

  $('#sortBy').addEventListener('change', e => { state.sort = e.target.value; applyFilters(); });

  $('#resetFilters').addEventListener('click', () => {
    state.filters = { cats:new Set(), bairro:'', dist:20, rate:0, open:false, web:false, ig:false, opp:new Set() };
    state.query = '';
    $('#searchInput').value = '';
    $('#filterDist').value = 20; $('#filterDistVal').textContent = '20 km';
    $('#filterRate').value = 0; $('#filterRateVal').textContent = '0.0';
    $('#filterOpen').checked = false;
    $('#filterWeb').checked = false;
    $('#filterIg').checked = false;
    renderFilterCats();
    $$('#filterOpp .pill').forEach(p => p.classList.remove('active'));
    applyFilters();
  });
}

/* ====================================================
   RESULTADOS / CARDS
   ==================================================== */
function bizIconSvg(b){
  const cat = SD.CAT_INFO(b.cat);
  return cat ? SD.CAT_ICON(cat.icon) : '';
}

function renderResults(){
  $('#resultsCount').textContent = `${state.biz.length} ${state.biz.length===1?'resultado':'resultados'}`;
  const list = $('#resultsList');
  if(!state.biz.length){
    list.innerHTML = `<div style="text-align:center; padding:40px 18px; color:var(--text-3); font-size:13.5px;">
      <div style="font-size:34px; margin-bottom:10px;">🔍</div>
      Nenhum estabelecimento encontrado com esses critérios.
    </div>`;
    return;
  }

  list.innerHTML = state.biz.map(b => {
    const isProspect = state.prospects.has(b.id);
    return `
    <article class="biz-card" data-id="${b.id}">
      <div class="biz-img">${bizIconSvg(b)}</div>
      <div class="biz-content">
        <div class="biz-row1">
          <h3 class="biz-name">${b.name}</h3>
          <div class="biz-rate">${SVG.star} ${b.rate} <span style="color:var(--text-3);font-weight:400;">(${b.reviews})</span></div>
        </div>
        <div class="biz-opp ${b.opp}">
          <span class="dot"></span>
          Oportunidade: <strong style="margin-left:3px;">${b.opp.toUpperCase()}</strong>
        </div>
        <div class="biz-meta">
          <span>${b.subcat}</span>
          <span class="dot">·</span>
          <span>${b.bairro}</span>
          <span class="dot">·</span>
          <span>${b.dist} km</span>
        </div>
        <div class="biz-tags">
          <span class="biz-tag ${b.site?'':'noinfo'}">${b.site?'Site próprio':'Sem site'}</span>
          <span class="biz-tag ${b.ig?'':'noinfo'}">${b.ig?b.ig:'Sem Instagram'}</span>
        </div>
        <div class="biz-foot">
          <span class="biz-status ${b.open?'open':'closed'}">
            <span class="pulse"></span>
            ${b.open?'Aberto agora':'Fechado'} · ${b.hours}
          </span>
          <div class="biz-actions">
            <button class="icon-act" data-act="prospect" title="${isProspect?'Remover dos potenciais clientes':'Potencial cliente'}">
              ${isProspect?SVG.bookmark_fill:SVG.bookmark}
            </button>
            <button class="icon-act" data-act="view" title="Ver detalhes">${SVG.search}</button>
            <button class="icon-act" data-act="map" title="Abrir no mapa">${SVG.map}</button>
            <button class="icon-act" data-act="contact" title="Contato">${SVG.phone}</button>
          </div>
        </div>
      </div>
    </article>`;
  }).join('');

  // Bindings
  list.querySelectorAll('.biz-card').forEach(card => {
    const id = card.dataset.id;
    const b = SD.BIZ.find(x => x.id===id);
    if(!b) return;

    card.addEventListener('mouseenter', () => {
      state.hoveredId = id;
      highlightMarker(id, true);
    });
    card.addEventListener('mouseleave', () => {
      state.hoveredId = null;
      highlightMarker(id, false);
    });
    card.addEventListener('click', e => {
      const act = e.target.closest('[data-act]');
      if(act){
        e.stopPropagation();
        const a = act.dataset.act;
        if(a==='prospect'){ toggleProspect(b); return; }
        if(a==='view'){ openBizModal(b); return; }
        if(a==='map'){ focusMarker(b); scrollToExplore(); return; }
        if(a==='contact'){ openContact(b); return; }
      }
      focusMarker(b);
      $$('.biz-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

/* ====================================================
   MAPA
   ==================================================== */
function initMap(){
  if(state.map) return;
  const map = L.map('map', { zoomControl:true, attributionControl:true }).setView([-25.4280, -49.2730], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  state.map = map;

  // CSS override Leaflet
  setTimeout(() => map.invalidateSize(), 200);
  window.addEventListener('resize', () => map.invalidateSize());

  // Corrige o mapa "cortado" (só carrega os ladrilhos do canto) que
  // acontece quando ele é criado enquanto a página ainda está
  // trocando de tamanho (troca de aba, sidebar recolhendo, etc.).
  // Observa o próprio contêiner e recalcula sempre que o tamanho muda.
  const mapWrapEl = $('#mapWrap');
  if(mapWrapEl && 'ResizeObserver' in window){
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(mapWrapEl);
  }
}

function renderMap(){
  if(!state.map) initMap();
  // Limpa markers antigos
  state.markers.forEach(m => m.remove());
  state.markers.clear();

  state.biz.forEach(b => {
    const opp = b.opp;
    const icon = L.divIcon({
      className: 'sd-pin-wrap',
      html: `<div class="map-pin ${opp}">${b.rate.toFixed(1)}</div>`,
      iconSize: [30,30],
      iconAnchor: [15,30],
    });
    const m = L.marker([b.lat, b.lng], { icon }).addTo(state.map);
    const oppLabel = { alta:'Alta', media:'Média', baixa:'Baixa' }[b.opp] || b.opp;
    m.bindPopup(`
      <div class="pp-name">${b.name}</div>
      <div class="pp-meta">${b.subcat} · ${b.bairro} · ${b.dist} km</div>
      <div class="pp-rate">★ ${b.rate} (${b.reviews} avaliações)</div>
      <div class="pp-status ${b.open ? 'open' : 'closed'}">${b.open ? '● Aberto agora' : '● Fechado'} · ${b.hours}</div>
      <div class="pp-opp ${b.opp}">Oportunidade: ${oppLabel}</div>
      ${b.phone ? `<div class="pp-contact">${b.phone}</div>` : ''}
    `);
    m.on('click', () => {
      $$('.biz-card').forEach(c => c.classList.remove('active'));
      const card = document.querySelector(`.biz-card[data-id="${b.id}"]`);
      if(card){ card.classList.add('active'); card.scrollIntoView({block:'nearest', behavior:'smooth'}); }
    });
    state.markers.set(b.id, m);
  });

  // Ajusta automaticamente o zoom/posição do mapa pros resultados
  // filtrados no momento — sem isso, filtrar/pesquisar não "aparecia"
  // no mapa visualmente porque a câmera ficava parada no centro fixo.
  if(state.biz.length === 1){
    const b = state.biz[0];
    state.map.flyTo([b.lat, b.lng], 16, { duration:0.6 });
  } else if(state.biz.length){
    const bounds = L.latLngBounds(state.biz.map(b => [b.lat, b.lng]));
    state.map.flyToBounds(bounds, { padding:[40,40], maxZoom:15, duration:0.6 });
  }
}

function highlightMarker(id, on){
  const m = state.markers.get(id);
  if(!m) return;
  const el = m.getElement();
  if(!el) return;
  const pin = el.querySelector('.map-pin');
  if(!pin) return;
  if(on){ pin.style.transform = 'translate(-50%,-100%) scale(1.3)'; pin.style.boxShadow = '0 0 0 4px rgba(255,255,255,.4), 0 6px 18px rgba(0,0,0,.5)'; }
  else { pin.style.transform = ''; pin.style.boxShadow = ''; }
}

function focusMarker(b){
  if(!state.map) return;
  state.map.setView([b.lat, b.lng], 15, { animate:true });
  const m = state.markers.get(b.id);
  if(m) m.openPopup();
}

/* ====================================================
   PROSPECTS / PIPELINE
   ==================================================== */
function toggleProspect(b){
  if(state.prospects.has(b.id)){
    state.prospects.delete(b.id);
    toast(`${b.name} removido dos potenciais clientes`, 'info');
  } else {
    state.prospects.set(b.id, { stage:'novo', note:'', demo:null });
    toast(`${b.name} adicionado como potencial cliente`, 'success');
  }
  saveProspects();
  renderResults();
  renderPipeline();
  updateKpis();
}

function setProspectStage(id, stage){
  const p = state.prospects.get(id);
  if(!p) return;
  p.stage = stage;
  state.prospects.set(id, p);
  saveProspects();
  renderPipeline();
  updateKpis();
}

function setProspectNote(id, note){
  const p = state.prospects.get(id);
  if(!p) return;
  p.note = note;
  state.prospects.set(id, p);
  saveProspects();
}

function renderPipeline(){
  const pipe = $('#pipeline');
  const stages = SD.PIPELINE_STAGES;
  const items = {};

  stages.forEach(s => items[s.key] = []);
  state.prospects.forEach((p, id) => {
    const b = SD.BIZ.find(x => x.id===id);
    if(b) items[p.stage || 'novo'].push({ biz:b, p });
  });

  pipe.innerHTML = stages.map(s => `
    <div class="pipeline-col" data-stage="${s.key}">
      <div class="col-head">
        <div class="col-title"><span class="col-dot"></span>${s.label}</div>
        <div class="col-count">${items[s.key].length}</div>
      </div>
      <div class="col-list">
        ${items[s.key].length ? items[s.key].map(({biz,p})=>`
          <div class="prospect-card" data-id="${biz.id}">
            <div class="prospect-name">${biz.name}</div>
            <div class="prospect-meta">
              <span>${biz.subcat}</span> · <span>${biz.bairro}</span>
            </div>
            <div class="prospect-opp ${biz.opp}">${biz.opp.toUpperCase()}</div>
          </div>
        `).join('') : `<div class="empty-col">Sem leads</div>`}
      </div>
    </div>
  `).join('');

  // Bind: clicou no prospect card -> abre detalhes
  pipe.querySelectorAll('.prospect-card').forEach(c => {
    c.addEventListener('click', () => {
      const b = SD.BIZ.find(x => x.id===c.dataset.id);
      if(b) openBizModal(b);
    });
  });

  // Botões de mover stage
  pipe.querySelectorAll('.pipeline-col').forEach(col => {
    const stage = col.dataset.stage;
    col.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
  });
}

function updateKpis(){
  $('#kpiTotal').textContent = state.prospects.size;
  const contacted = [...state.prospects.values()].filter(p => ['contato','proposta','negociacao','cliente'].includes(p.stage)).length;
  const propostas = [...state.prospects.values()].filter(p => ['proposta','negociacao','cliente'].includes(p.stage)).length;
  const clientes = [...state.prospects.values()].filter(p => p.stage==='cliente').length;
  $('#kpiContacted').textContent = contacted;
  $('#kpiPropostas').textContent = propostas;
  $('#kpiClientes').textContent = clientes;
}

/* ====================================================
   MODAL DE DETALHES
   ==================================================== */
function openBizModal(b){
  state.activeBiz = b;
  const p = state.prospects.get(b.id) || { stage:'novo', note:'' };
  const cat = SD.CAT_INFO(b.cat);

  $('#mEyebrow').textContent = `${cat ? cat.label : ''} · ${b.subcat}`;
  $('#mTitle').textContent = b.name;

  const oppExplain = {
    alta: 'Este estabelecimento possui forte presença local e sinais de que poderia se beneficiar de uma landing page própria. Foco em presença digital e visibilidade online.',
    media: 'Boa estrutura e reputação, mas com espaço para melhorar a presença digital. Pode aproveitar novos canais para crescer.',
    baixa: 'Já possui boa presença digital, mas pode explorar novas estratégias e otimizações.',
  }[b.opp];

  const waMsg = encodeURIComponent(SD.WA_DEFAULT(b.name));
  const waLink = `https://wa.me/${b.whatsapp}?text=${waMsg}`;

  $('#mBody').innerHTML = `
    <div class="detail-grid">
      <div>
        <div class="detail-hero" style="background: linear-gradient(135deg, #0a0e1a 0%, ${cat ? '#1e6cff' : '#1e6cff'}44 50%, #0a0e1a 100%);">
          ${bizIconSvg(b)}
        </div>
        <div class="opp-card" style="margin-top:18px;">
          <div class="opp-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;color:var(--primary);"><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Análise de Oportunidade
          </div>
          <div style="margin-bottom:8px;">
            <span class="opp-badge ${b.opp}">${b.opp === 'alta' ? 'ALTA OPORTUNIDADE' : b.opp === 'media' ? 'MÉDIA OPORTUNIDADE' : 'BAIXA OPORTUNIDADE'}</span>
          </div>
          <div class="opp-explain">${oppExplain}</div>
          <div class="opp-tags">
            ${b.tags.map(t => `<span class="biz-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div class="notes-box">
          <div class="notes-head">
            <h4>${SVG.notes} Notas do prospect</h4>
            <span style="font-size:11.5px;color:var(--text-3);">Salvo automaticamente</span>
          </div>
          <textarea class="notes-area" id="noteArea" placeholder="Ex: Instagram ativo, mas não possui site. Demonstrar projeto Pizza House.">${p.note || ''}</textarea>
        </div>
      </div>
      <div>
        <div class="detail-info">
          <h3>${b.name}</h3>
          <div class="detail-meta">${b.subcat} · ${b.bairro} · ${b.dist} km do Centro</div>
          <p style="color:var(--text-2); font-size:13.5px; margin:14px 0;">${b.desc}</p>
        </div>

        <div class="biz-opp ${b.opp}" style="margin-bottom:14px;">
          <span class="dot"></span>
          Oportunidade: <strong style="margin-left:3px;">${b.opp.toUpperCase()}</strong>
        </div>

        <div>
          <div class="detail-row">${SVG.star_o}<span class="lbl">Avaliação</span><span class="val"><strong style="color:var(--warn);">${b.rate}</strong> · ${b.reviews} avaliações</span></div>
          <div class="detail-row">${SVG.clock}<span class="lbl">Horário</span><span class="val">${b.hours} · <span style="color:${b.open?'#34d399':'#f87171'};">${b.open?'Aberto':'Fechado'}</span></span></div>
          <div class="detail-row">${SVG.pin}<span class="lbl">Endereço</span><span class="val">${b.address} · ${b.bairro}</span></div>
          <div class="detail-row">${SVG.phone}<span class="lbl">Telefone</span><span class="val">${b.phone}</span></div>
          <div class="detail-row">${SVG.globe}<span class="lbl">Website</span><span class="val">${b.site?`<a href="${b.site}" target="_blank" rel="noopener">${b.site.replace('https://','')}</a>`:'<em style="color:var(--text-3);">Não identificado</em>'}</span></div>
          <div class="detail-row">${SVG.ig}<span class="lbl">Instagram</span><span class="val">${b.ig?`<a href="https://instagram.com/${b.ig.replace('@','')}" target="_blank" rel="noopener">${b.ig}</a>`:'<em style="color:var(--text-3);">Não identificado</em>'}</span></div>
        </div>

        <h4 style="font-size:13px; margin:18px 0 10px; text-transform:uppercase; letter-spacing:.06em; color:var(--text-3);">Entrar em contato</h4>
        <div class="contact-row">
          <a class="contact-btn wa" href="${waLink}" target="_blank" rel="noopener">${SVG.wa} WhatsApp</a>
          <a class="contact-btn" href="tel:${b.phone.replace(/\D/g,'')}">${SVG.phone} Ligar</a>
          ${b.ig?`<a class="contact-btn ig" href="https://instagram.com/${b.ig.replace('@','')}" target="_blank" rel="noopener">${SVG.ig} Instagram</a>`:''}
          ${b.site?`<a class="contact-btn" href="${b.site}" target="_blank" rel="noopener">${SVG.globe} Site</a>`:''}
        </div>

        <h4 style="font-size:13px; margin:18px 0 10px; text-transform:uppercase; letter-spacing:.06em; color:var(--text-3);">Pipeline</h4>
        <select class="select" id="stageSelect">
          ${SD.PIPELINE_STAGES.map(s => `<option value="${s.key}" ${p.stage===s.key?'selected':''}>${s.label}</option>`).join('')}
        </select>
        <div style="display:flex; gap:8px; margin-top:14px;">
          <button class="btn ${state.prospects.has(b.id)?'btn-ghost':'btn-primary'}" id="toggleProspectBtn" style="flex:1; justify-content:center;">
            ${state.prospects.has(b.id)?'Remover dos potenciais':'+ Potencial cliente'}
          </button>
          <button class="btn btn-primary" id="openProposalBtn" style="flex:1; justify-content:center;">
            ${SVG.arrow} Criar proposta
          </button>
        </div>
      </div>
    </div>
  `;

  $('#bizModal').classList.add('show');
  document.body.style.overflow = 'hidden';

  // Bindings
  $('#noteArea').addEventListener('input', e => setProspectNote(b.id, e.target.value));
  $('#stageSelect').addEventListener('change', e => {
    if(!state.prospects.has(b.id)){
      state.prospects.set(b.id, { stage:e.target.value, note:$('#noteArea').value, demo:null });
    } else {
      setProspectStage(b.id, e.target.value);
    }
    toast('Estágio atualizado', 'success');
  });
  $('#toggleProspectBtn').addEventListener('click', () => { toggleProspect(b); openBizModal(b); });
  $('#openProposalBtn').addEventListener('click', () => { openProposal(b); });
}

function closeBizModal(){
  $('#bizModal').classList.remove('show');
  document.body.style.overflow = '';
  state.activeBiz = null;
}

/* ====================================================
   CONTATO
   ==================================================== */
function openContact(b){
  const waMsg = encodeURIComponent(SD.WA_DEFAULT(b.name));
  window.open(`https://wa.me/${b.whatsapp}?text=${waMsg}`, '_blank');
}

/* ====================================================
   PROJETOS DEMO
   ==================================================== */
function renderDemos(){
  const grid = $('#demosGrid');
  grid.innerHTML = SD.DEMOS.map(d => `
    <article class="demo-card" data-id="${d.id}">
      <div class="demo-preview" style="background: linear-gradient(135deg, #0a0e1a 0%, ${d.palette[1]}33 50%, ${d.palette[2]}33 100%);">
        <div class="demo-mark">${d.name}<span>${d.seg}</span></div>
      </div>
      <div class="demo-body">
        <div class="demo-cat">${d.seg}</div>
        <h3 class="demo-name">${d.name}</h3>
        <p class="demo-sub">${d.sub}</p>
        <div class="demo-feats">
          ${d.features.map(f => `<span class="demo-feat">${f}</span>`).join('')}
        </div>
        <div class="demo-actions">
          <button class="btn btn-ghost" data-act="preview">Ver demo</button>
          <button class="btn btn-primary" data-act="propose">${SVG.arrow} Usar como proposta</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.demo-card').forEach(card => {
    const id = card.dataset.id;
    const d = SD.DEMOS.find(x => x.id===id);
    card.addEventListener('click', e => {
      const act = e.target.closest('[data-act]');
      if(!act) { openDemoPreview(d); return; }
      if(act.dataset.act==='preview') openDemoPreview(d);
      if(act.dataset.act==='propose'){
        if(state.activeBiz) openProposal(state.activeBiz, d);
        else openProposalChooser(d);
      }
    });
  });
}

function openDemoPreview(d){
  $('#dTitle').textContent = `${d.name} · ${d.seg}`;
  const stage = $('#dBody');
  const html = SD.DEMO_HTML && SD.DEMO_HTML[d.id];

  if(html){
    // Template real (um dos 10 modelos completos)
    stage.innerHTML = `
      <div class="preview-stage desktop" data-dev="desktop">
        <div class="preview-bar">
          <div class="dots"><span></span><span></span><span></span></div>
          <div class="url">${d.name.toLowerCase().replace(/\s+/g,'')}.com.br</div>
        </div>
        <div class="preview-content">
          <iframe class="preview-iframe" title="${d.name}"></iframe>
        </div>
      </div>
    `;
    // Seta via propriedade do DOM (não como atributo HTML), pra não
    // precisar escapar aspas/entidades do template embutido.
    stage.querySelector('.preview-iframe').srcdoc = html;
  } else {
    // Fallback (caso algum demo não tenha template real cadastrado)
    stage.innerHTML = `
      <div class="preview-stage desktop" data-dev="desktop">
        <div class="preview-bar">
          <div class="dots"><span></span><span></span><span></span></div>
          <div class="url">${d.name.toLowerCase().replace(/\s+/g,'')}.com.br</div>
        </div>
        <div class="preview-content">
          <div class="demo-page" style="--bg-color:${d.palette[1]}; --bg-color-2:${d.palette[2]};">
            <div class="dp-hero">
              <h1>${d.headline}</h1>
              <p>${d.sub}</p>
              <a class="dp-cta">${d.cta}</a>
            </div>
            <div class="dp-section">
              <h3>Por que nos escolher</h3>
              <div class="dp-grid">
                <div class="dp-card"><div class="ico">★</div>${d.features[0]||'Qualidade'}</div>
                <div class="dp-card"><div class="ico">⚡</div>${d.features[1]||'Agilidade'}</div>
                <div class="dp-card"><div class="ico">♥</div>${d.features[2]||'Confiança'}</div>
              </div>
            </div>
            <div class="dp-cta-section">
              <h3>Pronto para começar?</h3>
              <p>Entre em contato e solicite seu orçamento agora mesmo.</p>
              <a class="dp-cta">${d.cta}</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  $('#demoModal').classList.add('show');
  document.body.style.overflow = 'hidden';
  // Sempre reabre no modo desktop, com o botão certo marcado
  $$('#demoModal .dev').forEach(x => x.classList.remove('active'));
  const desktopBtn = $('#demoModal .dev[data-dev="desktop"]');
  if(desktopBtn) desktopBtn.classList.add('active');

  // Use buttons
  $('#useDemoRef').onclick = () => { toast('Demonstração marcada como referência', 'success'); };
  $('#useDemoProp').onclick = () => {
    if(state.activeBiz) openProposal(state.activeBiz, d);
    else openProposalChooser(d);
  };
}

// Device toggle — vinculado UMA vez só (fora de openDemoPreview).
// Antes disso, cada "Ver demo" adicionava um novo listener nos mesmos
// botões, sem nunca remover o anterior — depois de abrir algumas
// demos, os cliques ficavam acumulados e a página ficava travando.
function bindDeviceToggle(){
  $$('#demoModal .dev').forEach(b => {
    b.addEventListener('click', () => {
      $$('#demoModal .dev').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const stage2 = $('#dBody .preview-stage');
      if(!stage2) return;
      stage2.classList.remove('desktop','tablet','mobile');
      stage2.classList.add(b.dataset.dev);
    });
  });
}

function closeDemo(){
  $('#demoModal').classList.remove('show');
  document.body.style.overflow = '';
  // Limpa o conteúdo (para o iframe/animações imediatamente, em vez
  // de deixar rodando escondido até a próxima demo ser aberta).
  const stage = $('#dBody');
  if(stage) stage.innerHTML = '';
}

function openProposalChooser(d){
  // Pega o primeiro prospect (ou cria um placeholder)
  const first = [...state.prospects.keys()][0];
  if(first){
    const b = SD.BIZ.find(x => x.id===first);
    openProposal(b, d);
  } else {
    toast('Adicione um estabelecimento como potencial cliente primeiro', 'warn');
  }
}

/* ====================================================
   PROPOSTA
   ==================================================== */
function openProposal(b, demo){
  $('#pTitle').textContent = `Proposta para ${b.name}`;

  const types = [
    { key:'landing', label:'Landing Page', desc:'Página única focada em conversão' },
    { key:'site', label:'Site Institucional', desc:'Site completo multi-página' },
    { key:'catalogo', label:'Catálogo', desc:'Catálogo de produtos/serviços' },
    { key:'cardapio', label:'Cardápio Digital', desc:'Cardápio online com pedidos' },
    { key:'servicos', label:'Página de Serviços', desc:'Apresentação de serviços' },
    { key:'comercial', label:'Página Comercial', desc:'Página institucional comercial' },
  ];

  const prices = { landing: 800, site: 1800, catalogo: 1200, cardapio: 1500, servicos: 900, comercial: 700 };
  const dmo = demo || SD.DEMOS.find(d => d.cat===b.cat) || SD.DEMOS[0];

  $('#pBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 320px;gap:24px;">
      <div>
        <h4 style="font-size:14px;margin:0 0 14px;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;">1. Estabelecimento</h4>
        <div class="opp-card" style="margin-bottom:24px;">
          <div class="opp-card-title">
            ${bizIconSvg(b)}
            <div>
              <div style="font-size:16px;">${b.name}</div>
              <div style="font-size:12px;color:var(--text-3);font-weight:400;">${b.subcat} · ${b.bairro} · ${b.dist} km</div>
            </div>
          </div>
        </div>

        <h4 style="font-size:14px;margin:0 0 14px;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;">2. Tipo de projeto</h4>
        <div class="prop-options" id="typeOpts">
          ${types.map((t,i) => `
            <button class="prop-opt ${i===0?'active':''}" data-type="${t.key}">
              <h5>${t.label}</h5>
              <p>${t.desc}</p>
            </button>
          `).join('')}
        </div>

        <h4 style="font-size:14px;margin:24px 0 14px;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;">3. Projeto demo recomendado</h4>
        <div class="opp-card" style="margin-bottom:0;">
          <div class="opp-card-title">
            <div class="demo-mark" style="font-size:14px;line-height:1.1;background:linear-gradient(135deg, ${dmo.palette[1]} 0%, ${dmo.palette[2]} 100%);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800;">${dmo.name}</div>
            <span class="demo-cat">${dmo.seg}</span>
          </div>
          <p style="font-size:13px;color:var(--text-2);margin:8px 0 0;">${dmo.sub}</p>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button class="btn btn-ghost" id="viewDemoBtn" style="flex:1;justify-content:center;">${SVG.search} Visualizar demo</button>
            <button class="btn btn-ghost" id="changeDemoBtn" style="flex:1;justify-content:center;">${SVG.arrow} Trocar projeto</button>
          </div>
        </div>
      </div>

      <div class="prop-preview">
        <h4>📋 Resumo da Proposta</h4>
        <div class="prop-line"><span class="k">Cliente</span><span class="v">${b.name}</span></div>
        <div class="prop-line"><span class="k">Segmento</span><span class="v">${b.subcat}</span></div>
        <div class="prop-line"><span class="k">Bairro</span><span class="v">${b.bairro}</span></div>
        <div class="prop-line"><span class="k">Tipo</span><span class="v" id="propType">Landing Page</span></div>
        <div class="prop-line"><span class="k">Demo</span><span class="v">${dmo.name}</span></div>
        <div class="prop-line"><span class="k">Prazo</span><span class="v">7 dias úteis</span></div>
        <div class="prop-line"><span class="k">Garantia</span><span class="v">30 dias</span></div>
        <div class="prop-total"><span>Total</span><span class="v" id="propTotal">R$ ${prices.landing}</span></div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:18px;">
          <button class="btn btn-primary" id="sendPropBtn" style="justify-content:center;">${SVG.wa} Enviar via WhatsApp</button>
          <button class="btn btn-ghost" id="savePropBtn" style="justify-content:center;">${SVG.bookmark_fill} Salvar como modelo</button>
        </div>
      </div>
    </div>
  `;

  let selectedType = 'landing';

  $$('#typeOpts .prop-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      $$('#typeOpts .prop-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedType = opt.dataset.type;
      $('#propType').textContent = types.find(t => t.key===selectedType).label;
      $('#propTotal').textContent = 'R$ ' + prices[selectedType].toLocaleString('pt-BR');
    });
  });

  $('#viewDemoBtn').onclick = () => openDemoPreview(dmo);
  $('#changeDemoBtn').onclick = () => {
    // Próxima demo
    const idx = SD.DEMOS.findIndex(x => x.id===dmo.id);
    const next = SD.DEMOS[(idx+1) % SD.DEMOS.length];
    openProposal(b, next);
  };
  $('#sendPropBtn').onclick = () => {
    const msg = `Olá! Conforme conversamos, segue a proposta para o ${b.name}:

📋 *Proposta Comercial*
🏢 Cliente: ${b.name}
📍 ${b.bairro}, Curitiba-PR
💼 Tipo: ${types.find(t => t.key===selectedType).label}
🎨 Demo base: ${dmo.name}
⏱ Prazo: 7 dias úteis
💰 Investimento: R$ ${prices[selectedType].toLocaleString('pt-BR')}

Aguardo seu retorno!`;
    const waLink = `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
    toast('Proposta enviada via WhatsApp', 'success');
    if(state.prospects.has(b.id)) setProspectStage(b.id, 'proposta');
  };
  $('#savePropBtn').onclick = () => {
    toast('Modelo de proposta salvo', 'success');
  };

  $('#propModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeProp(){
  $('#propModal').classList.remove('show');
  if(!$('#bizModal').classList.contains('show')) document.body.style.overflow = '';
}

/* ====================================================
   SEARCH SUGGESTIONS / HERO
   ==================================================== */
function bindSearch(){
  const input = $('#searchInput');
  const wrap = $('.search-hero');
  const sug = $('#searchSuggestions');

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if(!q){ sug.classList.remove('show'); return; }
    const matches = SD.SUGGESTIONS.filter(s => s.q.toLowerCase().includes(q.toLowerCase())).slice(0,6);
    if(matches.length === 0){
      // Gera estimativa
      const all = SD.BIZ.filter(b => (b.name+' '+b.subcat+' '+b.bairro).toLowerCase().includes(q.toLowerCase()));
      matches.push({ q, count: all.length });
    }
    sug.innerHTML = matches.map(m => `
      <div class="sg-item" data-q="${m.q}">
        <div class="sg-q">${SVG.search} ${m.q}</div>
        <div class="sg-count">${m.count} ${m.count===1?'resultado':'resultados'}</div>
      </div>
    `).join('');
    sug.classList.add('show');
    sug.querySelectorAll('.sg-item').forEach(it => {
      it.addEventListener('click', () => {
        input.value = it.dataset.q;
        state.query = it.dataset.q;
        sug.classList.remove('show');
        // Interpreta busca
        const f = parseQuery(it.dataset.q);
        state.filters.cats = f.cats;
        state.filters.bairro = f.bairro;
        state.filters.open = f.open;
        state.filters.web = f.web;
        state.filters.ig = f.ig;
        renderFilterCats();
        $('#filterBairro').value = f.bairro;
        $('#filterOpen').checked = f.open;
        $('#filterWeb').checked = f.web;
        $('#filterIg').checked = f.ig;
        applyFilters();
        scrollToExplore();
      });
    });
  });

  input.addEventListener('focus', () => { if(input.value) input.dispatchEvent(new Event('input')); });
  document.addEventListener('click', e => {
    if(!wrap.contains(e.target)) sug.classList.remove('show');
  });

  $('#searchHero').addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if(!q) return;
    state.query = q;
    const f = parseQuery(q);
    state.filters.cats = f.cats;
    state.filters.bairro = f.bairro;
    state.filters.open = f.open;
    state.filters.web = f.web;
    state.filters.ig = f.ig;
    renderFilterCats();
    $('#filterBairro').value = f.bairro;
    $('#filterOpen').checked = f.open;
    $('#filterWeb').checked = f.web;
    $('#filterIg').checked = f.ig;
    applyFilters();
    scrollToExplore();
    sug.classList.remove('show');
  });

  $$('.chip').forEach(c => {
    c.addEventListener('click', () => {
      input.value = c.dataset.q;
      $('#searchHero').dispatchEvent(new Event('submit'));
    });
  });
}

function runSearch(){
  // Quick search from anywhere
  const f = parseQuery(state.query);
  state.filters.cats = f.cats;
  state.filters.bairro = f.bairro;
  state.filters.open = f.open;
  state.filters.web = f.web;
  state.filters.ig = f.ig;
  renderFilterCats();
  $('#filterBairro').value = f.bairro;
  $('#filterOpen').checked = f.open;
  $('#filterWeb').checked = f.web;
  $('#filterIg').checked = f.ig;
  applyFilters();
}

function scrollToExplore(){
  const el = $('#explore');
  if(el) el.scrollIntoView({ behavior:'smooth', block:'start' });
}

/* ====================================================
   VIEW TOGGLE / MOBILE
   ==================================================== */
function bindViewToggle(){
  $$('.vt').forEach(b => {
    b.addEventListener('click', () => {
      const vt = b.dataset.vt;
      state.view = vt;
      $$('.vt').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const layout = $('#splitLayout');
      layout.setAttribute('data-vt', vt);
      setTimeout(() => state.map && state.map.invalidateSize(), 200);
    });
  });
}

/* ====================================================
   NAV / ROUTING
   ==================================================== */
function bindNav(){
  $$('[data-route]').forEach(a => {
    a.addEventListener('click', e => {
      const route = a.dataset.route;
      if(!route) return;
      e.preventDefault();

      // Garantir que está no app
      if(!state.user){ setView('auth'); return; }

      if(route==='home'){
        // "Explorar" — página institucional (missão, visão, time, etc.)
        setView('about');
      }
      else if(route==='explore'){
        // "Mapa" — busca + resultados no mapa
        setView('mapa');
        setTimeout(() => { initMap(); renderMap(); state.map && state.map.invalidateSize(); }, 150);
      }
      else if(route==='demos'){
        // "Templates"
        setView('demos');
      }
      else if(route==='opportunities'){
        // "Oportunidades"
        setView('opportunities');
        renderPipeline();
        updateKpis();
      }
      else if(route==='about'){
        // "Sobre"
        setView('sobre');
      }
    });
  });

  // Mobile menu
  $('#hamburger').addEventListener('click', () => {
    const links = $('#navLinks');
    if(links.style.display==='flex'){
      links.style.display='';
    } else {
      links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:#0a0e1a;border-bottom:1px solid var(--border);padding:14px 20px;gap:4px;';
    }
  });

  // Adicionar negócio
  $('#addBizBtn').addEventListener('click', () => {
    toast('Em breve: adicione seus próprios negócios', 'info');
  });

  // Loc chip
  $('#locChip').addEventListener('click', () => {
    toast('Outras cidades em breve: SP, RJ, MG, RS...', 'info');
  });
}

/* ====================================================
   INIT
   ==================================================== */
function init(){
  renderCategories();
  renderFilterCats();
  renderFilterBairros();
  renderDemos();
  renderResults();
  bindFilterSwitches();
  bindSearch();
  bindViewToggle();
  bindNav();
  bindAuth();
  initAuthParticles();
  bindUserChip();
  applyFilters();

  // Gate: consulta o Supabase para saber se já existe sessão válida
  initAuth();

  // Modal close
  $('#closeModal').addEventListener('click', closeBizModal);
  $('#bizModal').addEventListener('click', e => { if(e.target.id==='bizModal') closeBizModal(); });
  $('#closeProp').addEventListener('click', closeProp);
  $('#propModal').addEventListener('click', e => { if(e.target.id==='propModal') closeProp(); });
  $('#closeDemo').addEventListener('click', closeDemo);
  $('#demoModal').addEventListener('click', e => { if(e.target.id==='demoModal') closeDemo(); });
  bindDeviceToggle();

  // Camada extra de segurança: fecha os modais via delegação de evento
  // no documento inteiro. Funciona mesmo se, por algum motivo (ex: cache
  // de uma versão antiga do JS), a ligação direta acima não pegar.
  document.addEventListener('click', e => {
    if(e.target.closest('#closeDemo')) closeDemo();
    if(e.target.closest('#closeModal')) closeBizModal();
    if(e.target.closest('#closeProp')) closeProp();
  });

  // Nav active
  $$('.nav-link').forEach(l => l.addEventListener('click', () => {
    $$('.nav-link').forEach(x => x.classList.remove('active'));
    l.classList.add('active');
  }));

  // ESC fecha modais
  document.addEventListener('keydown', e => {
    if(e.key==='Escape'){
      closeBizModal();
      closeProp();
      closeDemo();
    }
  });
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
