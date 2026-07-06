import { Show, SongRequest, NewsItem, AdBanner } from '../types';
import { 
  NEWS_DATA, 
  ADS_DATA, 
  WEEKDAY_SCHEDULE, 
  SATURDAY_SCHEDULE, 
  SUNDAY_SCHEDULE, 
  INITIAL_SONG_REQUESTS 
} from '../data';
import databaseSeed from './database_seed.json';

// ==========================================
// ADMIN DB SCHEMAS & INTERFACES
// ==========================================

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    dashboard: 'none' | 'view' | 'manage';
    news: 'none' | 'view' | 'manage';
    schedule: 'none' | 'view' | 'manage';
    advertising: 'none' | 'view' | 'manage';
    users: 'none' | 'view' | 'manage';
    logs: 'none' | 'view' | 'manage';
    settings: 'none' | 'view' | 'manage';
    messages: 'none' | 'view' | 'manage';
  };
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  roleId: string; // references Role.id
  email: string;
  phone: string;
  admissionDate: string;
  status: 'Ativo' | 'Inativo';
  lastAccess: string;
  passwordHash: string; // stored simply for mockup simulation
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  module: 'AUTH' | 'NEWS' | 'SCHEDULE' | 'ADVERTISING' | 'USERS' | 'SETTINGS' | 'SYSTEM' | 'MESSAGES';
  details: string;
  ipAddress: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  publishDate: string;
  hosts: string[];
  views: number;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website: string;
  status: 'Ativo' | 'Inativo';
  contactPerson: string;
  contactEmail: string;
  contributionLevel: 'Gold' | 'Silver' | 'Bronze' | 'Premium';
  classification?: 'Anúncio' | 'Publicidade' | 'Patrocinador';
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'Especial' | 'Cultura' | 'Concerto' | 'Comercial';
  image?: string;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  replied: boolean;
  notes?: string;
}

export interface SystemConfig {
  radioName: string;
  slogan: string;
  streamUrl: string;
  phone: string;
  whatsappUrl: string;
  email: string;
  address: string;
  maintenanceMode: boolean;
  googleAppsScriptUrl: string; // The URL to sync with a REAL Google Sheet
  googleSpreadsheetId: string; // The Google Sheets Spreadsheet ID for Direct Sync
}

export interface AdCampaign {
  id: string;
  clientId: string; // references AdBanner.id or Sponsor.id
  title: string;
  startDate: string;
  endDate: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  viewsCount: number;
  maxViews: number;
  clicksCount: number;
  maxClicks: number;
  position: 'Banner Superior' | 'Banner Inferior' | 'Banner Lateral' | 'Banner Home' | 'Banner Player' | 'Banner Notícias';
  audioUrl?: string; // Audio ads play automatically
  status: 'Ativo' | 'Pausado' | 'Expirado';
  image?: string; // base64 uploaded banner image
  classification?: 'Anúncio' | 'Publicidade' | 'Patrocinador';
}

// Global DB Shape
export interface TRS_Database {
  roles: Role[];
  employees: Employee[];
  news: NewsItem[];
  shows: Show[];
  podcasts: PodcastEpisode[];
  sponsors: Sponsor[];
  banners: AdBanner[];
  campaigns: AdCampaign[];
  events: CalendarEvent[];
  messages: ContactMessage[];
  logs: SystemLog[];
  config: SystemConfig;
  songRequests: SongRequest[];
}

// ==========================================
// SEED INITIAL DATA (SIMULATED GOOGLE SHEET ROWS)
// ==========================================

const INITIAL_ROLES: Role[] = [
  {
    id: 'role-superadmin',
    name: 'Super Administrador',
    description: 'Acesso total e irrestrito a todos os módulos, configurações e backups.',
    permissions: {
      dashboard: 'manage',
      news: 'manage',
      schedule: 'manage',
      advertising: 'manage',
      users: 'manage',
      logs: 'manage',
      settings: 'manage',
      messages: 'manage'
    }
  },
  {
    id: 'role-admin',
    name: 'Administrador',
    description: 'Pode gerenciar conteúdos, publicidade e mensagens, mas não altera permissões de utilizadores.',
    permissions: {
      dashboard: 'manage',
      news: 'manage',
      schedule: 'manage',
      advertising: 'manage',
      users: 'view',
      logs: 'view',
      settings: 'view',
      messages: 'manage'
    }
  },
  {
    id: 'role-jornalista',
    name: 'Jornalista / Editor',
    description: 'Gestão integral de notícias, blogue de cultura e moderação de pedidos.',
    permissions: {
      dashboard: 'view',
      news: 'manage',
      schedule: 'view',
      advertising: 'none',
      users: 'none',
      logs: 'none',
      settings: 'none',
      messages: 'view'
    }
  },
  {
    id: 'role-comercial',
    name: 'Diretor Comercial',
    description: 'Controlo exclusivo de campanhas publicitárias, anunciantes, patrocinadores e métricas de anúncios.',
    permissions: {
      dashboard: 'view',
      news: 'none',
      schedule: 'none',
      advertising: 'manage',
      users: 'none',
      logs: 'none',
      settings: 'none',
      messages: 'view'
    }
  },
  {
    id: 'role-locutor',
    name: 'Locutor de Rádio',
    description: 'Visualiza a grelha de programação, aprova pedidos de músicas e lê mensagens de ouvintes.',
    permissions: {
      dashboard: 'view',
      news: 'view',
      schedule: 'view',
      advertising: 'none',
      users: 'none',
      logs: 'none',
      settings: 'none',
      messages: 'manage'
    }
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'António Silva',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    roleId: 'role-superadmin',
    email: 'dinhosantanap@gmail.com',
    phone: '+244 926 874 444',
    admissionDate: '2023-01-10',
    status: 'Ativo',
    lastAccess: 'Hoje, 09:30',
    passwordHash: 'trsonline@1'
  },
  {
    id: 'emp-2',
    name: 'Cláudia Tomás',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    roleId: 'role-admin',
    email: 'claudia@trsradioonline.com',
    phone: '+244 911 223 344',
    admissionDate: '2024-03-15',
    status: 'Ativo',
    lastAccess: 'Hoje, 11:15',
    passwordHash: 'claudia123'
  },
  {
    id: 'emp-3',
    name: 'Mestre Cabinda',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    roleId: 'role-locutor',
    email: 'cabinda@trsradioonline.com',
    phone: '+244 932 456 789',
    admissionDate: '2023-05-20',
    status: 'Ativo',
    lastAccess: 'Ontem, 20:45',
    passwordHash: 'cabinda123'
  },
  {
    id: 'emp-4',
    name: 'Irmã Conceição',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    roleId: 'role-locutor',
    email: 'conceicao@trsradioonline.com',
    phone: '+244 923 111 222',
    admissionDate: '2023-11-01',
    status: 'Ativo',
    lastAccess: 'Hoje, 08:05',
    passwordHash: 'louvor123'
  },
  {
    id: 'emp-5',
    name: 'João Baptista',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    roleId: 'role-comercial',
    email: 'joao.vendas@trsradioonline.com',
    phone: '+244 925 555 666',
    admissionDate: '2025-02-18',
    status: 'Ativo',
    lastAccess: 'Há 3 dias',
    passwordHash: 'joao123'
  }
];

const INITIAL_SPONSORS: Sponsor[] = [
  {
    id: 'spon1',
    name: 'Kero Supermercados',
    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&auto=format&fit=crop&q=60',
    website: 'https://kero-angola.com',
    status: 'Ativo',
    contactPerson: 'Marcos Leitão',
    contactEmail: 'mleitao@kero.co.ao',
    contributionLevel: 'Gold'
  },
  {
    id: 'spon2',
    name: 'Unitel Angola',
    logo: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=150&auto=format&fit=crop&q=60',
    website: 'https://unitel.ao',
    status: 'Ativo',
    contactPerson: 'Filomena Rocha',
    contactEmail: 'frocha@unitel.co.ao',
    contributionLevel: 'Gold'
  },
  {
    id: 'spon3',
    name: 'Banco BAI',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=60',
    website: 'https://bancobai.ao',
    status: 'Ativo',
    contactPerson: 'Eduardo Santos',
    contactEmail: 'esantos@bancobai.ao',
    contributionLevel: 'Premium'
  },
  {
    id: 'spon4',
    name: 'Cuca Cerveja',
    logo: 'https://images.unsplash.com/photo-1568219656418-15932992ab4b?w=150&auto=format&fit=crop&q=60',
    website: 'https://cuca.ao',
    status: 'Ativo',
    contactPerson: 'Álvaro Cruz',
    contactEmail: 'acruz@cuca.ao',
    contributionLevel: 'Silver'
  }
];

const INITIAL_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'camp1',
    clientId: 'ad1',
    title: 'Campanha Fim de Semana Kero Frescos',
    startDate: '2026-06-25',
    endDate: '2026-07-15',
    priority: 'Alta',
    viewsCount: 2480,
    maxViews: 10000,
    clicksCount: 145,
    maxClicks: 500,
    position: 'Banner Home',
    status: 'Ativo'
  },
  {
    id: 'camp2',
    clientId: 'ad2',
    title: 'Unitel Net Ultra Verão',
    startDate: '2026-06-01',
    endDate: '2026-08-30',
    priority: 'Alta',
    viewsCount: 4210,
    maxViews: 20000,
    clicksCount: 382,
    maxClicks: 1500,
    position: 'Banner Player',
    status: 'Ativo'
  },
  {
    id: 'camp3',
    clientId: 'ad3',
    title: 'Banco BAI Habitação Jovem',
    startDate: '2026-06-15',
    endDate: '2026-12-31',
    priority: 'Média',
    viewsCount: 1240,
    maxViews: 50000,
    clicksCount: 98,
    maxClicks: 3000,
    position: 'Banner Notícias',
    status: 'Ativo'
  },
  {
    id: 'camp4',
    clientId: 'ad4',
    title: 'Kwanza Sul Logística Rápida',
    startDate: '2026-06-20',
    endDate: '2026-07-20',
    priority: 'Baixa',
    viewsCount: 890,
    maxViews: 5000,
    clicksCount: 41,
    maxClicks: 200,
    position: 'Banner Lateral',
    status: 'Ativo'
  }
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt1',
    title: 'Gala Anual Kizomba Awards 2026',
    description: 'O maior evento de premiação para os promotores da Kizomba em todo o mundo. A TRS estará transmitindo ao vivo.',
    date: '2026-07-12',
    time: '20:00',
    location: 'Centro de Convenções de Talatona, Luanda',
    category: 'Especial',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'evt2',
    title: 'Festival Raízes de Semba',
    description: 'Workshop de Semba e concertos tradicionais gratuitos na Baía de Luanda em celebração às origens angolanas.',
    date: '2026-08-05',
    time: '16:00',
    location: 'Baía de Luanda, Angola',
    category: 'Cultura',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=60'
  }
];

const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg1',
    senderName: 'António Ndongala',
    senderEmail: 'ndongala@gmail.com',
    senderPhone: '+244 933 555 444',
    subject: 'Sugestão de Programa Musical',
    message: 'Olá equipa TRS! Adoro a rádio e ouço todos os dias. Seria excelente se criassem um programa focado exclusivamente no Semba acústico dos anos 80.',
    timestamp: '2026-06-29T11:40:00Z',
    isRead: false,
    replied: false
  },
  {
    id: 'msg2',
    senderName: 'Maria Antónia',
    senderEmail: 'maria.ant@sapo.ao',
    senderPhone: '+244 912 345 678',
    subject: 'Gospel de Domingo é fantástico',
    message: 'Irmã Conceição, a sua pregação e a seleção de louvores deste último domingo tocou profundamente o meu coração. Muito obrigada pela luz que trazem às nossas vidas.',
    timestamp: '2026-06-28T16:22:00Z',
    isRead: true,
    replied: false
  },
  {
    id: 'msg3',
    senderName: 'Roberto Albuquerque',
    senderEmail: 'roberto.vendas@empresa.pt',
    senderPhone: '+351 912 345 678',
    subject: 'Pedido de Orçamento Publicitário',
    message: 'Prezados Senhores, gerencio uma marca de produtos alimentares portugueses com distribuição recente em Luanda. Gostaria de solicitar o tarifário de spots publicitários de 30s na rádio.',
    timestamp: '2026-06-27T10:15:00Z',
    isRead: true,
    replied: true,
    notes: 'Respondido com tarifário em PDF e agendado telefonema para dia 2 de Julho.'
  }
];

const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log1',
    timestamp: '2026-06-29T09:30:15Z',
    userId: 'emp-1',
    userEmail: 'antonio@trsradioonline.com',
    action: 'Login efetuado com sucesso',
    module: 'AUTH',
    details: 'Sessão administrativa iniciada via navegador Desktop.',
    ipAddress: '197.235.122.14'
  },
  {
    id: 'log2',
    timestamp: '2026-06-29T11:15:33Z',
    userId: 'emp-2',
    userEmail: 'claudia@trsradioonline.com',
    action: 'Login efetuado com sucesso',
    module: 'AUTH',
    details: 'Sessão administrativa iniciada via dispositivo móvel.',
    ipAddress: '197.235.101.44'
  }
];

const INITIAL_PODCASTS: PodcastEpisode[] = [
  {
    id: 'pod1',
    title: 'A Evolução do Semba à Kizomba',
    description: 'Mestre Cabinda convida historiadores musicais para debater como os ritmos tradicionais de Angola originaram a Kizomba moderna.',
    audioUrl: 'https://stream.zeno.fm/f378v6v27reuv', // Demo backup stream as pseudo audio
    duration: '45:30',
    publishDate: '2026-06-24',
    hosts: ['Mestre Cabinda', 'Carlos Miguel'],
    views: 310
  },
  {
    id: 'pod2',
    title: 'Lendas da Rádio: O Legado de Ruy Mingas',
    description: 'Edição especial dedicada à obra literária, canções patrióticas e influência cultural do mestre Ruy Mingas.',
    audioUrl: 'https://stream.zeno.fm/f378v6v27reuv',
    duration: '58:15',
    publishDate: '2026-06-18',
    hosts: ['Augusto Neto'],
    views: 520
  }
];

// ==========================================
// VIRTUAL DB MANAGER class (FALLBACK/LOCAL DB)
// ==========================================

const LOCAL_STORAGE_KEY = 'trs_online_virtual_sheet_db';

export class TRS_Database_Service {
  private static cachedDb: TRS_Database | null = null;
  private static listeners: (() => void)[] = [];

  public static subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in db subscriber:', err);
      }
    }
  }

  // Initialize DB with seed values if empty
  public static getDB(): TRS_Database {
    if (this.cachedDb) return this.cachedDb;

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsedDb = JSON.parse(stored) as TRS_Database;
        // Make sure the required superadmin is present with correct credentials and role
        const dinhoEmp = parsedDb.employees.find(e => e.email === 'dinhosantanap@gmail.com');
        if (dinhoEmp) {
          dinhoEmp.passwordHash = 'trsonline@1';
          dinhoEmp.roleId = 'role-superadmin';
          dinhoEmp.status = 'Ativo';
        } else {
          // If not found, replace any existing role-superadmin or insert a new one
          const superadmin = parsedDb.employees.find(e => e.roleId === 'role-superadmin');
          if (superadmin) {
            superadmin.email = 'dinhosantanap@gmail.com';
            superadmin.passwordHash = 'trsonline@1';
            superadmin.name = 'António Silva';
            superadmin.status = 'Ativo';
          } else {
            parsedDb.employees.unshift({
              id: 'emp-1',
              name: 'António Silva',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
              roleId: 'role-superadmin',
              email: 'dinhosantanap@gmail.com',
              phone: '+244 926 874 444',
              admissionDate: '2023-01-10',
              status: 'Ativo',
              lastAccess: 'Hoje, 09:30',
              passwordHash: 'trsonline@1'
            });
          }
        }

        // AUTO-MIGRATION & UPGRADE OF EMPTY DATA TABLES
        if (!parsedDb.news || parsedDb.news.length === 0) {
          parsedDb.news = databaseSeed.news as any;
        }
        if (!parsedDb.shows || parsedDb.shows.length === 0) {
          parsedDb.shows = databaseSeed.shows as any;
        }
        if (!parsedDb.banners || parsedDb.banners.length === 0) {
          parsedDb.banners = databaseSeed.banners as any;
        }
        if (!parsedDb.songRequests || parsedDb.songRequests.length === 0) {
          parsedDb.songRequests = databaseSeed.songRequests as any;
        }

        if (parsedDb.config) {
          if (parsedDb.config.googleSpreadsheetId === undefined) {
            parsedDb.config.googleSpreadsheetId = '';
          }
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedDb));
        this.cachedDb = parsedDb;
        return this.cachedDb!;
      } catch (e) {
        console.error('Failed parsing database, resetting to default', e);
      }
    }

    // Default seed cloned from imported JSON seed to prevent mutation issues
    const defaultDb: TRS_Database = JSON.parse(JSON.stringify(databaseSeed)) as TRS_Database;

    this.saveDB(defaultDb);
    this.cachedDb = defaultDb;
    return defaultDb;
  }

  public static getDatabase(): TRS_Database {
    return { ...this.getDB() };
  }

  private static saveDB(db: TRS_Database) {
    const cloned = { ...db };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloned));
    this.cachedDb = cloned;
    this.notify();

    // Send the update to the local Express backend (writes back to database_seed.json)
    fetch('/api/save-database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cloned)
    })
      .then(res => {
        if (res.ok) {
          console.log('[LOCAL SERVER] Database saved to disk seed successfully');
        } else {
          console.warn('[LOCAL SERVER] Database save request rejected');
        }
      })
      .catch(err => {
        console.warn('[LOCAL SERVER] Background save not available (this is normal in production on Cloudflare):', err.message);
      });
  }

  // ==========================================
  // READ/WRITE METHODS (LOCAL-FIRST ENGINE)
  // ==========================================

  public static async query<K extends keyof TRS_Database>(table: K): Promise<TRS_Database[K]> {
    const scriptUrl = this.getDB().config.googleAppsScriptUrl;
    
    // IF USER ENTERED A REAL GOOGLE SHEET APPS SCRIPT WEB APP URL:
    if (scriptUrl) {
      try {
        const response = await fetch(`${scriptUrl}?table=${table}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          // Cache locally to remain robust
          const db = this.getDB();
          (db as any)[table] = data;
          this.saveDB(db);
          return data as TRS_Database[K];
        }
      } catch (e) {
        console.warn(`Failed reading live Google Sheet (${table}). Falling back to local Virtual DB. Error:`, e);
      }
    }

    // Default Local DB returns
    return this.getDB()[table];
  }

  public static async insert<K extends keyof TRS_Database>(
    table: K, 
    row: any, 
    editorEmail: string = 'Sistema'
  ): Promise<any> {
    const db = this.getDB();
    const rows = db[table] as any[];
    
    // Generate unique ID if not present
    if (!row.id) {
      row.id = `${table.substring(0, 3)}-${Date.now()}`;
    }
    
    // Immutable array replacement
    db[table] = [row, ...rows] as any;
    this.saveDB(db);

    // Logging automatically
    await this.addLog(
      editorEmail,
      `Inserção na tabela '${table}'`,
      row.module || 'SYSTEM',
      `Criado item ID: ${row.id} - ${row.title || row.name || 'Sem título'}`
    );

    // Sync to Real Google Sheets if API URL is configured
    const scriptUrl = db.config.googleAppsScriptUrl;
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors', // standard Apps Script POST behavior requires no-cors/cors handling
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'insert', table, data: row })
        });
      } catch (e) {
        console.error('Google Sheet Sync Error:', e);
      }
    }

    this.notify();

    return row;
  }

  public static async update<K extends keyof TRS_Database>(
    table: K, 
    id: string, 
    updatedRow: any, 
    editorEmail: string = 'Sistema'
  ): Promise<boolean> {
    const db = this.getDB();
    const rows = db[table] as any[];
    const index = rows.findIndex((r: any) => r.id === id);
    
    if (index === -1) return false;
    
    // Immutable row and array replacement
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], ...updatedRow };
    db[table] = newRows as any;
    this.saveDB(db);

    // Logging automatically
    await this.addLog(
      editorEmail,
      `Atualização na tabela '${table}'`,
      updatedRow.module || 'SYSTEM',
      `Modificado item ID: ${id} - ${updatedRow.title || updatedRow.name || 'Sem título'}`
    );

    // Sync to Real Google Sheets if API URL is configured
    const scriptUrl = db.config.googleAppsScriptUrl;
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', table, id, data: updatedRow })
        });
      } catch (e) {
        console.error('Google Sheet Sync Error:', e);
      }
    }

    this.notify();

    return true;
  }

  public static async delete<K extends keyof TRS_Database>(
    table: K, 
    id: string, 
    editorEmail: string = 'Sistema'
  ): Promise<boolean> {
    const db = this.getDB();
    const rows = db[table] as any[];
    const index = rows.findIndex((r: any) => r.id === id);
    
    if (index === -1) return false;
    
    const deletedItem = rows[index];
    
    // Immutable array replacement
    db[table] = rows.filter((_: any, i: number) => i !== index) as any;
    this.saveDB(db);

    // Logging automatically
    await this.addLog(
      editorEmail,
      `Remoção na tabela '${table}'`,
      'SYSTEM',
      `Apagado item ID: ${id} - ${deletedItem.title || deletedItem.name || 'Sem título'}`
    );

    // Sync to Real Google Sheets if API URL is configured
    const scriptUrl = db.config.googleAppsScriptUrl;
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', table, id })
        });
      } catch (e) {
        console.error('Google Sheet Sync Error:', e);
      }
    }

    this.notify();

    return true;
  }

  // Helper log function
  public static async addLog(
    userEmail: string, 
    action: string, 
    module: SystemLog['module'], 
    details: string
  ): Promise<void> {
    const db = this.getDB();
    
    // Find employee ID
    const emp = db.employees.find(e => e.email === userEmail);
    const userId = emp ? emp.id : 'system';

    const log: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      action,
      module,
      details,
      ipAddress: '197.235.122.' + Math.floor(Math.random() * 254)
    };

    db.logs.unshift(log);
    
    // Keep logs size reasonable
    if (db.logs.length > 300) {
      db.logs.pop();
    }
    
    this.saveDB(db);
  }

  // Backup exporter
  public static exportBackup(): string {
    return JSON.stringify(this.getDB(), null, 2);
  }

  // Restore database
  public static restoreBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      // Basic validating
      if (parsed.config && parsed.employees && parsed.roles) {
        this.saveDB(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid backup file parsed', e);
    }
    return false;
  }

  // Fetch or update app configuration
  public static getConfig(): SystemConfig {
    return this.getDB().config;
  }

  public static updateConfig(newConfig: Partial<SystemConfig>, editorEmail: string): void {
    const db = this.getDB();
    db.config = { ...db.config, ...newConfig };
    this.saveDB(db);

    this.addLog(
      editorEmail,
      'Configurações de Sistema alteradas',
      'SETTINGS',
      `Novas configurações salvas. Sincronização Google Sheet: ${newConfig.googleAppsScriptUrl ? 'Ativa' : 'Inativa'}`
    );
  }

  // ==========================================
  // GOOGLE APPS SCRIPT COPY-PASTE CODE
  // ==========================================
  public static getGoogleAppsScriptCode(): string {
    return `/**
 * TRS ONLINE - MOTOR DE INTERMEDIAÇÃO DE BANCO DE DADOS GOOGLE SHEETS
 * Copie este código e cole no painel de "Extensões" -> "Apps Script" da sua Planilha Google.
 * Certifique-se de nomear as páginas da planilha exatamente como: 
 * "roles", "employees", "news", "shows", "podcasts", "sponsors", "banners", "campaigns", "events", "messages", "logs", "songRequests".
 * Depois, publique como um "App Web" com acesso para "Qualquer pessoa" e insira o link gerado nas Configurações do Painel TRS.
 */

var ss = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  var table = e.parameter.table;
  if (!table) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Parâmetro 'table' em falta." }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheet = ss.getSheetByName(table);
  if (!sheet) {
    // Cria a folha automaticamente caso não exista para facilitar o onboarding
    sheet = ss.insertSheet(table);
    sheet.appendRow(["id", "json_content"]);
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var result = [];
  
  // Lemos as linhas (se for um esquema simples de coluna JSON ou múltiplas colunas)
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var cellVal = data[i][j];
      // Tenta fazer parse de colunas JSON
      if (headers[j] === "json_content") {
        try {
          row = JSON.parse(cellVal);
        } catch(err) {
          row.jsonError = true;
        }
      } else {
        row[headers[j]] = cellVal;
      }
    }
    if (!row.id && data[i][0]) {
      row.id = data[i][0];
    }
    result.push(row);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
                       .setMimeType(ContentService.MimeType.JSON)
                       .setHeader("Access-Control-Allow-Origin", "*");
}

function doPost(e) {
  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "JSON inválido" }))
                         .setMimeType(ContentService.MimeType.JSON)
                         .setHeader("Access-Control-Allow-Origin", "*");
  }
  
  var action = payload.action; // insert, update, delete
  var table = payload.table;
  var id = payload.id;
  var rowData = payload.data;
  
  var sheet = ss.getSheetByName(table);
  if (!sheet) {
    sheet = ss.insertSheet(table);
    sheet.appendRow(["id", "json_content"]);
  }
  
  var data = sheet.getDataRange().getValues();
  
  if (action === "insert") {
    // Insere uma nova linha
    sheet.appendRow([rowData.id, JSON.stringify(rowData)]);
    return ContentService.createTextOutput(JSON.stringify({ success: true, id: rowData.id }))
                         .setMimeType(ContentService.MimeType.JSON)
                         .setHeader("Access-Control-Allow-Origin", "*");
  }
  
  if (action === "update") {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.getRange(i + 1, 2).setValue(JSON.stringify(rowData));
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
                             .setMimeType(ContentService.MimeType.JSON)
                             .setHeader("Access-Control-Allow-Origin", "*");
      }
    }
  }
  
  if (action === "delete") {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
                             .setMimeType(ContentService.MimeType.JSON)
                             .setHeader("Access-Control-Allow-Origin", "*");
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Ação ou ID não processado." }))
                       .setMimeType(ContentService.MimeType.JSON)
                       .setHeader("Access-Control-Allow-Origin", "*");
}
`;
  }
}
