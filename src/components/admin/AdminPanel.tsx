import React, { useState, useEffect } from 'react';
import { 
  Radio, LayoutDashboard, Newspaper, Megaphone, Users, MessageSquare, 
  Settings, LogOut, ArrowLeft, Menu, X, Cloud, CloudOff, RefreshCw,
  User as UserIcon, ShieldAlert, Edit3, UserCog, Camera, Save
} from 'lucide-react';
import { TRS_Database, TRS_Database_Service, Employee } from '../../services/db';

// Import subcomponents
import AdminLogin from './AdminLogin';
import AdminDashboardHome from './AdminDashboardHome';
import AdminContent from './AdminContent';
import AdminAdManager from './AdminAdManager';
import AdminUsers from './AdminUsers';
import AdminMessagesAndLogs from './AdminMessagesAndLogs';
import AdminSettings from './AdminSettings';

interface AdminPanelProps {
  onBackToSite: () => void;
}

export default function AdminPanel({ onBackToSite }: AdminPanelProps) {
  // Session states
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [database, setDatabase] = useState<TRS_Database | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'ads' | 'users' | 'messages' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  // Profile edit states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    avatar: ''
  });

  const handleOpenProfileModal = () => {
    if (!currentEmployee) return;
    setProfileForm({
      name: currentEmployee.name,
      email: currentEmployee.email,
      phone: currentEmployee.phone,
      password: currentEmployee.passwordHash,
      avatar: currentEmployee.avatar
    });
    setProfileModalOpen(true);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee || !database) return;

    if (!profileForm.name || !profileForm.email) {
      showToast('Nome e E-mail são obrigatórios.', 'error');
      return;
    }

    try {
      const updatedFields = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        passwordHash: profileForm.password,
        avatar: profileForm.avatar
      };

      await TRS_Database_Service.update('employees', currentEmployee.id, updatedFields, currentEmployee.email);
      
      // Update session in case email changed
      localStorage.setItem('trs_admin_session', profileForm.email);
      
      await TRS_Database_Service.addLog(
        profileForm.email,
        'Perfil atualizado',
        'SETTINGS',
        'O utilizador atualizou as suas próprias informações de perfil (Nome, Telefone, Avatar ou Senha).'
      );

      setProfileModalOpen(false);
      await handleRefresh();
      showToast('Perfil pessoal atualizado com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao guardar as alterações do perfil.', 'error');
    }
  };

  // Initialize DB & load session
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      // Fetch DB local state
      const db = await TRS_Database_Service.getDatabase();
      setDatabase(db);

      // Check existing session
      const storedEmail = localStorage.getItem('trs_admin_session');
      if (storedEmail) {
        const emp = db.employees.find(e => e.email === storedEmail && e.status === 'Ativo');
        if (emp) {
          setCurrentEmployee(emp);
        } else {
          localStorage.removeItem('trs_admin_session');
        }
      }
      setIsLoading(false);
    };
    init();

    // Subscribe to DB updates for real-time frontend and admin synchronization
    const unsubscribe = TRS_Database_Service.subscribe(async () => {
      const db = await TRS_Database_Service.getDatabase();
      setDatabase(db);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setSyncing(true);
    const db = await TRS_Database_Service.getDatabase();
    setDatabase(db);
    
    // update currentEmployee reference in case details changed
    if (currentEmployee) {
      const refreshedEmp = db.employees.find(e => e.id === currentEmployee.id);
      if (refreshedEmp) {
        setCurrentEmployee(refreshedEmp);
      }
    }
    
    setTimeout(() => setSyncing(false), 500);
  };

  // Login Success Callback
  const handleLoginSuccess = (employee: Employee) => {
    setCurrentEmployee(employee);
    localStorage.setItem('trs_admin_session', employee.email);
    handleRefresh();
  };

  // Logout Handler
  const handleLogout = async () => {
    if (currentEmployee) {
      await TRS_Database_Service.addLog(currentEmployee.email, 'Fim de sessão efetuado', 'AUTH', 'O utilizador efetuou logout voluntariamente do painel de administração.');
    }
    setCurrentEmployee(null);
    localStorage.removeItem('trs_admin_session');
  };

  // RBAC Permission check helper
  const hasPermission = (module: string, action: 'view' | 'manage'): boolean => {
    if (!currentEmployee || !database) return false;
    const role = database.roles.find(r => r.id === currentEmployee.roleId);
    if (!role) return false;

    const access = role.permissions[module];
    if (!access) return false;

    if (action === 'view') {
      return access === 'view' || access === 'manage';
    }
    if (action === 'manage') {
      return access === 'manage';
    }
    return false;
  };

  // Loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Radio className="w-12 h-12 text-amber-500 animate-pulse" />
        <span className="text-slate-500 font-mono text-xs uppercase tracking-wider animate-pulse">A inicializar painel de controlo...</span>
      </div>
    );
  }

  // Not Logged In screen
  if (!currentEmployee || !database) {
    return (
      <AdminLogin 
        onLoginSuccess={handleLoginSuccess}
        onBackToSite={onBackToSite}
      />
    );
  }

  // Find Role details
  const activeRole = database.roles.find(r => r.id === currentEmployee.roleId);

  // Navigation Items
  const menuItems = [
    { id: 'dashboard', label: 'Estatísticas Gerais', icon: LayoutDashboard, module: 'logs' },
    { id: 'content', label: 'Conteúdo (Grelha/Notícias)', icon: Newspaper, module: 'news' },
    { id: 'ads', label: 'Publicidade & Patrocinadores', icon: Megaphone, module: 'advertising' },
    { id: 'users', label: 'Pessoal & Permissões', icon: Users, module: 'users' },
    { id: 'messages', label: 'Contacto de Ouvintes', icon: MessageSquare, module: 'messages' },
    { id: 'settings', label: 'Configurações Globais', icon: Settings, module: 'settings' },
  ];

  // Filter menu items based on read permission (so users can't even see tabs they don't have view rights for!)
  const allowedMenuItems = menuItems.filter(item => hasPermission(item.module, 'view'));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Upper header */}
      <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-900 rounded-lg lg:hidden text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500" />
            <h1 className="font-extrabold uppercase tracking-widest text-white text-xs sm:text-sm">TRS ADMIN <span className="text-amber-500">SYSTEM</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Cloud Sync Status Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 border border-slate-900 rounded-full text-[10px] font-mono">
            {database.config.googleAppsScriptUrl ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-400 font-bold">Cloud Sheets Ativa</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Offline-Local Cache</span>
              </>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={syncing}
            className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-slate-900 transition-all cursor-pointer"
            title="Sincronizar base de dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          <button
            onClick={onBackToSite}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-850 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Site Público
          </button>

          {/* User Details */}
          <button 
            onClick={handleOpenProfileModal}
            className="flex items-center gap-2.5 pl-3 border-l border-slate-900 hover:opacity-85 transition-all cursor-pointer group text-left focus:outline-none"
            title="Editar o meu perfil pessoal"
          >
            <img 
              src={currentEmployee.avatar} 
              alt="" 
              className="w-8 h-8 rounded-full border border-slate-850 object-cover group-hover:border-amber-500 transition-all"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <div className="hidden sm:block text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-black text-white truncate max-w-[120px] group-hover:text-amber-400 transition-all">{currentEmployee.name}</p>
                <Edit3 className="w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400 opacity-60 group-hover:opacity-100 transition-all" />
              </div>
              <p className="text-[9px] font-black uppercase text-amber-500 font-mono tracking-wider">{activeRole ? activeRole.name : 'Acesso'}</p>
            </div>
          </button>

        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* Left Sidebar Menu */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] w-64 bg-slate-950 border-r border-slate-900 z-30 transition-transform duration-300 ease-in-out shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 flex flex-col h-full justify-between">
            
            <nav className="space-y-1.5">
              <span className="px-3 text-[9px] uppercase tracking-wider font-extrabold text-slate-500 font-mono block mb-3">Módulos Administrativos</span>
              
              {allowedMenuItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setSidebarOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                      active 
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/5' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="space-y-2 border-t border-slate-900 pt-4">
              <button
                onClick={onBackToSite}
                className="w-full lg:hidden px-3 py-2 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-3 hover:bg-slate-900/30 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Site Público
              </button>

              <button
                onClick={handleOpenProfileModal}
                className="w-full px-3 py-2 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-3 hover:bg-slate-900/30 rounded-xl cursor-pointer"
              >
                <UserCog className="w-4 h-4 text-amber-500" />
                Editar Meu Perfil
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-black uppercase text-red-400 hover:text-red-300 hover:bg-red-950/20 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Encerrar Sessão
              </button>
            </div>

          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          />
        )}

        {/* Core Main Working Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* Header of Active Tab */}
          <div className="mb-6 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white capitalize flex items-center gap-2">
              {activeTab === 'dashboard' && 'Geral & Estatísticas'}
              {activeTab === 'content' && 'Gestão de Conteúdo'}
              {activeTab === 'ads' && 'Publicidade & Patrocinadores'}
              {activeTab === 'users' && 'Gestão de Pessoal'}
              {activeTab === 'messages' && 'Ouvintes & Contacto'}
              {activeTab === 'settings' && 'Definições do Sistema'}
            </h2>
            <p className="text-xs text-slate-400">
              {activeTab === 'dashboard' && 'Acompanhamento de audiência, ouvintes ativos em Luanda e auditoria de ações.'}
              {activeTab === 'content' && 'Criação de notícias de música, publicação de eventos e horários da grelha de locução.'}
              {activeTab === 'ads' && 'Controlo de banners patrocinados, limites de visualização de campanhas e métricas comerciais.'}
              {activeTab === 'users' && 'Registo de locutores e equipe administrativa com restrição de permissões (RBAC).'}
              {activeTab === 'messages' && 'Visualização de mensagens enviadas por ouvintes via formulário de contacto do site.'}
              {activeTab === 'settings' && 'Configuração de contactos da rádio, modo de manutenção e links de backup/Google Sheets.'}
            </p>
          </div>

          {/* Module Switcher */}
          <div className="animate-fadeIn">
            {activeTab === 'dashboard' && (
              <AdminDashboardHome 
                db={database} 
                hasPermission={hasPermission} 
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}

            {activeTab === 'content' && (
              <AdminContent 
                db={database} 
                employeeEmail={currentEmployee.email}
                hasPermission={hasPermission}
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}

            {activeTab === 'ads' && (
              <AdminAdManager 
                db={database} 
                employeeEmail={currentEmployee.email}
                hasPermission={hasPermission}
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}

            {activeTab === 'users' && (
              <AdminUsers 
                db={database} 
                employeeEmail={currentEmployee.email}
                hasPermission={hasPermission}
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}

            {activeTab === 'messages' && (
              <AdminMessagesAndLogs 
                db={database} 
                employeeEmail={currentEmployee.email}
                hasPermission={hasPermission}
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettings 
                db={database} 
                employeeEmail={currentEmployee.email}
                hasPermission={hasPermission}
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}
          </div>

        </main>

      </div>

      {/* Profile Editing Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-900 flex justify-between items-center bg-slate-900/30">
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Editar o Meu Perfil</h3>
              </div>
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              
              {/* Profile Picture Upload & Preview */}
              <div className="flex flex-col items-center gap-3 bg-slate-900/20 p-4 border border-slate-900/60 rounded-xl">
                <div className="relative group">
                  <img 
                    src={profileForm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                    alt="Foto de perfil" 
                    className="w-20 h-20 rounded-full border-2 border-slate-800 object-cover group-hover:border-amber-500 transition-all"
                  />
                  <label className="absolute bottom-0 right-0 p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full cursor-pointer shadow-md transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProfileImageUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono text-slate-500">Clique no ícone de câmara para alterar a sua foto de perfil</span>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Nome Completo</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Seu nome"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">E-mail de Login</label>
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    onChange={e => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="exemplo@trsradioonline.com"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Telemóvel / Telefone</label>
                  <input 
                    type="text" 
                    value={profileForm.phone} 
                    onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+244 9..."
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Senha de Acesso</label>
                <input 
                  type="password" 
                  value={profileForm.password} 
                  onChange={e => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder="Insira a sua nova senha"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-900 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 z-[200] max-w-sm animate-slideIn ${
          toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30' :
          toast.type === 'error' ? 'bg-red-950/90 text-red-300 border-red-500/30' :
          'bg-blue-950/90 text-blue-300 border-blue-500/30'
        }`}>
          <span className="w-2 h-2 rounded-full bg-current animate-ping shrink-0" />
          <span className="text-xs font-bold leading-normal">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
