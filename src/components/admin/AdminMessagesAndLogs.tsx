import React, { useState } from 'react';
import { 
  MessageSquare, Clock, Search, ShieldCheck, Mail, Phone, Calendar, Check, 
  Trash2, Eye, Filter, User, HelpCircle, Activity, ShieldAlert
} from 'lucide-react';
import { TRS_Database, TRS_Database_Service, ContactMessage, SystemLog } from '../../services/db';

interface AdminMessagesAndLogsProps {
  db: TRS_Database;
  employeeEmail: string;
  hasPermission: (module: string, action: 'view' | 'manage') => boolean;
  onRefresh: () => void;
}

export default function AdminMessagesAndLogs({ db, employeeEmail, hasPermission, onRefresh }: AdminMessagesAndLogsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'messages' | 'logs'>('messages');
  const [messageSearch, setMessageSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logModuleFilter, setLogModuleFilter] = useState<string>('ALL');

  // Message Detail Form modal states
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyNotes, setReplyNotes] = useState('');

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

  const canManageMessages = hasPermission('messages', 'manage');
  const canViewLogs = hasPermission('logs', 'view');

  // ==========================================
  // MESSAGE HANDLERS
  // ==========================================
  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setReplyNotes(msg.notes || '');

    // Auto flag as read
    if (!msg.isRead) {
      await TRS_Database_Service.update('messages', msg.id, { isRead: true }, employeeEmail);
      onRefresh();
    }
  };

  const handleSaveReplyNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    await TRS_Database_Service.update('messages', selectedMessage.id, {
      notes: replyNotes,
      replied: true
    }, employeeEmail);

    setSelectedMessage(null);
    onRefresh();
  };

  const handleDeleteMessage = async (id: string) => {
    if (!canManageMessages) return;
    setConfirmModal({
      isOpen: true,
      title: 'Apagar Mensagem',
      message: 'Deseja realmente apagar esta mensagem de contacto permanentemente?',
      onConfirm: async () => {
        await TRS_Database_Service.delete('messages', id, employeeEmail);
        onRefresh();
      }
    });
  };

  // Filters
  const filteredMessages = db.messages.filter(m => 
    m.senderName.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.subject.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.message.toLowerCase().includes(messageSearch.toLowerCase())
  );

  const filteredLogs = db.logs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(logSearch.toLowerCase());
    
    const matchesModule = logModuleFilter === 'ALL' || l.module === logModuleFilter;
    
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab('messages')}
          className={`px-5 py-3 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'messages' 
              ? 'border-amber-500 text-white bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Mensagens Recebidas ({db.messages.filter(m => !m.isRead).length} por ler)
        </button>
        <button
          onClick={() => {
            if (canViewLogs) {
              setActiveSubTab('logs');
            } else {
              alert('O seu cargo de funcionário atual não possui autorização para aceder aos registos de segurança do sistema.');
            }
          }}
          className={`px-5 py-3 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            !canViewLogs ? 'opacity-40 cursor-not-allowed' : ''
          } ${
            activeSubTab === 'logs' 
              ? 'border-amber-500 text-white bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Logs de Auditoria ({db.logs.length})
        </button>
      </div>

      {/* ==========================================
          MESSAGES LIST PANEL
          ========================================== */}
      {activeSubTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                placeholder="Pesquisar remetente, assunto, mensagem..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Total de Mensagens: <strong className="text-slate-300">{db.messages.length}</strong>
            </p>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-x-auto shadow-lg animate-fadeIn">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-850">
                <tr>
                  <th className="p-4 font-bold">Remetente / Contacto</th>
                  <th className="p-4 font-bold">Assunto / Prévia</th>
                  <th className="p-4 font-bold">Data Envio</th>
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredMessages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    className={`transition-colors cursor-pointer ${
                      !msg.isRead ? 'bg-amber-500/5 hover:bg-amber-500/10 font-bold' : 'hover:bg-slate-900/10'
                    }`}
                    onClick={() => handleOpenMessage(msg)}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-extrabold text-white">{msg.senderName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{msg.senderEmail}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="min-w-0 max-w-xs sm:max-w-md">
                        <p className="font-extrabold text-slate-200 truncate">{msg.subject}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">{msg.message}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 font-medium">
                      {new Date(msg.timestamp).toLocaleDateString('pt-PT')} {new Date(msg.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          !msg.isRead ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {!msg.isRead ? 'Nova' : 'Lida'}
                        </span>
                        {msg.replied && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/10 text-[7px] font-extrabold uppercase font-mono">
                            Respondida
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenMessage(msg)}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Ler mensagem e responder"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canManageMessages && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Apagar permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredMessages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Nenhuma mensagem de ouvinte encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          LOGS AUDITORIA PANEL
          ========================================== */}
      {activeSubTab === 'logs' && canViewLogs && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Procurar logs por ação, utilizador..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-slate-400 text-xs font-mono flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                Módulo:
              </span>
              <select
                value={logModuleFilter}
                onChange={(e) => setLogModuleFilter(e.target.value)}
                className="w-full md:w-40 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="ALL">Todos os Módulos</option>
                <option value="AUTH">AUTH (Sessões)</option>
                <option value="NEWS">NEWS (Notícias)</option>
                <option value="SCHEDULE">SCHEDULE (Grelha)</option>
                <option value="ADVERTISING">ADVERTISING (Anúncios)</option>
                <option value="USERS">USERS (Funcionários)</option>
                <option value="SETTINGS">SETTINGS (Configurações)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-x-auto shadow-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-850">
                <tr>
                  <th className="p-4 font-bold">Módulo</th>
                  <th className="p-4 font-bold">Ação Realizada</th>
                  <th className="p-4 font-bold">Detalhes / Evento</th>
                  <th className="p-4 font-bold">Utilizador / IP</th>
                  <th className="p-4 font-bold">Data & Hora (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider ${
                        log.module === 'AUTH' ? 'bg-red-950/60 text-red-400 border border-red-500/10' :
                        log.module === 'NEWS' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10' :
                        log.module === 'SETTINGS' ? 'bg-amber-950/60 text-amber-400 border border-amber-500/10' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-white">{log.action}</td>
                    <td className="p-4 text-slate-400 font-medium max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="text-slate-300 font-semibold">{log.userEmail}</p>
                        <p className="text-[10px] text-slate-500 font-mono">IP: {log.ipAddress}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 font-mono font-bold">
                      {new Date(log.timestamp).toLocaleDateString('pt-PT')} {new Date(log.timestamp).toLocaleTimeString('pt-PT')}
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Nenhum registo de auditoria condizente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          MESSAGE READ/REPLY OVERLAY MODAL
          ========================================== */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl my-8 space-y-5">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Sinal de Mensagem Recebida
            </h3>

            <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-850 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
                <div>Remetente: <strong className="text-slate-300 font-bold">{selectedMessage.senderName}</strong></div>
                <div>Data: <strong className="text-slate-300 font-bold">{new Date(selectedMessage.timestamp).toLocaleDateString('pt-PT')}</strong></div>
                <div>E-mail: <strong className="text-slate-300 font-bold">{selectedMessage.senderEmail}</strong></div>
                <div>Contacto: <strong className="text-slate-300 font-bold">{selectedMessage.senderPhone || 'Nenhum'}</strong></div>
              </div>
              <div className="pt-2 border-t border-slate-900">
                <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[9px] text-amber-500">Assunto: {selectedMessage.subject}</h4>
                <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>

            <form onSubmit={handleSaveReplyNotes} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  Nota Administrativa de Resposta (Anotação Interna)
                </label>
                <textarea
                  value={replyNotes}
                  onChange={(e) => setReplyNotes(e.target.value)}
                  placeholder="Ex: Respondido via Whatsapp no dia X com tarifário comercial..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Fechar
                </button>
                {canManageMessages && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-md"
                  >
                    Guardar Nota & Concluir
                  </button>
                )}
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
