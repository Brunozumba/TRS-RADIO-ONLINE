import React, { useState } from 'react';
import { 
  Newspaper, Calendar, Plus, Edit, Trash2, Save, Undo, Eye, Search, 
  FileText, Clock, User, Tag, Image, ShieldAlert
} from 'lucide-react';
import { TRS_Database, TRS_Database_Service } from '../../services/db';
import { NewsItem, Show } from '../../types';

interface AdminContentProps {
  db: TRS_Database;
  employeeEmail: string;
  hasPermission: (module: string, action: 'view' | 'manage') => boolean;
  onRefresh: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminContent({ db, employeeEmail, hasPermission, onRefresh, showToast }: AdminContentProps) {
  const [activeSubTab, setActiveSubTab] = useState<'news' | 'schedule'>('news');
  const [newsSearch, setNewsSearch] = useState('');
  const [scheduleSearch, setScheduleSearch] = useState('');

  // News Form states
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Música' as NewsItem['category'],
    image: '',
    author: '',
  });

  // Schedule Form states
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [showDay, setShowDay] = useState<'Segunda a Sexta' | 'Sábado' | 'Domingo'>('Segunda a Sexta');
  const [showForm, setShowForm] = useState<{
    title: string;
    timeStart: string;
    timeEnd: string;
    description: string;
    hosts: string;
    tag: string;
    day: 'Segunda a Sexta' | 'Sábado' | 'Domingo';
  }>({
    title: '',
    timeStart: '',
    timeEnd: '',
    description: '',
    hosts: '',
    tag: '',
    day: 'Segunda a Sexta',
  });

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

  const canManage = hasPermission(activeSubTab, 'manage');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // NEWS CRUD HANDLERS
  // ==========================================
  const handleOpenNewsModal = (news: NewsItem | null) => {
    if (!canManage) return;
    
    if (news) {
      setEditingNews(news);
      setNewsForm({
        title: news.title,
        excerpt: news.excerpt,
        content: news.content,
        category: news.category,
        image: news.image,
        author: news.author,
      });
    } else {
      setEditingNews(null);
      setNewsForm({
        title: '',
        excerpt: '',
        content: '',
        category: 'Música',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
        author: 'Redação TRS',
      });
    }
    setNewsModalOpen(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) return;

    if (editingNews) {
      // Update
      const updated: Partial<NewsItem> = {
        title: newsForm.title,
        excerpt: newsForm.excerpt,
        content: newsForm.content,
        category: newsForm.category,
        image: newsForm.image,
        author: newsForm.author,
      };
      await TRS_Database_Service.update('news', editingNews.id, updated, employeeEmail);
    } else {
      // Create
      const created: NewsItem = {
        id: `news-${Date.now()}`,
        title: newsForm.title,
        excerpt: newsForm.excerpt,
        content: newsForm.content,
        category: newsForm.category,
        image: newsForm.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
        author: newsForm.author || 'Equipa TRS',
        date: new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }),
        views: 0
      };
      await TRS_Database_Service.insert('news', created, employeeEmail);
    }

    setNewsModalOpen(false);
    onRefresh();
  };

  const handleDeleteNews = async (id: string) => {
    if (!canManage) return;
    setConfirmModal({
      isOpen: true,
      title: 'Apagar Notícia',
      message: 'Tem a certeza de que deseja apagar esta notícia permanentemente?',
      onConfirm: async () => {
        await TRS_Database_Service.delete('news', id, employeeEmail);
        onRefresh();
      }
    });
  };

  // ==========================================
  // SCHEDULE CRUD HANDLERS
  // ==========================================
  const handleOpenShowModal = (show: Show | null, day: typeof showDay) => {
    if (!canManage) return;
    
    setShowDay(day);
    if (show) {
      setEditingShow(show);
      setShowForm({
        title: show.title,
        timeStart: show.timeStart,
        timeEnd: show.timeEnd,
        description: show.description,
        hosts: show.hosts ? show.hosts.join(', ') : '',
        tag: show.tag || '',
        day: show.day || day,
      });
    } else {
      setEditingShow(null);
      setShowForm({
        title: '',
        timeStart: '12:00',
        timeEnd: '13:00',
        description: '',
        hosts: '',
        tag: 'Kizomba',
        day: day,
      });
    }
    setScheduleModalOpen(true);
  };

  const handleSaveShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showForm.title || !showForm.timeStart || !showForm.timeEnd) return;

    const formattedHosts = showForm.hosts ? showForm.hosts.split(',').map(h => h.trim()) : [];

    if (editingShow) {
      // Update
      const updated: Partial<Show> = {
        title: showForm.title,
        timeStart: showForm.timeStart,
        timeEnd: showForm.timeEnd,
        description: showForm.description,
        hosts: formattedHosts,
        tag: showForm.tag,
        day: showForm.day,
      };
      await TRS_Database_Service.update('shows', editingShow.id, updated, employeeEmail);
    } else {
      // Create
      const created: Show = {
        id: `show-${Date.now()}`,
        title: showForm.title,
        timeStart: showForm.timeStart,
        timeEnd: showForm.timeEnd,
        description: showForm.description,
        hosts: formattedHosts,
        tag: showForm.tag,
        day: showForm.day,
      };
      await TRS_Database_Service.insert('shows', created, employeeEmail);
    }

    setScheduleModalOpen(false);
    onRefresh();
  };

  const handleDeleteShow = async (id: string) => {
    if (!canManage) return;
    setConfirmModal({
      isOpen: true,
      title: 'Remover Programa',
      message: 'Tem a certeza de que deseja remover este programa da grelha de transmissão?',
      onConfirm: async () => {
        await TRS_Database_Service.delete('shows', id, employeeEmail);
        onRefresh();
      }
    });
  };

  // Filter lists
  const filteredNews = db.news.filter(n => 
    n.title.toLowerCase().includes(newsSearch.toLowerCase()) || 
    n.category.toLowerCase().includes(newsSearch.toLowerCase()) ||
    n.author.toLowerCase().includes(newsSearch.toLowerCase())
  );

  const filteredShows = db.shows.filter(s => 
    s.title.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
    (s.hosts && s.hosts.some(h => h.toLowerCase().includes(scheduleSearch.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      
      {/* Category selector menu */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab('news')}
          className={`px-5 py-3 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'news' 
              ? 'border-amber-500 text-white bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          Gestão de Notícias ({db.news.length})
        </button>
        <button
          onClick={() => setActiveSubTab('schedule')}
          className={`px-5 py-3 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'schedule' 
              ? 'border-amber-500 text-white bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Grelha de Programação ({db.shows.length})
        </button>
      </div>

      {/* RBAC Visual Warning */}
      {!canManage && (
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>O seu cargo atual apenas lhe confere permissões de <strong>Visualização</strong> neste módulo. Edições e exclusões estão desativadas.</span>
        </div>
      )}

      {/* ==========================================
          NEWS MANAGEMENT TAB
          ========================================== */}
      {activeSubTab === 'news' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                placeholder="Pesquisar por título, autor, categoria..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            
            {canManage && (
              <button
                onClick={() => handleOpenNewsModal(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/5"
              >
                <Plus className="w-4 h-4" />
                Nova Notícia
              </button>
            )}
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-x-auto shadow-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-850">
                <tr>
                  <th className="p-4 font-bold">Título / Autor</th>
                  <th className="p-4 font-bold">Categoria</th>
                  <th className="p-4 font-bold">Data Publicação</th>
                  <th className="p-4 font-bold">Visualizações</th>
                  <th className="p-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-10 h-10 object-cover rounded-xl border border-slate-800 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=60';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-extrabold text-white truncate max-w-xs sm:max-w-md">{item.title}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">Por: {item.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-bold text-[9px] uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-medium">{item.date}</td>
                    <td className="p-4 text-slate-400 font-mono font-bold">{item.views.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManage ? (
                          <>
                            <button
                              onClick={() => handleOpenNewsModal(item)}
                              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Editar notícia"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNews(item.id)}
                              className="p-1.5 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar notícia"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-600 uppercase font-bold font-mono">Bloqueado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredNews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Nenhuma notícia encontrada com os termos inseridos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          SCHEDULE GRELHA TAB
          ========================================== */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                placeholder="Pesquisar por programa ou locutor..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            
            {canManage && (
              <button
                onClick={() => handleOpenShowModal(null, 'Segunda a Sexta')}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/5"
              >
                <Plus className="w-4 h-4" />
                Adicionar Programa
              </button>
            )}
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-x-auto shadow-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-850">
                <tr>
                  <th className="p-4 font-bold">Programa</th>
                  <th className="p-4 font-bold">Dia da Semana</th>
                  <th className="p-4 font-bold">Horário</th>
                  <th className="p-4 font-bold">Locutores / Anfitriões</th>
                  <th className="p-4 font-bold">Etiqueta / Ritmo</th>
                  <th className="p-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredShows.map((show) => (
                  <tr key={show.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <div className="min-w-0">
                        <p className="font-extrabold text-white">{show.title}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-sm mt-0.5">{show.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[10px] uppercase font-extrabold">
                        {show.day || 'Segunda a Sexta'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono font-bold flex items-center gap-1.5 pt-6">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {show.timeStart} - {show.timeEnd}
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {show.hosts ? show.hosts.join(', ') : 'Voz Eletrónica'}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-[9px] font-bold">
                        {show.tag || 'Geral'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManage ? (
                          <>
                            <button
                              onClick={() => handleOpenShowModal(show, show.day || 'Segunda a Sexta')}
                              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Editar programa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteShow(show.id)}
                              className="p-1.5 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Remover programa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-600 uppercase font-bold font-mono">Bloqueado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredShows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Nenhum programa sintonizado nesta grelha.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS overlay forms
          ========================================== */}
      
      {/* 1. NEWS MODAL */}
      {newsModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl my-8 space-y-5">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Newspaper className="w-4 h-4 text-amber-500" />
              {editingNews ? 'Editar Artigo de Notícia' : 'Criar Novo Artigo de Notícia'}
            </h3>

            <form onSubmit={handleSaveNews} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Título Principal</label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    placeholder="Festival de Semba em Luanda..."
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Autor / Jornalista</label>
                  <input
                    type="text"
                    value={newsForm.author}
                    onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                    placeholder="Redação TRS / Nome do Locutor"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Categoria</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value as NewsItem['category'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Música">Música</option>
                    <option value="Cultura">Cultura</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Destaque">Destaque</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Foto de Capa da Notícia</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950 rounded-2xl p-4 transition-all relative group">
                    {newsForm.image ? (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden">
                        <img src={newsForm.image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="px-3 py-1.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase rounded-lg cursor-pointer hover:bg-amber-400 transition-all">
                            Alterar Foto
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, (base64) => setNewsForm({ ...newsForm, image: base64 }))}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setNewsForm({ ...newsForm, image: '' })}
                            className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-extrabold uppercase rounded-lg hover:bg-red-500 transition-all cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full py-8 flex flex-col items-center justify-center gap-2 cursor-pointer">
                        <div className="p-3 bg-slate-900 rounded-full text-slate-400 group-hover:text-amber-500 transition-colors">
                          <Image className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-300">Carregar Imagem da Notícia</span>
                        <span className="text-[10px] text-slate-500">Arraste ou clique para selecionar (PNG, JPG, WEBP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, (base64) => setNewsForm({ ...newsForm, image: base64 }))}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Excerto / Resumo curto</label>
                <input
                  type="text"
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  placeholder="Resumo de uma linha para chamar a atenção na home..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Conteúdo do Artigo</label>
                <textarea
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  placeholder="Escreva a notícia completa aqui. Pode utilizar quebras de linha para formatar os parágrafos..."
                  rows={6}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  Salvar Notícia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PROGRAMMING SHOW MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl my-8 space-y-5">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-4 h-4 text-amber-500" />
              {editingShow ? 'Editar Programa de Rádio' : 'Adicionar Programa à Grelha'}
            </h3>

            <form onSubmit={handleSaveShow} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Título do Show / Programa</label>
                <input
                  type="text"
                  value={showForm.title}
                  onChange={(e) => setShowForm({ ...showForm, title: e.target.value })}
                  placeholder="Kizomba Sem Limites, Bom Dia Angola..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Dia da Semana / Grelha</label>
                <select
                  value={showForm.day}
                  onChange={(e) => setShowForm({ ...showForm, day: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Segunda a Sexta">Segunda a Sexta-feira</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Hora Início (HH:MM)</label>
                  <input
                    type="text"
                    value={showForm.timeStart}
                    onChange={(e) => setShowForm({ ...showForm, timeStart: e.target.value })}
                    placeholder="14:00"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 text-center font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Hora Término (HH:MM)</label>
                  <input
                    type="text"
                    value={showForm.timeEnd}
                    onChange={(e) => setShowForm({ ...showForm, timeEnd: e.target.value })}
                    placeholder="18:00"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 text-center font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Locutores (separados por vírgula)</label>
                  <input
                    type="text"
                    value={showForm.hosts}
                    onChange={(e) => setShowForm({ ...showForm, hosts: e.target.value })}
                    placeholder="Mestre Cabinda, DJ VIP"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Etiqueta / Ritmo Principal</label>
                  <input
                    type="text"
                    value={showForm.tag}
                    onChange={(e) => setShowForm({ ...showForm, tag: e.target.value })}
                    placeholder="Kizomba / Cultura / Hits"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Descrição do Programa</label>
                <textarea
                  value={showForm.description}
                  onChange={(e) => setShowForm({ ...showForm, description: e.target.value })}
                  placeholder="Os ritmos mais sensuais para aquecer a tarde com dedicatórias..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  Gravar na Grelha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
