/* =========================================================
   SEARCH DEEP — Configuração do Supabase
   =========================================================
   1. Crie um projeto grátis em https://supabase.com
   2. Vá em Project Settings > API
   3. Copie a "Project URL" e a "anon public key" e cole abaixo
   4. Em Authentication > URL Configuration, adicione a URL onde
      seu site vai rodar (ex: https://seusite.com) em "Site URL"
      e em "Redirect URLs"
   5. (Opcional) Em Authentication > Providers, ative Google e/ou
      GitHub se quiser usar o login social
   ========================================================= */

const SUPABASE_URL = 'https://mpxdnufogozfhuyiwiiz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qEhFRX6UoGVsBURbBAqthw_7osJ2s2i';

// Cliente global usado em app.js.
// Protegido com try/catch: enquanto as chaves acima não forem
// preenchidas, o site continua funcionando visualmente (mostra a
// tela de login normalmente) só que sem conseguir autenticar de
// verdade — em vez de travar o script inteiro com um erro.
let sb = null;
try{
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}catch(err){
  console.error('Não foi possível criar o cliente Supabase. Preencha js/supabase-config.js com suas chaves.', err);
}
