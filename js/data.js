/* =========================================================
   SEARCH DEEP — Dados Mockados
   Estabelecimentos fictícios, projetos demo, bairros, etc.
   ========================================================= */

const SD = window.SD = window.SD || {};

/* ----------------- CATEGORIAS ----------------- */
SD.CATEGORIES = [
  { key: 'alimentacao',  label: 'Alimentação', icon: 'pizza' },
  { key: 'cafes',        label: 'Cafés',       icon: 'coffee' },
  { key: 'fastfood',     label: 'Fast Food',   icon: 'burger' },
  { key: 'moda',         label: 'Moda',        icon: 'shirt' },
  { key: 'beleza',       label: 'Beleza',      icon: 'scissors' },
  { key: 'fitness',      label: 'Fitness',     icon: 'dumbbell' },
  { key: 'pets',         label: 'Pets',        icon: 'paw' },
  { key: 'automovel',    label: 'Automotivo',  icon: 'car' },
  { key: 'hoteis',       label: 'Hotéis',      icon: 'bed' },
  { key: 'tecnologia',   label: 'Tecnologia',  icon: 'chip' },
  { key: 'comercio',     label: 'Comércio',    icon: 'bag' },
  { key: 'servicos',     label: 'Serviços',    icon: 'tool' },
];

/* ----------------- BAIRROS ----------------- */
SD.NEIGHBORHOODS = [
  'Centro','Batel','Água Verde','Portão','Bigorrilho','Cabral','Juvevê',
  'Rebouças','Mercês','Santa Felicidade','Centro Cívico','Seminário',
  'Cristo Rei','São Francisco','Boa Vista','Ahú','Alto da XV','Jardim Botânico',
  'Tarumã','Cajuru','Hauer','Xaxim','Pilarzinho','São Lourenço','Campina do Siqueira',
  'Bairro Alto','Vista Alegre','Guaíra','Fazendinha'
];

/* ----------------- ESTABELECIMENTOS MOCKADOS (40+) ----------------- */
SD.BIZ = [
  /* ALIMENTAÇÃO - Pizzarias */
  { id:'b01', name:'Pizza House Curitiba', cat:'alimentacao', subcat:'Pizzaria', bairro:'Água Verde', address:'Av. República Argentina, 1500', lat:-25.4520, lng:-49.2920, phone:'(41) 3235-1010', whatsapp:'5541999990101', site:'https://pizzahouse.example.com', ig:'@pizzahouse.cwb', rate:4.8, reviews:1284, hours:'18:00 - 00:00', open:true, price:2, desc:'Pizzaria artesanal com forno a lenha, ingredientes selecionados e ambiente familiar.', opp:'alta', tags:['sem landing','site antigo','instagram ativo'] },
  { id:'b02', name:'Bella Napoli', cat:'alimentacao', subcat:'Pizzaria', bairro:'Batel', address:'R. Dr. Pedrosa, 200', lat:-25.4380, lng:-49.2890, phone:'(41) 3078-2020', whatsapp:'5541999990202', site:null, ig:'@bellanapoli.cwb', rate:4.6, reviews:842, hours:'19:00 - 23:30', open:true, price:2, desc:'Pizzaria napolitana tradicional, massa de fermentação natural de 48h.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b03', name:'Trattoria Forno Vivo', cat:'alimentacao', subcat:'Pizzaria', bairro:'Juvevê', address:'R. Alferes Poli, 1850', lat:-25.4132, lng:-49.2620, phone:'(41) 3232-3030', whatsapp:'5541999990303', site:'https://fornovivo.example.com', ig:'@fornovivo', rate:4.7, reviews:512, hours:'18:30 - 23:00', open:false, price:3, desc:'Cozinha italiana contemporânea com pizzas, massas frescas e carta de vinhos.', opp:'media', tags:['site responsivo','instagram ativo'] },
  { id:'b04', name:'Dom Pizza', cat:'alimentacao', subcat:'Pizzaria', bairro:'Portão', address:'Av. Marechal Floriano, 3200', lat:-25.4780, lng:-49.2930, phone:'(41) 3345-4040', whatsapp:'5541999990404', site:null, ig:null, rate:4.2, reviews:218, hours:'18:00 - 23:00', open:true, price:1, desc:'Pizzaria tradicional com entrega rápida no Portão e bairros próximos.', opp:'alta', tags:['sem site','sem instagram'] },

  /* ALIMENTAÇÃO - Restaurantes */
  { id:'b05', name:'Sabor da Serra', cat:'alimentacao', subcat:'Restaurante', bairro:'Santa Felicidade', address:'R. Manoel Valdomiro de Macedo, 88', lat:-25.4030, lng:-49.3170, phone:'(41) 3272-5050', whatsapp:'5541999990505', site:'https://sabordaserra.example.com', ig:'@sabordaserra', rate:4.9, reviews:2150, hours:'11:30 - 23:00', open:true, price:3, desc:'Restaurante típico de Santa Felicidade, massas italianas e polenta frita.', opp:'media', tags:['site completo','instagram ativo','avaliações altas'] },
  { id:'b06', name:'Mercado do Peixe', cat:'alimentacao', subcat:'Restaurante', bairro:'Cabral', address:'R. Saldanha Marinho, 1500', lat:-25.4180, lng:-49.2680, phone:'(41) 3232-6060', whatsapp:'5541999990606', site:null, ig:'@mercadodopeixe.cwb', rate:4.5, reviews:683, hours:'11:00 - 22:00', open:true, price:3, desc:'Frutos do mar frescos e cozinha litorânea no coração de Curitiba.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b07', name:'Templo da Carne', cat:'alimentacao', subcat:'Churrascaria', bairro:'Bigorrilho', address:'Av. Sete de Setembro, 4500', lat:-25.4350, lng:-49.2820, phone:'(41) 3240-7070', whatsapp:'5541999990707', site:'https://templodacarne.example.com', ig:'@templodacarne', rate:4.7, reviews:1890, hours:'11:30 - 23:30', open:true, price:4, desc:'Carnes nobres, rodízio premium e carta de vinhos selecionados.', opp:'media', tags:['site responsivo','avaliações altas'] },
  { id:'b08', name:'Cantina da Praça', cat:'alimentacao', subcat:'Restaurante', bairro:'Centro', address:'Praça Tiradentes, 50', lat:-25.4280, lng:-49.2730, phone:'(41) 3232-8080', whatsapp:'5541999990808', site:null, ig:'@cantinadapraca', rate:4.4, reviews:432, hours:'11:00 - 22:00', open:true, price:2, desc:'Comida caseira com pegada italiana no centro histórico de Curitiba.', opp:'alta', tags:['sem site'] },
  { id:'b09', name:'Verde Folha Bistrô', cat:'alimentacao', subcat:'Bistrô', bairro:'Jardim Botânico', address:'R. José Roslindo Damaso, 220', lat:-25.4440, lng:-49.2400, phone:'(41) 3078-9090', whatsapp:'5541999990909', site:'https://verdefolha.example.com', ig:'@verdefolha.bistro', rate:4.6, reviews:312, hours:'12:00 - 23:00', open:false, price:3, desc:'Cozinha autoral com ingredientes orgânicos e ambiente acolhedor.', opp:'baixa', tags:['site responsivo'] },

  /* CAFÉS */
  { id:'b10', name:'Coffee Lab CWB', cat:'cafes', subcat:'Cafeteria', bairro:'Batel', address:'R. Comendador Araújo, 360', lat:-25.4385, lng:-49.2870, phone:'(41) 3078-1111', whatsapp:'5541999991111', site:'https://coffeelab.example.com', ig:'@coffeelab.cwb', rate:4.8, reviews:1540, hours:'08:00 - 21:00', open:true, price:2, desc:'Cafeteria specialty com grãos selecionados, métodos de extração e brunch.', opp:'media', tags:['site completo','instagram ativo'] },
  { id:'b11', name:'Bistrô do Café', cat:'cafes', subcat:'Cafeteria', bairro:'Água Verde', address:'R. Desembargador Westphalen, 1100', lat:-25.4540, lng:-49.2880, phone:'(41) 3235-1212', whatsapp:'5541999991212', site:null, ig:'@bistrodocafe', rate:4.5, reviews:287, hours:'07:30 - 20:00', open:true, price:2, desc:'Cafeteria aconchegante com pães artesanais e ambiente para trabalho.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b12', name:'Grão Fino Espresso', cat:'cafes', subcat:'Cafeteria', bairro:'Centro', address:'R. XV de Novembro, 80', lat:-25.4290, lng:-49.2710, phone:'(41) 3232-1313', whatsapp:'5541999991313', site:null, ig:null, rate:4.3, reviews:198, hours:'07:00 - 19:00', open:true, price:1, desc:'Espresso bar tradicional no calçadão de Curitiba.', opp:'alta', tags:['sem site','sem instagram'] },
  { id:'b13', name:'Flor de Café', cat:'cafes', subcat:'Cafeteria', bairro:'Cabral', address:'R. São José dos Pinhais, 230', lat:-25.4150, lng:-49.2650, phone:'(41) 3232-1414', whatsapp:'5541999991414', site:'https://flordecafe.example.com', ig:'@flordecafe.cwb', rate:4.7, reviews:415, hours:'08:00 - 20:00', open:true, price:2, desc:'Cafeteria charmosa com brunch, doces e cafés especiais.', opp:'media', tags:['site simples'] },

  /* FAST FOOD */
  { id:'b14', name:'Burger Lab', cat:'fastfood', subcat:'Hamburgueria', bairro:'Rebouças', address:'R. Alferes Poli, 2100', lat:-25.4160, lng:-49.2650, phone:'(41) 3232-1515', whatsapp:'5541999991515', site:'https://burgerlab.example.com', ig:'@burgerlab.cwb', rate:4.6, reviews:920, hours:'18:00 - 00:00', open:true, price:2, desc:'Hamburgueria artesanal com blend da casa e batatas rústicas.', opp:'media', tags:['site responsivo','instagram ativo'] },
  { id:'b15', name:'Hot Dog do Parque', cat:'fastfood', subcat:'Lanchonete', bairro:'Jardim Botânico', address:'Av. Marechal Hermes, 800', lat:-25.4470, lng:-49.2350, phone:'(41) 3078-1616', whatsapp:'5541999991616', site:null, ig:'@hotdogdoparque', rate:4.4, reviews:355, hours:'17:00 - 23:30', open:true, price:1, desc:'Hot dogs tradicionais com ingredientes selecionados, próximo ao parque.', opp:'alta', tags:['sem site','instagram ativo'] },

  /* MODA */
  { id:'b16', name:'Urban Wear CWB', cat:'moda', subcat:'Loja de Roupas', bairro:'Batel', address:'R. Bispo Dom José, 2150', lat:-25.4360, lng:-49.2910, phone:'(41) 3078-1717', whatsapp:'5541999991717', site:'https://urbanwear.example.com', ig:'@urbanwear.cwb', rate:4.5, reviews:218, hours:'10:00 - 22:00', open:true, price:3, desc:'Loja streetwear com marcas autorais e seleção curada.', opp:'media', tags:['site responsivo','instagram ativo'] },
  { id:'b17', name:'Atelier da Moda', cat:'moda', subcat:'Brechó', bairro:'Centro', address:'R. São Francisco, 320', lat:-25.4250, lng:-49.2720, phone:'(41) 3232-1818', whatsapp:'5541999991818', site:null, ig:'@ateliermodacwb', rate:4.7, reviews:142, hours:'11:00 - 19:00', open:true, price:2, desc:'Brechó com peças selecionadas, vintage e marcas autorais.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b18', name:'Boutique Feminina', cat:'moda', subcat:'Boutique', bairro:'Água Verde', address:'Av. República Argentina, 2200', lat:-25.4500, lng:-49.2950, phone:'(41) 3235-1919', whatsapp:'5541999991919', site:'https://boutiquefem.example.com', ig:'@boutique.fem', rate:4.6, reviews:267, hours:'10:00 - 20:00', open:true, price:3, desc:'Boutique com peças exclusivas, marcas nacionais e internacionais.', opp:'media', tags:['site responsivo'] },

  /* BELEZA */
  { id:'b19', name:'Barber Club Premium', cat:'beleza', subcat:'Barbearia', bairro:'Batel', address:'R. Vol. da Pátria, 520', lat:-25.4400, lng:-49.2900, phone:'(41) 3078-2020', whatsapp:'5541999992020', site:'https://barberclub.example.com', ig:'@barberclub.cwb', rate:4.9, reviews:1480, hours:'09:00 - 21:00', open:true, price:3, desc:'Barbearia premium com ambiente moderno, serviços completos e drinks.', opp:'media', tags:['site completo','instagram ativo'] },
  { id:'b20', name:'Barbearia do Bairro', cat:'beleza', subcat:'Barbearia', bairro:'Portão', address:'R. Waldemar Loureiro Campos, 1900', lat:-25.4760, lng:-49.2950, phone:'(41) 3345-2121', whatsapp:'5541999992121', site:null, ig:'@barbeariadobairro', rate:4.6, reviews:198, hours:'09:00 - 20:00', open:true, price:1, desc:'Barbearia tradicional, atendimento familiar e cortes clássicos.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b21', name:'Salão Glow', cat:'beleza', subcat:'Salão', bairro:'Cabral', address:'R. Amazonas, 1500', lat:-25.4180, lng:-49.2700, phone:'(41) 3232-2222', whatsapp:'5541999992222', site:null, ig:'@salao.glow', rate:4.7, reviews:312, hours:'09:00 - 20:00', open:true, price:2, desc:'Salão de beleza com serviços completos, estética e coloração.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b22', name:'Studio Hair', cat:'beleza', subcat:'Salão', bairro:'Bigorrilho', address:'R. Padre Anchieta, 1850', lat:-25.4320, lng:-49.2840, phone:'(41) 3240-2323', whatsapp:'5541999992323', site:'https://studiohair.example.com', ig:'@studiohair.cwb', rate:4.5, reviews:245, hours:'09:00 - 21:00', open:true, price:3, desc:'Studio hair com profissionais especializados em cortes e coloração.', opp:'media', tags:['site responsivo'] },

  /* FITNESS */
  { id:'b23', name:'FitCore Academia', cat:'fitness', subcat:'Academia', bairro:'Bigorrilho', address:'Av. Sete de Setembro, 5200', lat:-25.4340, lng:-49.2780, phone:'(41) 3240-2424', whatsapp:'5541999992424', site:'https://fitcore.example.com', ig:'@fitcore.cwb', rate:4.7, reviews:680, hours:'05:00 - 23:00', open:true, price:3, desc:'Academia completa, musculação, aulas coletivas e personal training.', opp:'media', tags:['site responsivo','instagram ativo'] },
  { id:'b24', name:'CrossBox CWB', cat:'fitness', subcat:'Crossfit', bairro:'Juvevê', address:'R. Augusto Stresser, 1500', lat:-25.4140, lng:-49.2600, phone:'(41) 3232-2525', whatsapp:'5541999992525', site:null, ig:'@crossboxcwb', rate:4.9, reviews:412, hours:'06:00 - 21:00', open:true, price:3, desc:'Box de cross training com coaches certificados e comunidade forte.', opp:'alta', tags:['sem site','instagram ativo','comunidade engajada'] },
  { id:'b25', name:'Pilates Studio', cat:'fitness', subcat:'Pilates', bairro:'Água Verde', address:'R. Petit Carneiro, 1200', lat:-25.4520, lng:-49.2900, phone:'(41) 3235-2626', whatsapp:'5541999992626', site:'https://pilatesstudio.example.com', ig:'@pilates.cwb', rate:4.8, reviews:218, hours:'07:00 - 21:00', open:true, price:3, desc:'Studio de pilates com equipamentos modernos e aulas individuais.', opp:'baixa', tags:['site responsivo'] },

  /* PETS */
  { id:'b26', name:'Pet Shop Amigo Fiel', cat:'pets', subcat:'Pet Shop', bairro:'Portão', address:'R. Carlos Dietzsch, 3500', lat:-25.4800, lng:-49.2900, phone:'(41) 3345-2727', whatsapp:'5541999992727', site:null, ig:'@petamigofiel', rate:4.7, reviews:520, hours:'08:00 - 20:00', open:true, price:2, desc:'Pet shop com banho, tosa, veterinária e produtos premium.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b27', name:'Cão & Gato Centro', cat:'pets', subcat:'Pet Shop', bairro:'Centro', address:'R. Barão do Rio Branco, 220', lat:-25.4260, lng:-49.2720, phone:'(41) 3232-2828', whatsapp:'5541999992828', site:'https://caogato.example.com', ig:'@caogato.centro', rate:4.4, reviews:186, hours:'09:00 - 19:00', open:true, price:1, desc:'Pet shop tradicional com ração, banho, tosa e acessórios.', opp:'media', tags:['site simples'] },
  { id:'b28', name:'Hotel Pet Premium', cat:'pets', subcat:'Hotel Pet', bairro:'Jardim Botânico', address:'R. Frederico Maurer, 1500', lat:-25.4450, lng:-49.2380, phone:'(41) 3078-2929', whatsapp:'5541999992929', site:null, ig:'@hotelpetpremium', rate:4.9, reviews:298, hours:'24h', open:true, price:4, desc:'Hotel pet com câmeras ao vivo, piscina, playground e veterinária.', opp:'alta', tags:['sem site','instagram ativo','recurso premium'] },

  /* AUTOMOTIVO */
  { id:'b29', name:'Prime Auto Center', cat:'automovel', subcat:'Oficina', bairro:'Portão', address:'Av. Marechal Floriano, 4500', lat:-25.4810, lng:-49.2950, phone:'(41) 3345-3030', whatsapp:'5541999993030', site:'https://primeauto.example.com', ig:'@primeautocwb', rate:4.6, reviews:340, hours:'08:00 - 18:00', open:true, price:3, desc:'Centro automotivo com mecânica geral, elétrica, alinhamento e balanceamento.', opp:'media', tags:['site responsivo'] },
  { id:'b30', name:'Moto Garage', cat:'automovel', subcat:'Oficina', bairro:'Rebouças', address:'R. Euclides da Cunha, 1200', lat:-25.4180, lng:-49.2700, phone:'(41) 3232-3131', whatsapp:'5541999993131', site:null, ig:'@motogarage.cwb', rate:4.7, reviews:215, hours:'09:00 - 18:00', open:false, price:2, desc:'Oficina especializada em motos, manutenção preventiva e customização.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b31', name:'Lava Car Premium', cat:'automovel', subcat:'Lava Car', bairro:'Batel', address:'R. Padre Agostinho, 2000', lat:-25.4380, lng:-49.2880, phone:'(41) 3078-3232', whatsapp:'5541999993232', site:null, ig:'@lavacarpremium', rate:4.5, reviews:178, hours:'08:00 - 19:00', open:true, price:2, desc:'Lava car com polimento, vitrificação, higienização interna e detailing.', opp:'alta', tags:['sem site','instagram ativo'] },

  /* HOTÉIS */
  { id:'b32', name:'Hotel Batel Soho', cat:'hoteis', subcat:'Hotel', bairro:'Batel', address:'R. Carlos de Carvalho, 1700', lat:-25.4370, lng:-49.2890, phone:'(41) 3078-3333', whatsapp:'5541999993333', site:'https://batelsoho.example.com', ig:'@batelsoho', rate:4.7, reviews:1280, hours:'24h', open:true, price:4, desc:'Hotel boutique no coração do Batel, com rooftop e café da manhã.', opp:'baixa', tags:['site completo','instagram ativo','avaliações altas'] },
  { id:'b33', name:'Pousada Jardim', cat:'hoteis', subcat:'Pousada', bairro:'Jardim Botânico', address:'Av. Munhoz da Rocha, 1200', lat:-25.4480, lng:-49.2420, phone:'(41) 3078-3434', whatsapp:'5541999993434', site:null, ig:'@pousadajardim', rate:4.8, reviews:412, hours:'24h', open:true, price:3, desc:'Pousada charmosa próxima ao Jardim Botânico, com café colonial.', opp:'alta', tags:['sem site','instagram ativo'] },

  /* TECNOLOGIA */
  { id:'b34', name:'Tech Fix Curitiba', cat:'tecnologia', subcat:'Assistência Técnica', bairro:'Centro', address:'R. Marechal Deodoro, 500', lat:-25.4280, lng:-49.2730, phone:'(41) 3232-3535', whatsapp:'5541999993535', site:'https://techfix.example.com', ig:'@techfix.cwb', rate:4.6, reviews:520, hours:'09:00 - 19:00', open:true, price:2, desc:'Assistência técnica especializada em smartphones, notebooks e consoles.', opp:'media', tags:['site responsivo'] },
  { id:'b35', name:'MacCenter', cat:'tecnologia', subcat:'Loja de Informática', bairro:'Batel', address:'R. Brigadeiro Franco, 1800', lat:-25.4350, lng:-49.2860, phone:'(41) 3078-3636', whatsapp:'5541999993636', site:'https://maccenter.example.com', ig:'@maccenter.cwb', rate:4.7, reviews:298, hours:'10:00 - 20:00', open:true, price:3, desc:'Loja especializada em Apple, acessórios e serviços premium.', opp:'baixa', tags:['site completo'] },

  /* COMÉRCIO */
  { id:'b36', name:'Floricultura Primavera', cat:'comercio', subcat:'Floricultura', bairro:'Cabral', address:'R. Itupava, 1600', lat:-25.4170, lng:-49.2700, phone:'(41) 3232-3737', whatsapp:'5541999993737', site:null, ig:'@floriculturaprimavera', rate:4.8, reviews:312, hours:'08:00 - 19:00', open:true, price:2, desc:'Floricultura com arranjos, buquês, decoração de eventos e delivery.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b37', name:'Papelaria Criativa', cat:'comercio', subcat:'Papelaria', bairro:'Centro', address:'R. Voluntários da Pátria, 380', lat:-25.4270, lng:-49.2730, phone:'(41) 3232-3838', whatsapp:'5541999993838', site:'https://papelariacriativa.example.com', ig:'@papelaria.criativa', rate:4.5, reviews:142, hours:'09:00 - 18:00', open:true, price:2, desc:'Papelaria com materiais escolares, escritório, arte e presentes.', opp:'media', tags:['site simples'] },

  /* SERVIÇOS */
  { id:'b38', name:'Lavanderia Express', cat:'servicos', subcat:'Lavanderia', bairro:'Água Verde', address:'Av. República Argentina, 800', lat:-25.4500, lng:-49.2880, phone:'(41) 3235-3939', whatsapp:'5541999993939', site:null, ig:'@lavanderiaexpress', rate:4.4, reviews:88, hours:'07:00 - 21:00', open:true, price:1, desc:'Lavanderia self-service e completa, com entrega em 24h.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b39', name:'Chaveiro 24h', cat:'servicos', subcat:'Chaveiro', bairro:'Centro', address:'R. Barão do Rio Branco, 600', lat:-25.4260, lng:-49.2720, phone:'(41) 3232-4040', whatsapp:'5541999994040', site:null, ig:null, rate:4.3, reviews:62, hours:'24h', open:true, price:1, desc:'Chaveiro 24h, cópias, abertura de veículos e cofres.', opp:'alta', tags:['sem site','sem instagram'] },
  { id:'b40', name:'Consultório Vida', cat:'servicos', subcat:'Clínica', bairro:'Juvevê', address:'R. Visconde de Guarapuava, 3500', lat:-25.4140, lng:-49.2620, phone:'(41) 3232-4141', whatsapp:'5541999994141', site:'https://consultoriovida.example.com', ig:'@consultoriovida', rate:4.9, reviews:520, hours:'08:00 - 19:00', open:true, price:4, desc:'Clínica multidisciplinar com várias especialidades e convênios.', opp:'baixa', tags:['site completo'] },
  { id:'b41', name:'Estúdio Yoga CWB', cat:'servicos', subcat:'Estúdio', bairro:'Jardim Botânico', address:'R. Dr. Aluísio França, 850', lat:-25.4440, lng:-49.2400, phone:'(41) 3078-4242', whatsapp:'5541999994242', site:null, ig:'@yoga.cwb', rate:4.8, reviews:178, hours:'06:00 - 21:00', open:true, price:2, desc:'Estúdio de yoga e meditação, aulas para iniciantes e avançados.', opp:'alta', tags:['sem site','instagram ativo'] },
  { id:'b42', name:'Padaria Trigo de Ouro', cat:'alimentacao', subcat:'Padaria', bairro:'Portão', address:'R. João Bettega, 2200', lat:-25.4790, lng:-49.2900, phone:'(41) 3345-4343', whatsapp:'5541999994343', site:null, ig:'@padariatrigo', rate:4.6, reviews:412, hours:'06:00 - 21:00', open:true, price:1, desc:'Padaria artesanal com pães, bolos, cafés e almoço executivo.', opp:'alta', tags:['sem site','instagram ativo'] },
];

/* Helper: distância aprox. ao Centro de Curitiba (Praça Tiradentes) */
const CENTER = { lat: -25.4280, lng: -49.2730 };
SD.BIZ.forEach(b => {
  const dLat = (b.lat - CENTER.lat) * 111;
  const dLng = (b.lng - CENTER.lng) * 111 * Math.cos(b.lat * Math.PI/180);
  b.dist = Math.round(Math.sqrt(dLat*dLat + dLng*dLng) * 10) / 10;
});

/* ----------------- PROJETOS DEMO ----------------- */
SD.DEMOS = [
  { id:'d01', name:'Pizza House', cat:'alimentacao', seg:'Pizzaria', palette:['#0a0e1a','#0ea5e9','#f97316','#ffffff'], headline:'Sabor que conquista. Pediu, chegou.', sub:'A pizza artesanal mais pedida de Curitiba agora com delivery rápido.', cta:'Pedir agora', features:['Cardápio digital','Pedido online','Reservas','Landing page de alta conversão'] },
  { id:'d02', name:'Urban Wear', cat:'moda', seg:'Streetwear', palette:['#0a0e1a','#a855f7','#22d3ee','#ffffff'], headline:'Estilo que se veste de atitude.', sub:'Streetwear curado, marcas autorais e lançamentos exclusivos.', cta:'Ver coleção', features:['Catálogo de produtos','Lookbook','Newsletter','Loja integrada'] },
  { id:'d03', name:'Barber Club', cat:'beleza', seg:'Barbearia', palette:['#0a0e1a','#f59e0b','#1e293b','#ffffff'], headline:'Corte, barba e atitude.', sub:'A barbearia premium de Curitiba. Agende seu horário online.', cta:'Agendar', features:['Agendamento online','Galeria de cortes','Planos mensais','Loyalty program'] },
  { id:'d04', name:'Coffee Lab', cat:'cafes', seg:'Cafeteria', palette:['#0a0e1a','#b45309','#fef3c7','#ffffff'], headline:'Café de verdade. Sabor de origem.', sub:'Grãos selecionados, métodos de extração e brunch todos os dias.', cta:'Ver cardápio', features:['Cardápio digital','Reservas','Delivery','Loyalty program'] },
  { id:'d05', name:'Prime Auto', cat:'automovel', seg:'Centro Automotivo', palette:['#0a0e1a','#dc2626','#0f172a','#ffffff'], headline:'Cuidado premium para o seu carro.', sub:'Mecânica geral, alinhamento, balanceamento e estética automotiva.', cta:'Agendar revisão', features:['Agendamento online','Tabela de serviços','Orçamento rápido','Acompanhamento por SMS'] },
  { id:'d06', name:'FitCore', cat:'fitness', seg:'Academia', palette:['#0a0e1a','#10b981','#020617','#ffffff'], headline:'Treine. Evolua. Supere.', sub:'Academia completa com musculação, aulas coletivas e personal.', cta:'Matricule-se', features:['Planos e preços','Agendamento de aulas','Galeria','Plano trial'] },
  { id:'d07', name:'Pet Amigo', cat:'pets', seg:'Pet Shop', palette:['#0a0e1a','#f97316','#fff7ed','#ffffff'], headline:'Cuidando de quem você ama.', sub:'Banho, tosa, veterinária e produtos premium para seu pet.', cta:'Agendar', features:['Agendamento online','Tabela de serviços','Veterinária 24h','Delivery de ração'] },
  { id:'d08', name:'Yoga CWB', cat:'servicos', seg:'Estúdio de Yoga', palette:['#0a0e1a','#14b8a6','#fafafa','#ffffff'], headline:'Respire. Movimente. Conecte-se.', sub:'Aulas de yoga, meditação e bem-estar para todas as idades.', cta:'Aula experimental', features:['Agenda de aulas','Planos','Galeria','Professores'] },
  { id:'d09', name:'Floricultura Primavera', cat:'comercio', seg:'Floricultura', palette:['#0a0e1a','#ec4899','#fce7f3','#ffffff'], headline:'Flores para todos os momentos.', sub:'Arranjos, buquês, decoração de eventos e delivery para toda Curitiba.', cta:'Fazer pedido', features:['Catálogo','Pedido online','Eventos','Delivery'] },
  { id:'d10', name:'Hotel Batel Soho', cat:'hoteis', seg:'Hotel Boutique', palette:['#0a0e1a','#d4af37','#fafafa','#ffffff'], headline:'Sofisticação no coração do Batel.', sub:'Hotel boutique com rooftop, café da manhã e experiência premium.', cta:'Reservar', features:['Reserva online','Quartos','Galeria','Pacotes'] },
];

/* ----------------- ESTADOS DE PIPELINE ----------------- */
SD.PIPELINE_STAGES = [
  { key:'novo', label:'Novo' },
  { key:'interessado', label:'Interessado' },
  { key:'contato', label:'Contato realizado' },
  { key:'proposta', label:'Proposta enviada' },
  { key:'negociacao', label:'Em negociação' },
  { key:'cliente', label:'Cliente' },
  { key:'sem_interesse', label:'Sem interesse' },
];

/* ----------------- SUGESTÕES ----------------- */
SD.SUGGESTIONS = [
  { q:'pizzarias', count:8 },
  { q:'pizzarias no Batel', count:3 },
  { q:'pizzarias próximas', count:5 },
  { q:'barbearias', count:6 },
  { q:'academias', count:5 },
  { q:'restaurantes abertos agora', count:12 },
  { q:'cafeterias no Centro', count:4 },
  { q:'pet shops', count:5 },
  { q:'oficinas no Portão', count:3 },
  { q:'hotéis no Batel', count:2 },
];

/* ----------------- MENSAGEM WHATSAPP PADRÃO ----------------- */
SD.WA_DEFAULT = (name) => `Olá! Tudo bem? Encontrei o ${name} aqui no Search Deep e gostei bastante do trabalho de vocês. Trabalho com criação de landing pages e experiências digitais para negócios locais e acredito que poderia criar algo interessante para a empresa. Posso te enviar uma proposta rápida?`;

/* ----------------- CATEGORIAS INFO ----------------- */
SD.CAT_INFO = (key) => SD.CATEGORIES.find(c => c.key === key);
