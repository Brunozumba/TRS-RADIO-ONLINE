import React, { useState, useEffect } from 'react';
import { 
  Settings, Database, Cloud, Copy, Check, Download, Upload, ShieldAlert, 
  Save, Undo, HelpCircle, ArrowLeftRight, CheckCircle2, Loader2, Sparkles
} from 'lucide-react';
import { TRS_Database, TRS_Database_Service, SystemConfig } from '../../services/db';
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut, 
  GoogleSheetsService 
} from '../../services/googleSheets';
import { User } from 'firebase/auth';

interface AdminSettingsProps {
  db: TRS_Database;
  employeeEmail: string;
  hasPermission: (module: string, action: 'view' | 'manage') => boolean;
  onRefresh: () => void;
}

export default function AdminSettings({ db, employeeEmail, hasPermission, onRefresh }: AdminSettingsProps) {
  const [configForm, setConfigForm] = useState<SystemConfig>({ ...db.config });
  const [copied, setCopied] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Google OAuth and Direct Sheets States
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [sheetActionStatus, setSheetActionStatus] = useState<string | null>(null);
  const [sheetActionError, setSheetActionError] = useState<string | null>(null);
  const [sheetActionSuccess, setSheetActionSuccess] = useState<string | null>(null);
  const [spreadsheetIdForm, setSpreadsheetIdForm] = useState(db.config.googleSpreadsheetId || '');

  // Track Auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    setSheetActionError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setSheetActionSuccess('Sessão Google iniciada com sucesso!');
        setTimeout(() => setSheetActionSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setSheetActionError('Falha na autenticação Google.');
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
      setSheetActionSuccess('Sessão Google terminada.');
      setTimeout(() => setSheetActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSpreadsheetId = async () => {
    if (!canManage) return;
    try {
      const updatedConfig = { ...db.config, googleSpreadsheetId: spreadsheetIdForm };
      await TRS_Database_Service.updateConfig(updatedConfig, employeeEmail);
      setConfigForm(updatedConfig);
      onRefresh();
      setSheetActionSuccess('ID da Planilha gravado com sucesso!');
      setTimeout(() => setSheetActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setSheetActionError('Erro ao gravar o ID da Planilha.');
    }
  };

  const handleCreateAutoSpreadsheet = async () => {
    if (!googleToken) {
      setSheetActionError('Por favor, inicie sessão no Google primeiro.');
      return;
    }
    setSheetActionStatus('A criar nova folha de cálculo...');
    setSheetActionError(null);
    setSheetActionSuccess(null);

    try {
      const newId = await GoogleSheetsService.createSpreadsheet('TRS RÁDIO ONLINE - Base de Dados');
      setSpreadsheetIdForm(newId);
      
      const updatedConfig = { ...db.config, googleSpreadsheetId: newId };
      await TRS_Database_Service.updateConfig(updatedConfig, employeeEmail);
      setConfigForm(updatedConfig);
      onRefresh();

      setSheetActionSuccess(`Planilha criada com sucesso! ID: ${newId}`);
      await TRS_Database_Service.addLog(employeeEmail, 'Planilha Google criada', 'SETTINGS', `Criada folha de cálculo no Google Drive com ID: ${newId}`);
    } catch (err: any) {
      console.error(err);
      setSheetActionError(err.message || 'Falha ao criar planilha.');
    } finally {
      setSheetActionStatus(null);
    }
  };

  const handleExportToSheets = async () => {
    const targetId = spreadsheetIdForm || db.config.googleSpreadsheetId;
    if (!targetId) {
      setSheetActionError('Insira um ID de Planilha válido ou crie uma nova planilha primeiro.');
      return;
    }
    if (!googleToken) {
      setSheetActionError('Por favor, inicie sessão no Google primeiro.');
      return;
    }

    setSheetActionStatus('A sincronizar e a formatar tabelas do Google Sheets...');
    setSheetActionError(null);
    setSheetActionSuccess(null);

    try {
      await GoogleSheetsService.exportFullDatabase(targetId, db);
      setSheetActionSuccess('Sincronização completa! Todas as tabelas exportadas e formatadas.');
      await TRS_Database_Service.addLog(employeeEmail, 'Sincronização completa Google Sheets', 'SETTINGS', `Base de dados exportada para a planilha ID: ${targetId}`);
    } catch (err: any) {
      console.error(err);
      setSheetActionError(err.message || 'Falha ao sincronizar dados com o Google Sheets.');
    } finally {
      setSheetActionStatus(null);
    }
  };

  const handleImportScheduleFromSheets = async () => {
    const targetId = spreadsheetIdForm || db.config.googleSpreadsheetId;
    if (!targetId) {
      setSheetActionError('Insira um ID de Planilha válido primeiro.');
      return;
    }
    if (!googleToken) {
      setSheetActionError('Por favor, inicie sessão no Google primeiro.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Importar Programação',
      message: 'Tem a certeza que deseja IMPORTAR a grelha de programas a partir do Google Sheets? Isto irá SUBSTITUIR totalmente a programação local atual.',
      onConfirm: async () => {
        setSheetActionStatus('A ler programação do Google Sheets...');
        setSheetActionError(null);
        setSheetActionSuccess(null);

        try {
          const importedShows = await GoogleSheetsService.importShowsFromSpreadsheet(targetId);
          
          const currentDb = { ...TRS_Database_Service.getDatabase() };
          currentDb.shows = importedShows;
          localStorage.setItem('trs_radio_db', JSON.stringify(currentDb));
          onRefresh();

          setSheetActionSuccess(`Grelha de programas importada com sucesso! (${importedShows.length} programas carregados)`);
          await TRS_Database_Service.addLog(employeeEmail, 'Importação de programação', 'SETTINGS', `Programação substituída via importação da planilha Google Sheets`);
        } catch (err: any) {
          console.error(err);
          setSheetActionError(err.message || 'Falha ao importar programação do Google Sheets. Verifique se a aba "Programas" existe e contém dados válidos.');
        } finally {
          setSheetActionStatus(null);
        }
      }
    });
  };

  const canManage = hasPermission('settings', 'manage');

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    setIsSaving(true);
    try {
      await TRS_Database_Service.updateConfig(configForm, employeeEmail);
      onRefresh();
      alert('Configurações do sistema gravadas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao gravar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy Google Apps Script Code
  const handleCopyScript = () => {
    const code = TRS_Database_Service.getGoogleAppsScriptCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Download Backup JSON
  const handleDownloadBackup = () => {
    try {
      const backupData = TRS_Database_Service.exportBackup();
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trs-database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      TRS_Database_Service.addLog(employeeEmail, 'Cópia de segurança descarregada', 'SETTINGS', 'O utilizador descarregou o ficheiro JSON de backup do banco de dados.');
    } catch (err) {
      console.error(err);
      alert('Falha ao exportar backup.');
    }
  };

  // Upload Backup JSON
  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = TRS_Database_Service.restoreBackup(content);
      if (success) {
        setUploadSuccess(true);
        onRefresh();
        await TRS_Database_Service.addLog(employeeEmail, 'Cópia de segurança restaurada', 'SETTINGS', 'O utilizador carregou e aplicou uma cópia de segurança JSON.');
      } else {
        setUploadError('Ficheiro de backup inválido. Por favor, verifique a estrutura do ficheiro.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* RBAC Warning */}
      {!canManage && (
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Apenas utilizadores com privilégios de <strong>Super Administrador</strong> podem alterar configurações globais do sistema ou restaurar backups.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: General Settings Form */}
        <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800/85 pb-3">
            <Settings className="w-4 h-4 text-amber-500" />
            Configurações Globais TRS
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Nome da Rádio</label>
                <input
                  type="text"
                  value={configForm.radioName}
                  onChange={(e) => setConfigForm({ ...configForm, radioName: e.target.value })}
                  disabled={!canManage}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Slogan</label>
                <input
                  type="text"
                  value={configForm.slogan}
                  onChange={(e) => setConfigForm({ ...configForm, slogan: e.target.value })}
                  disabled={!canManage}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">E-mail de Contacto</label>
                <input
                  type="email"
                  value={configForm.email}
                  onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                  disabled={!canManage}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Telefone / Sede</label>
                <input
                  type="text"
                  value={configForm.phone}
                  onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                  disabled={!canManage}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Link WhatsApp API</label>
                <input
                  type="text"
                  value={configForm.whatsappUrl}
                  onChange={(e) => setConfigForm({ ...configForm, whatsappUrl: e.target.value })}
                  disabled={!canManage}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Endereço Sede</label>
                <input
                  type="text"
                  value={configForm.address}
                  onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                  disabled={!canManage}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    Modo de Manutenção
                  </span>
                  <p className="text-[10px] text-slate-500">Bloqueia o site público e exibe um ecrã de reparação.</p>
                </div>
                <input
                  type="checkbox"
                  checked={configForm.maintenanceMode}
                  onChange={(e) => setConfigForm({ ...configForm, maintenanceMode: e.target.checked })}
                  disabled={!canManage}
                  className="w-4 h-4 accent-amber-500 disabled:opacity-50 cursor-pointer"
                />
              </div>
            </div>

            {canManage && (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {isSaving ? 'A Gravar...' : 'Gravar Alterações'}
              </button>
            )}
          </form>
        </div>

        {/* Right: Cloud Sync and Backups */}
        <div className="space-y-6">
          
          {/* Section 1: Backup & Restore */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800/85 pb-3">
              <Database className="w-4 h-4 text-amber-500" />
              Cópias de Segurança & Backups JSON
            </h3>
            
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Exportar e importar toda a base de dados (notícias, campanhas, funcionários, log de auditorias e programações) num único ficheiro de texto JSON encriptado em localcache.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleDownloadBackup}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700/80"
              >
                <Download className="w-4 h-4 text-amber-500" />
                Descarregar Cópia (.json)
              </button>

              {canManage ? (
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleUploadBackup}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <button
                    className="w-full px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-dashed border-slate-800"
                  >
                    <Upload className="w-4 h-4" />
                    Restaurar Ficheiro (.json)
                  </button>
                </div>
              ) : (
                <div className="flex-1 p-2 bg-slate-950 border border-slate-850 rounded-xl text-center text-[10px] text-slate-500 font-mono">
                  Upload bloqueado por permissão
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-[10px] text-red-400 font-bold font-mono">{uploadError}</p>
            )}
            {uploadSuccess && (
              <p className="text-[10px] text-emerald-400 font-bold font-mono flex items-center gap-1 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cópia de segurança restaurada e aplicada com sucesso!
              </p>
            )}
          </div>

          {/* Section: Direct Google Sheets Integration (OAuth) */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800/85 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Integração Direta Google Sheets (OAuth)
            </h3>

            <p className="text-slate-400 text-[10px] leading-relaxed">
              Sincronize toda a base de dados da rádio (Programas, Pedidos, Mensagens, Patrocinadores e Campanhas) diretamente com os seus documentos Google Sheets na cloud, com permissão do utilizador. Review the card below to connect Google Drive and Google Sheets to your app.
            </p>

            {/* Google Authentication Section */}
            {!googleUser ? (
              <div className="pt-2">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoggingIn}
                  type="button"
                  className="w-full cursor-pointer hover:opacity-90 transition-all focus:outline-none"
                >
                  <div className="flex items-center justify-center gap-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl py-2 w-full shadow-md">
                    {isGoogleLoggingIn ? (
                      <Loader2 className="w-4 h-4 text-slate-900 animate-spin" />
                    ) : (
                      <div className="shrink-0">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '18px', height: '18px' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                      </div>
                    )}
                    <span className="text-xs font-extrabold tracking-wide text-slate-800">Iniciar sessão com o Google</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {googleUser.photoURL ? (
                      <img src={googleUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-750" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        G
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">{googleUser.displayName || 'Utilizador Google'}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{googleUser.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleGoogleLogout}
                    type="button"
                    className="px-2.5 py-1 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-lg text-[10px] uppercase font-bold transition-all cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}

            {/* Spreadsheet Configurations */}
            {googleUser && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400">ID da Planilha Google (Spreadsheet ID)</label>
                    <button 
                      onClick={handleCreateAutoSpreadsheet}
                      disabled={!!sheetActionStatus}
                      type="button"
                      className="text-amber-500 hover:underline hover:text-amber-400 text-[10px] font-bold cursor-pointer disabled:opacity-50"
                    >
                      Criar Nova Planilha
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={spreadsheetIdForm}
                      onChange={(e) => setSpreadsheetIdForm(e.target.value)}
                      placeholder="Cole o ID da planilha (ex: 1A2B3C...)"
                      disabled={!canManage || !!sheetActionStatus}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-[10px] disabled:opacity-50"
                    />
                    {canManage && (
                      <button
                        onClick={handleSaveSpreadsheetId}
                        disabled={!!sheetActionStatus}
                        type="button"
                        className="px-3 bg-slate-850 hover:bg-slate-750 text-amber-500 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer border border-slate-800"
                        title="Gravar ID"
                      >
                        Gravar
                      </button>
                    )}
                  </div>
                </div>

                {/* Operations Section */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleExportToSheets}
                    disabled={!!sheetActionStatus}
                    type="button"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700/80 text-center disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-emerald-500" />
                    <span>Exportar Tudo</span>
                    <span className="text-[8px] text-slate-400 font-normal">Enviar todas as tabelas</span>
                  </button>

                  <button
                    onClick={handleImportScheduleFromSheets}
                    disabled={!!sheetActionStatus}
                    type="button"
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700/80 text-center disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>Importar Grelha</span>
                    <span className="text-[8px] text-slate-400 font-normal">Carregar programação</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Feedback Messages */}
            {sheetActionStatus && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2.5 text-[10px] text-amber-400 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>{sheetActionStatus}</span>
              </div>
            )}
            {sheetActionError && (
              <p className="text-[10px] text-red-400 font-bold font-mono text-center bg-red-500/10 p-2.5 border border-red-500/20 rounded-xl">{sheetActionError}</p>
            )}
            {sheetActionSuccess && (
              <p className="text-[10px] text-emerald-400 font-bold font-mono text-center flex items-center gap-1.5 justify-center bg-emerald-500/10 p-2.5 border border-emerald-500/20 rounded-xl animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{sheetActionSuccess}</span>
              </p>
            )}
          </div>

          {/* Section 2: Google Sheets API Connection */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800/85 pb-3">
              <Cloud className="w-4 h-4 text-amber-500" />
              Sincronização Google Sheets (API)
            </h3>

            <p className="text-slate-400 text-[10px] leading-relaxed">
              Deseja conectar uma planilha do Google Sheets real para salvar as suas notícias e funcionários na cloud? Siga estes 3 passos simples:
            </p>

            <ol className="list-decimal list-inside text-[10px] text-slate-400 space-y-1.5 leading-relaxed bg-slate-950/40 p-3 rounded-2xl border border-slate-900">
              <li>Clique no botão abaixo para copiar o script de integração.</li>
              <li>Na sua planilha do Google Sheets, vá para <strong>Extensões → Apps Script</strong>, cole o código e clique em Implementar como um <strong className="text-white">App Web</strong>.</li>
              <li>Publique com acesso para "Qualquer pessoa" e cole o link no campo abaixo.</li>
            </ol>

            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Link do App Web Google Apps Script</label>
                <input
                  type="text"
                  value={configForm.googleAppsScriptUrl}
                  onChange={(e) => setConfigForm({ ...configForm, googleAppsScriptUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  disabled={!canManage}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-[10px]"
                />
              </div>

              <button
                onClick={handleCopyScript}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Código Copiado com Sucesso!' : 'Copiar Código Google Apps Script'}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              {confirmModal.title}
            </h3>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  await confirmModal.onConfirm();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-md shadow-red-600/10"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
