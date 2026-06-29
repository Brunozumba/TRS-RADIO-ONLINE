import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { TRS_Database, ContactMessage, Sponsor, AdCampaign } from './db';
import { Show, SongRequest } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Request Google Sheets & Drive Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we have a user but no cached token (e.g., page refreshed),
        // we will need the user to click sign in again to get a fresh token.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out
export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Retrieve token helper
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Google Sheets API Helpers
export class GoogleSheetsService {
  // 1. Create a new spreadsheet
  public static async createSpreadsheet(title: string): Promise<string> {
    const token = getAccessToken();
    if (!token) throw new Error('Utilizador não autenticado no Google.');

    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: title,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro ao criar folha de cálculo: ${errText}`);
    }

    const data = await response.json();
    return data.spreadsheetId;
  }

  // 2. Add multiple sheets/tabs to spreadsheet if they do not exist
  public static async ensureSheetsExist(spreadsheetId: string, sheetNames: string[]): Promise<void> {
    const token = getAccessToken();
    if (!token) throw new Error('Utilizador não autenticado no Google.');

    // Fetch existing sheets to see what we have
    const metadataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!metadataRes.ok) throw new Error('Não foi possível ler metadados da folha de cálculo.');
    
    const metadata = await metadataRes.json();
    const existingTitles: string[] = (metadata.sheets || []).map((s: any) => s.properties.title);

    const requests: any[] = [];
    for (const name of sheetNames) {
      if (!existingTitles.includes(name)) {
        requests.push({
          addSheet: {
            properties: {
              title: name,
            }
          }
        });
      }
    }

    if (requests.length === 0) return;

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro ao estruturar abas do Google Sheets: ${errText}`);
    }
  }

  // 3. Write/Replace value block
  public static async writeRange(spreadsheetId: string, range: string, values: any[][]): Promise<void> {
    const token = getAccessToken();
    if (!token) throw new Error('Utilizador não autenticado no Google.');

    // Use valueInputOption=USER_ENTERED so numbers and dates format automatically
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: values,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro ao escrever no Google Sheets (${range}): ${errText}`);
    }
  }

  // 4. Append rows to a sheet (perfect for real-time logs, song requests, messages)
  public static async appendRow(spreadsheetId: string, sheetName: string, values: any[]): Promise<void> {
    const token = getAccessToken();
    if (!token) return; // Silent return if not logged in to Google Sheets on the client

    try {
      const range = `${sheetName}!A:A`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values],
        }),
      });
    } catch (e) {
      console.warn('Silent appendRow to Google Sheets failed:', e);
    }
  }

  // 5. Read range from a sheet
  public static async readRange(spreadsheetId: string, range: string): Promise<any[][]> {
    const token = getAccessToken();
    if (!token) throw new Error('Utilizador não autenticado no Google.');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro ao ler do Google Sheets (${range}): ${errText}`);
    }

    const data = await response.json();
    return data.values || [];
  }

  // 6. Style headers (bold background and text)
  public static async styleHeaders(spreadsheetId: string, sheetName: string): Promise<void> {
    const token = getAccessToken();
    if (!token) return;

    try {
      // Find the sheet ID first from metadata
      const metadataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const metadata = await metadataRes.json();
      const sheet = (metadata.sheets || []).find((s: any) => s.properties.title === sheetName);
      if (!sheet) return;
      const sheetId = sheet.properties.sheetId;

      // Bold and color the first row
      const requests = [
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.08, green: 0.12, blue: 0.16 }, // Deep dark grey slate
                textFormat: {
                  foregroundColor: { red: 1.0, green: 0.73, blue: 0.0 }, // Gold / Amber 500
                  bold: true,
                  fontSize: 10,
                },
                horizontalAlignment: 'CENTER',
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
          }
        },
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              gridProperties: {
                frozenRowCount: 1,
              }
            },
            fields: 'gridProperties.frozenRowCount'
          }
        }
      ];

      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });
    } catch (e) {
      console.warn('Header styling failed:', e);
    }
  }

  // 7. Full structured Export of Database to Spreadsheet
  public static async exportFullDatabase(spreadsheetId: string, db: TRS_Database): Promise<void> {
    const tabs = ['Programas', 'Pedidos de Música', 'Mensagens de Contacto', 'Patrocinadores', 'Campanhas', 'Registos de Sistema'];
    
    // Ensure all sheet tabs exist
    await this.ensureSheetsExist(spreadsheetId, tabs);

    // Write Shows
    const showsData = [
      ['ID', 'Título', 'Início', 'Fim', 'Descrição', 'Anfitriões', 'Ritmo / Etiqueta', 'Dia da Semana']
    ];
    db.shows.forEach((s) => {
      showsData.push([
        s.id,
        s.title,
        s.timeStart,
        s.timeEnd,
        s.description,
        s.hosts ? s.hosts.join(', ') : '',
        s.tag || '',
        s.day || 'Segunda a Sexta'
      ]);
    });
    await this.writeRange(spreadsheetId, 'Programas!A1:H100', showsData);
    await this.styleHeaders(spreadsheetId, 'Programas');

    // Write Song Requests
    const reqsData = [
      ['ID', 'Artista', 'Música', 'Nome do Ouvinte', 'Mensagem / Dedicatória', 'Data/Hora', 'Likes']
    ];
    db.songRequests.forEach((r) => {
      reqsData.push([
        r.id,
        r.artist,
        r.song,
        r.sender,
        r.message || '',
        r.timestamp,
        String(r.likes)
      ]);
    });
    await this.writeRange(spreadsheetId, 'Pedidos de Música!A1:G100', reqsData);
    await this.styleHeaders(spreadsheetId, 'Pedidos de Música');

    // Write Contact Messages
    const msgsData = [
      ['ID', 'Nome', 'E-mail', 'Telefone', 'Assunto', 'Mensagem', 'Data/Hora', 'Lido', 'Respondido', 'Notas']
    ];
    db.messages.forEach((m) => {
      msgsData.push([
        m.id,
        m.senderName,
        m.senderEmail,
        m.senderPhone,
        m.subject,
        m.message,
        m.timestamp,
        m.isRead ? 'Sim' : 'Não',
        m.replied ? 'Sim' : 'Não',
        m.notes || ''
      ]);
    });
    await this.writeRange(spreadsheetId, 'Mensagens de Contacto!A1:J100', msgsData);
    await this.styleHeaders(spreadsheetId, 'Mensagens de Contacto');

    // Write Sponsors
    const sponsorsData = [
      ['ID', 'Nome', 'Nível de Contribuição', 'Pessoa de Contacto', 'E-mail de Contacto', 'Estado', 'Website']
    ];
    db.sponsors.forEach((sp) => {
      sponsorsData.push([
        sp.id,
        sp.name,
        sp.contributionLevel,
        sp.contactPerson,
        sp.contactEmail,
        sp.status,
        sp.website
      ]);
    });
    await this.writeRange(spreadsheetId, 'Patrocinadores!A1:G100', sponsorsData);
    await this.styleHeaders(spreadsheetId, 'Patrocinadores');

    // Write Campaigns
    const campaignsData = [
      ['ID', 'Título', 'ID do Cliente', 'Cliques', 'Visualizações', 'Posição', 'Início', 'Fim', 'Estado']
    ];
    db.campaigns.forEach((c) => {
      campaignsData.push([
        c.id,
        c.title,
        c.clientId,
        String(c.clicksCount),
        String(c.viewsCount),
        c.position,
        c.startDate,
        c.endDate,
        c.status
      ]);
    });
    await this.writeRange(spreadsheetId, 'Campanhas!A1:I100', campaignsData);
    await this.styleHeaders(spreadsheetId, 'Campanhas');

    // Write Logs
    const logsData = [
      ['ID', 'Data/Hora', 'Utilizador', 'Módulo', 'Ação', 'Detalhes', 'IP']
    ];
    // Export first 100 logs
    db.logs.slice(0, 100).forEach((l) => {
      logsData.push([
        l.id,
        l.timestamp,
        l.userEmail,
        l.module,
        l.action,
        l.details,
        l.ipAddress
      ]);
    });
    await this.writeRange(spreadsheetId, 'Registos de Sistema!A1:G150', logsData);
    await this.styleHeaders(spreadsheetId, 'Registos de Sistema');
  }

  // 8. Import Show Schedule from Spreadsheet range
  public static async importShowsFromSpreadsheet(spreadsheetId: string): Promise<Show[]> {
    const rawRows = await this.readRange(spreadsheetId, 'Programas!A2:H200');
    if (!rawRows || rawRows.length === 0) {
      throw new Error('Nenhum dado encontrado na aba "Programas" a partir da linha 2.');
    }

    const shows: Show[] = rawRows.map((row, index) => {
      const hosts = row[5] ? row[5].split(',').map(h => h.trim()).filter(Boolean) : [];
      return {
        id: row[0] || `sho-${Date.now()}-${index}`,
        title: row[1] || 'Sem Título',
        timeStart: row[2] || '00:00',
        timeEnd: row[3] || '01:00',
        description: row[4] || '',
        hosts: hosts,
        tag: row[6] || 'Música',
        day: (row[7] as any) || 'Segunda a Sexta'
      };
    });

    return shows;
  }
}
