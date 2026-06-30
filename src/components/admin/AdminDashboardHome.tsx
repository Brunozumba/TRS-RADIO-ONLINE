import React, { useState, useEffect } from 'react';
import { 
  Users, Eye, Newspaper, Radio, Play, Megaphone, Heart, MessageSquare, 
  Activity, Globe, HelpCircle, ArrowUpRight, TrendingUp, Clock, ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { TRS_Database, TRS_Database_Service, SystemLog } from '../../services/db';

interface AdminDashboardHomeProps {
  db: TRS_Database;
  onRefresh: () => void;
  hasPermission?: (module: string, action: 'view' | 'manage') => boolean;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminDashboardHome({ db, onRefresh, showToast }: AdminDashboardHomeProps) {
  // Live simulation state
  const [onlineListeners, setOnlineListeners] = useState(145);
  const [recentLogs, setRecentLogs] = useState<SystemLog[]>([]);

  // Simulation of live listener fluctuates
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineListeners((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        const next = prev + delta;
        return next < 30 ? 30 : next > 250 ? 240 : next;
      });
    }, 5000);

    // Get latest 5 logs
    TRS_Database_Service.query('logs').then((logs) => {
      setRecentLogs(logs.slice(0, 5));
    });

    return () => clearInterval(interval);
  }, [db]);

  // Chart 1: Listeners hourly flow in the past 24 hours
  const listenersChartData = [
    { time: '00:00', ouvintes: 85, pico: 110 },
    { time: '03:00', ouvintes: 42, pico: 60 },
    { time: '06:00', ouvintes: 110, pico: 130 },
    { time: '09:00', ouvintes: 195, pico: 220 },
    { time: '12:00', ouvintes: 165, pico: 190 },
    { time: '15:00', ouvintes: 145, pico: 175 },
    { time: '18:00', ouvintes: 225, pico: 260 },
    { time: '21:00', ouvintes: 180, pico: 210 }
  ];

  // Chart 2: News views by categories
  const newsCategoryData = db.news.reduce((acc: any[], item) => {
    const existing = acc.find((c) => c.name === item.category);
    if (existing) {
      existing.views += item.views || 0;
      existing.posts += 1;
    } else {
      acc.push({ name: item.category, views: item.views || 0, posts: 1 });
    }
    return acc;
  }, []);

  // Default news chart data if none loaded yet
  const displayNewsData = newsCategoryData.length > 0 ? newsCategoryData : [
    { name: 'Eventos', views: 2800, posts: 2 },
    { name: 'Música', views: 3820, posts: 1 },
    { name: 'Cultura', views: 940, posts: 1 }
  ];

  // Ad clicks data
  const adsClicksData = db.campaigns.map((c) => ({
    name: c.title.substring(0, 15) + '...',
    cliques: c.clicksCount,
    limite: c.maxClicks
  })).slice(0, 4);

  // Audience geography
  const geographicData = [
    { country: 'Angola (Luanda, Cabinda, Huambo)', percentage: '58%', icon: '🇦🇴', count: '84' },
    { country: 'Portugal (Lisboa, Porto, Braga)', percentage: '19%', icon: '🇵🇹', count: '28' },
    { country: 'Brasil (Rio de Janeiro, São Paulo)', percentage: '9%', icon: '🇧🇷', count: '13' },
    { country: 'Moçambique (Maputo, Beira)', percentage: '6%', icon: '🇲🇿', count: '9' },
    { country: 'Outros (Reino Unido, França, EUA)', percentage: '8%', icon: '🌐', count: '11' }
  ];

  const COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      
      {/* Top Welcome Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-red-600/10 to-transparent border border-amber-500/15 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Painel Central de Controlo TRS
          </h2>
          <p className="text-slate-400 text-xs">
            Bem-vindo de volta! Monitorize os canais de streaming, as notícias culturais, os pedidos de música e os anúncios de patrocinadores em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Servidor Online</span>
        </div>
      </div>

      {/* Bento Grid Metrics Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="space-y-1 z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ouvintes Online</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{onlineListeners}</span>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +4%
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Transmissão em tempo real</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl z-10 group-hover:scale-115 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden group hover:border-red-600/30 transition-all">
          <div className="space-y-1 z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visitas à Página</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">12,430</span>
              <span className="text-[10px] text-slate-400 font-mono">Total</span>
            </div>
            <p className="text-[10px] text-slate-500">Últimos 30 dias</p>
          </div>
          <div className="p-3 bg-red-600/10 text-red-500 rounded-xl z-10 group-hover:scale-115 transition-transform">
            <Eye className="w-5 h-5" />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="space-y-1 z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Banners Ativos</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{db.campaigns.filter(c => c.status === 'Ativo').length}</span>
              <span className="text-[10px] text-slate-400 font-mono">/{db.campaigns.length} total</span>
            </div>
            <p className="text-[10px] text-slate-500">Campanhas publicitárias</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl z-10 group-hover:scale-115 transition-transform">
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-md relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="space-y-1 z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Notícias & Programas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{db.news.length + db.shows.length}</span>
              <span className="text-[10px] text-slate-400 font-mono">{db.news.length} art.</span>
            </div>
            <p className="text-[10px] text-slate-500">Conteúdos publicados</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl z-10 group-hover:scale-115 transition-transform">
            <Newspaper className="w-5 h-5" />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>

      {/* Charts Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart A: Listening Flow (2/3 width) */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                Sintonização de Ouvintes (24h)
              </h3>
              <p className="text-[10px] text-slate-400">Pico de tráfego registado por blocos horários.</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Ouvintes</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-700/60" /> Pico Máximo</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={listenersChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOuvintes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '10px' }}
                  itemStyle={{ fontSize: '11px', color: '#f59e0b' }}
                />
                <Area type="monotone" dataKey="ouvintes" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorOuvintes)" />
                <Area type="monotone" dataKey="pico" stroke="#b45309" strokeDasharray="5 5" fill="none" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Distribution (1/3 width) */}
        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-red-500" />
              Origem Geográfica
            </h3>
            <p className="text-[10px] text-slate-400">Percentual de ouvintes sintonizados por país.</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {geographicData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-950/40 rounded-xl border border-slate-900/60">
                <div className="flex items-center gap-2">
                  <span className="text-base font-sans">{item.icon}</span>
                  <span className="font-semibold text-slate-300">{item.country}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-500 text-[10px]">({item.count})</span>
                  <span className="font-bold text-amber-500">{item.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Secondary Graphs and Activity logs split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: News Views Analytics */}
        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-emerald-500" />
              Impacto por Categoria de Notícias (Leituras)
            </h3>
            <p className="text-[10px] text-slate-400">Total acumulado de leituras efetuadas por leitores.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayNewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', color: '#10b981' }}
                />
                <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                  {displayNewsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Security Logs Feed */}
        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
              Logs de Atividade Administrativa Recentes
            </h3>
            <p className="text-[10px] text-slate-400">Registo automático das últimas ações no sistema.</p>
          </div>

          <div className="space-y-3 pt-1">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-start gap-3 text-xs">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider ${
                  log.module === 'AUTH' ? 'bg-red-950/60 text-red-400 border border-red-500/10' :
                  log.module === 'NEWS' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {log.module}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-200 truncate">{log.action}</span>
                    <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{log.details}</p>
                  <p className="text-[9px] text-slate-600 font-mono mt-0.5">Por: {log.userEmail} | IP: {log.ipAddress}</p>
                </div>
              </div>
            ))}

            {recentLogs.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-6">Nenhum registo disponível.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
