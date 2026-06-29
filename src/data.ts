import { Show, DaySchedule, SongRequest, NewsItem, AdBanner } from './types';

export const WEEKDAY_SCHEDULE: Show[] = [
  {
    id: 'wd1',
    title: 'Madrugada Kizomba',
    timeStart: '00:00',
    timeEnd: '06:00',
    description: 'Os ritmos mais sensuais e envolventes para aquecer a sua madrugada.',
    tag: 'Kizomba',
    hosts: ['DJ Madrugada']
  },
  {
    id: 'wd2',
    title: 'Bom Dia África',
    timeStart: '06:00',
    timeEnd: '10:00',
    description: 'Desperte com energia positiva, notícias da manhã e o melhor ritmo africano.',
    tag: 'Matinal / Cultura',
    hosts: ['António Silva', 'Cláudia Tomás']
  },
  {
    id: 'wd3',
    title: 'Raízes de Angola',
    timeStart: '10:00',
    timeEnd: '13:00',
    description: 'Uma viagem profunda pela nossa identidade cultural, música tradicional, Semba e folclore.',
    tag: 'Cultura / Tradicional',
    hosts: ['Mestre Cabinda']
  },
  {
    id: 'wd4',
    title: 'Túnel do Tempo',
    timeStart: '13:00',
    timeEnd: '14:00',
    description: 'Recorde os clássicos inesquecíveis que marcaram gerações em Angola e no mundo.',
    tag: 'Clássicos',
    hosts: ['Augusto Neto']
  },
  {
    id: 'wd5',
    title: 'Vibração da Tarde',
    timeStart: '14:00',
    timeEnd: '18:00',
    description: 'Tardes cheias de ritmo, notícias de entretenimento e muita interatividade.',
    tag: 'Entretenimento / Hits',
    hosts: ['Yola Semedo', 'DJ VIP']
  },
  {
    id: 'wd6',
    title: 'Paixão Sem Fronteira',
    timeStart: '18:00',
    timeEnd: '20:00',
    description: 'Músicas românticas, dedicatórias de amor e mensagens emocionantes para embalar o seu fim de tarde.',
    tag: 'Romântico / Kizomba',
    hosts: ['Sílvia Cardoso']
  },
  {
    id: 'wd7',
    title: 'Noites Sem Fronteiras',
    timeStart: '20:00',
    timeEnd: '24:00', // represented as 23:59 inside calculation, but display as 00:00
    description: 'A melhor seleção de música lusófona e internacional para terminar o seu dia em grande.',
    tag: 'Nocturno',
    hosts: ['Nuno Santos']
  }
];

export const SATURDAY_SCHEDULE: Show[] = [
  {
    id: 'sat1',
    title: 'Top 50 da Semana',
    timeStart: '08:00',
    timeEnd: '13:00',
    description: 'A contagem decrescente dos 50 maiores sucessos musicais que estão a bombar nas paradas.',
    tag: 'Hits / Charts',
    hosts: ['DJ Top Angola']
  },
  {
    id: 'sat2',
    title: 'Mix DJ Convidado',
    timeStart: '14:00',
    timeEnd: '18:00',
    description: 'Sessões exclusivas de mixagem ao vivo com os melhores DJs convidados de Angola.',
    tag: 'Electronic / Afrobeats / House',
    hosts: ['DJs de Renome']
  },
  {
    id: 'sat3',
    title: 'Entrevistas',
    timeStart: '18:00',
    timeEnd: '21:00',
    description: 'Conversas descontraídas e reveladoras com artistas, músicos e personalidades da nossa cultura.',
    tag: 'Talk Show',
    hosts: ['Carlos Miguel']
  }
];

export const SUNDAY_SCHEDULE: Show[] = [
  {
    id: 'sun1',
    title: 'Clássicos da Kizomba',
    timeStart: '09:00',
    timeEnd: '13:00',
    description: 'O melhor da Kizomba do antigamente, relembrando os grandes compositores e passos de dança.',
    tag: 'Kizomba Retro',
    hosts: ['Ti Mateus']
  },
  {
    id: 'sun2',
    title: 'Música Gospel (Louvor Sem Fronteiras)',
    timeStart: '13:00',
    timeEnd: '17:00',
    description: 'Momentos especiais de louvor, adoração, reflexão espiritual e música gospel nacional e internacional.',
    tag: 'Gospel / Espiritualidade',
    hosts: ['Irmã Conceição']
  },
  {
    id: 'sun3',
    title: 'Histórias dos Artistas',
    timeStart: '17:00',
    timeEnd: '21:00',
    description: 'A biografia, os desafios e o percurso de sucesso dos maiores ícones da música angolana.',
    tag: 'Biografia / Documentário',
    hosts: ['Dr. Manuel Cordeiro']
  }
];

export const ABOUT_TEXTS = {
  title: 'TRS Rádio Online',
  subtitle: 'A Música Sem Fronteiras — de Angola para o mundo.',
  whoWeAre: 'A TRS Rádio Online é uma estação digital angolana dedicada à promoção da música, da cultura e do entretenimento para ouvintes em Angola e em qualquer parte do mundo.\n\nCom uma programação diversificada, oferecemos conteúdos que atravessam diferentes estilos, épocas e culturas musicais. Das primeiras horas do dia com Bom Dia África, aos ritmos envolventes de Kizomba Sem Parar e Conexão Latina, passando pela riqueza cultural de Raízes de Angola, pelos grandes clássicos de Túnel do Tempo e pelas emoções de Paixão Sem Fronteira, a nossa missão é proporcionar uma experiência única aos nossos ouvintes.\n\nAtravés de Estrelas Sem Fronteiras, aproximamos o público de artistas, músicos e personalidades de destaque, promovendo entrevistas e conversas inspiradoras. Em Louvor Sem Fronteiras, reservamos um espaço especial para a espiritualidade, a reflexão e a música gospel.\n\nAs tardes ganham vida com Vibrações da Tarde, enquanto Noites de Sucesso reúne os grandes êxitos que marcaram gerações e continuam a animar os amantes da boa música.\n\nAlém do entretenimento, a TRS Rádio Online é também uma plataforma de promoção para empresas, empreendedores, artistas e instituições através do nosso Espaço Publicitário, criando oportunidades para marcas que desejam crescer e alcançar novos públicos.\n\nMais do que uma rádio, somos um ponto de encontro entre culturas, sons e emoções.',
  mission: 'Levar música, cultura, informação e entretenimento de qualidade aos nossos ouvintes, promovendo a diversidade e valorizando a identidade cultural angolana.',
  vision: 'Ser uma referência da rádio digital em Angola e no espaço lusófono, ligando pessoas através da música e da comunicação.',
  slogan: 'TRS Rádio Online – A Música Sem Fronteiras.',
  footerNote: 'De Angola para o mundo, uma rádio feita para quem vive a música.',
  phone: '+244 926 874 444',
  whatsappUrl: 'https://wa.me/244926874444',
  email: 'contacto@trsradioonline.com', // Realistic fallback contact point
  address: 'Luanda, Angola'
};

export const ADVERTISING_DATA = {
  description: 'A TRS Rádio Online está aberta a novas oportunidades de publicidade e parcerias estratégicas. Divulgamos marcas, empresas, produtos, serviços, eventos e projetos para ouvintes em Angola e em várias partes do mundo através da internet.',
  offers: [
    'Spots publicitários na programação diária',
    'Divulgagem de eventos e campanhas promocionais',
    'Entrevistas e reportagens especiais',
    'Publicidade nas redes sociais da rádio',
    'Parcerias de intercâmbio de conteúdos e notícias',
    'Cobertura mediática de atividades culturais e empresariais'
  ],
  partnerships: [
    'Empresas e empreendedores',
    'Instituições públicas e privadas',
    'Associações culturais e desportivas',
    'Artistas, DJs e produtores',
    'Rádios nacionais e internacionais'
  ]
};

export const INITIAL_SONG_REQUESTS: SongRequest[] = [
  {
    id: 'req1',
    sender: 'Marcos Almeida',
    song: 'Te Amo',
    artist: 'Anselmo Ralph',
    message: 'Quero mandar esta música para a minha namorada Paula, que está em Benguela nos ouvindo!',
    timestamp: 'Hoje, 14:32',
    likes: 8
  },
  {
    id: 'req2',
    sender: 'Sílvia Costa',
    song: 'Lamento Angolano',
    artist: 'Ruy Mingas',
    message: 'Esta vai para o meu avô em Luanda, um clássico da nossa terra!',
    timestamp: 'Hoje, 13:10',
    likes: 12
  },
  {
    id: 'req3',
    sender: 'Carlos Jorge',
    song: 'Minha Alva',
    artist: 'Yola Semedo',
    message: 'Estou sintonizado desde Lisboa, saudades da minha banda!',
    timestamp: 'Hoje, 11:45',
    likes: 5
  },
  {
    id: 'req4',
    sender: 'Irene de Jesus',
    song: 'Segredos',
    artist: 'C4 Pedro',
    message: 'Melhor rádio! Toca essa para animar o meu trabalho aqui no Kilamba.',
    timestamp: 'Hoje, 10:15',
    likes: 15
  }
];

export const NEWS_DATA: NewsItem[] = [
  {
    id: 'news1',
    title: 'Festival Internacional de Ritmos em Luanda atrai milhares de fãs de Kizomba e Semba',
    excerpt: 'O festival anual regressou em grande estilo na Baía de Luanda, reunindo os maiores nomes nacionais e internacionais da música africana.',
    content: 'O Festival Internacional de Ritmos de Luanda superou todas as expectativas este fim de semana, com mais de 50 mil espetadores a preencherem a icónica Baía de Luanda. O evento, que celebra a riqueza dos ritmos angolanos, contou com atuações memoráveis de grandes nomes como Anselmo Ralph, Yola Semedo, e jovens talentos do Semba contemporâneo.\n\nDurante três dias de festa, os ritmos da Kizomba, do Semba, do Kuduro e do Afro-house ecoaram pela capital angolana, mostrando a força e a vitalidade da nossa identidade cultural. Além dos palcos principais, o certame ofereceu feiras gastronómicas, workshops de dança tradicional, e espaços interativos para novos artistas divulgarem as suas obras digitais.',
    category: 'Eventos',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
    date: '29 Jun 2026',
    views: 1240,
    author: 'Equipa TRS'
  },
  {
    id: 'news2',
    title: 'Novo álbum de Anselmo Ralph bate recordes de reprodução digital',
    excerpt: 'O novo trabalho discográfico do consagrado músico angolano conquistou o topo das tabelas em Angola, Portugal e Moçambique.',
    content: 'Anselmo Ralph voltou a fazer história na música lusófona. Lançado na passada sexta-feira, o seu mais recente álbum de originais alcançou o primeiro lugar de reproduções nas plataformas digitais mais conhecidas (Spotify, Apple Music e YouTube) em menos de 24 horas.\n\nComposto por 12 faixas românticas repletas de colaborações internacionais fantásticas, o álbum funde com mestria a Kizomba tradicional com sonoridades Pop modernas. Numa entrevista exclusiva concedida aos microfones da TRS Rádio Online, o cantor agradeceu o apoio fervoroso de todos os ouvintes: "Este disco é uma carta de amor dedicada aos meus fãs de Angola e de todo o mundo. Sem vocês, nada disto seria possível."',
    category: 'Música',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60',
    date: '28 Jun 2026',
    views: 3820,
    author: 'António Silva'
  },
  {
    id: 'news3',
    title: 'Kizomba e Semba propostos para património cultural imaterial pela UNESCO',
    excerpt: 'O Ministério da Cultura e Turismo angolano oficializou a candidatura destes ritmos que definem a alma e a dança de Angola.',
    content: 'A dança e os ritmos da Kizomba e do Semba deram um passo crucial rumo ao reconhecimento global. Numa iniciativa liderada pelo Ministério da Cultura, foi formalizada junto da UNESCO a candidatura destas manifestações artísticas a Património Cultural Imaterial da Humanidade.\n\nEspecialistas afirmam que este marco trará enormes incentivos para a salvaguarda das tradições locais, dinamizando a economia criativa de Angola. A nível mundial, a Kizomba transformou-se num fenómeno sem fronteiras, com escolas de dança em locais tão diversos como Tóquio, Paris, Nova Iorque e Berlim, todas unidas pela magia do gingado angolano.',
    category: 'Cultura',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=60',
    date: '26 Jun 2026',
    views: 940,
    author: 'Cláudia Tomás'
  },
  {
    id: 'news4',
    title: 'Gospel em Destaque: Festival Louvor Sem Fronteiras enche pavilhão em Luanda',
    excerpt: 'O encontro anual de adoração espiritual reuniu centenas de coros e vozes num momento único de fé e comunhão fraterna.',
    content: 'Num final de tarde inesquecível de adoração, o Festival Louvor Sem Fronteiras reuniu mais de 10 mil cristãos num dos principais pavilhões multiusos de Luanda. O evento contou com participações notáveis de coros regionais, cantores consagrados e testemunhos inspiradores.\n\nPara a Irmã Conceição, locutora da TRS Rádio Online, o festival representa a união perfeita da música com a espiritualidade profunda: "A música gospel tem o poder único de curar corações e aproximar as pessoas independentemente da sua origem ou dificuldades."',
    category: 'Eventos',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=60',
    date: '25 Jun 2026',
    views: 1560,
    author: 'Irmã Conceição'
  }
];

export const ADS_DATA: AdBanner[] = [
  {
    id: 'ad1',
    client: 'Kero Supermercados',
    title: 'Super Fim de Semana Kero!',
    tagline: 'Descontos imbatíveis de até 30% em todos os frescos, talho e mercearia. Venha abastecer a despensa da sua família com qualidade extrema!',
    category: 'Supermercados / Distribuição',
    ctaText: 'Ver Folheto de Ofertas',
    ctaLink: 'https://wa.me/244926874444?text=Quero%20saber%20as%20promocoes%20do%20Kero',
    gradient: 'linear-gradient(135deg, #0f172a, #d97706, #1e293b)'
  },
  {
    id: 'ad2',
    client: 'Unitel Angola',
    title: 'Internet Mais Rápida de Angola!',
    tagline: 'Partilhe os seus momentos, ouça a TRS Rádio Online sem interrupções com os novos pacotes Net Ultra. Conectividade que une todos os angolanos.',
    category: 'Telecomunicações',
    ctaText: 'Aderir ao Plano Net',
    ctaLink: 'https://wa.me/244926874444?text=Quero%20saber%20mais%20sobre%20pacotes%20Unitel',
    gradient: 'linear-gradient(135deg, #0f172a, #dc2626, #1e293b)'
  },
  {
    id: 'ad3',
    client: 'Banco BAI',
    title: 'Crédito Habitação Jovem BAI',
    tagline: 'A oportunidade perfeita de conquistar a sua casa própria com juros bonificados e as melhores condições de financiamento do mercado.',
    category: 'Banca / Finanças',
    ctaText: 'Simular Crédito',
    ctaLink: 'https://wa.me/244926874444?text=Quero%20informacoes%20sobre%20Credito%20Habitacao%20BAI',
    gradient: 'linear-gradient(135deg, #1e1b4b, #4f46e5, #0f172a)'
  },
  {
    id: 'ad4',
    client: 'Kwanza Sul Logística',
    title: 'Entregas Rápidas Luanda-Cabinda',
    tagline: 'Conectamos a sua mercadoria, produtos e fardas ao interior de Angola em tempo recorde com segurança total garantida por via aérea ou terrestre.',
    category: 'Transportes / Logística',
    ctaText: 'Pedir Orçamento Grátis',
    ctaLink: 'https://wa.me/244926874444?text=Quero%20fazer%20um%20orcamento%20de%20transporte%20Kwanza%20Sul',
    gradient: 'linear-gradient(135deg, #0f172a, #15803d, #1e293b)'
  }
];
