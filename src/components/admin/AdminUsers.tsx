import React, { useState } from 'react';
import { 
  Users, ShieldAlert, Plus, Edit, Trash2, Key, Check, X, Shield, Mail, 
  Phone, Calendar, Search, Star
} from 'lucide-react';
import { TRS_Database, TRS_Database_Service, Employee, Role } from '../../services/db';

interface AdminUsersProps {
  db: TRS_Database;
  employeeEmail: string;
  hasPermission: (module: string, action: 'view' | 'manage') => boolean;
  onRefresh: () => void;
}

export default function AdminUsers({ db, employeeEmail, hasPermission, onRefresh }: AdminUsersProps) {
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'roles'>('employees');
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Employee Form states
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    avatar: '',
    roleId: '',
    email: '',
    phone: '',
    status: 'Ativo' as Employee['status'],
    password: ''
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

  const canManage = hasPermission('users', 'manage');

  const handleOpenEmployeeModal = (emp: Employee | null) => {
    if (!canManage) return;

    if (emp) {
      setEditingEmployee(emp);
      setEmployeeForm({
        name: emp.name,
        avatar: emp.avatar,
        roleId: emp.roleId,
        email: emp.email,
        phone: emp.phone,
        status: emp.status,
        password: emp.passwordHash // prefill with current stored password
      });
    } else {
      setEditingEmployee(null);
      setEmployeeForm({
        name: '',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        roleId: db.roles[1]?.id || 'role-locutor',
        email: '',
        phone: '',
        status: 'Ativo',
        password: 'Senha' + Math.floor(1000 + Math.random() * 9000)
      });
    }
    setEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.email || !employeeForm.roleId) return;

    if (editingEmployee) {
      // Update
      const updated: Partial<Employee> = {
        name: employeeForm.name,
        avatar: employeeForm.avatar,
        roleId: employeeForm.roleId,
        email: employeeForm.email,
        phone: employeeForm.phone,
        status: employeeForm.status,
        passwordHash: employeeForm.password
      };
      await TRS_Database_Service.update('employees', editingEmployee.id, updated, employeeEmail);
    } else {
      // Create
      const created: Employee = {
        id: `emp-${Date.now()}`,
        name: employeeForm.name,
        avatar: employeeForm.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        roleId: employeeForm.roleId,
        email: employeeForm.email,
        phone: employeeForm.phone,
        admissionDate: new Date().toISOString().split('T')[0],
        status: employeeForm.status,
        lastAccess: 'Nunca acedeu',
        passwordHash: employeeForm.password
      };
      await TRS_Database_Service.insert('employees', created, employeeEmail);
    }

    setEmployeeModalOpen(false);
    onRefresh();
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!canManage) return;
    
    // Prevent self delete
    const currentEmp = db.employees.find(e => e.email === employeeEmail);
    if (currentEmp && currentEmp.id === id) {
      alert('Não pode excluir a sua própria conta de funcionário ativa.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Remover Funcionário',
      message: 'Deseja realmente remover permanentemente este funcionário do sistema?',
      onConfirm: async () => {
        await TRS_Database_Service.delete('employees', id, employeeEmail);
        onRefresh();
      }
    });
  };

  const filteredEmployees = db.employees.filter(e => 
    e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    e.email.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`px-5 py-3 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'employees' 
              ? 'border-amber-500 text-white bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Pessoal & Funcionários ({db.employees.length})
        </button>
        <button
          onClick={() => setActiveSubTab('roles')}
          className={`px-5 py-3 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'roles' 
              ? 'border-amber-500 text-white bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          Níveis de Acesso & Permissões (RBAC)
        </button>
      </div>

      {/* RBAC Visual Warning */}
      {!canManage && (
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Apenas utilizadores com nível <strong>Super Administrador</strong> podem gerir contas de funcionários ou definir permissões de cargos.</span>
        </div>
      )}

      {/* ==========================================
          EMPLOYEES LIST TAB
          ========================================== */}
      {activeSubTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="Pesquisar por nome ou e-mail..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            
            {canManage && (
              <button
                onClick={() => handleOpenEmployeeModal(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Registrar Funcionário
              </button>
            )}
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-x-auto shadow-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-850">
                <tr>
                  <th className="p-4 font-bold">Funcionário</th>
                  <th className="p-4 font-bold">E-mail / Telefone</th>
                  <th className="p-4 font-bold">Cargo / Nível</th>
                  <th className="p-4 font-bold">Admissão</th>
                  <th className="p-4 font-bold">Último Acesso</th>
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredEmployees.map((item) => {
                  const role = db.roles.find(r => r.id === item.roleId);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.avatar} 
                            alt="" 
                            className="w-10 h-10 object-cover rounded-full border border-slate-800 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-extrabold text-white">{item.name}</p>
                            <p className="text-[10px] text-slate-500">ID: {item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-300 font-medium flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-500" /> {item.email}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> {item.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          item.roleId === 'role-superadmin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {role ? role.name : 'Sem Cargo'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{item.admissionDate}</td>
                      <td className="p-4 text-slate-400 font-mono">{item.lastAccess}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          item.status === 'Ativo' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManage ? (
                            <>
                              <button
                                onClick={() => handleOpenEmployeeModal(item)}
                                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Editar dados"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(item.id)}
                                className="p-1.5 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Demitir / Excluir funcionário"
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
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Nenhum funcionário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          RBAC MATRIX TAB
          ========================================== */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900/40 p-5 border border-slate-800/80 rounded-2xl space-y-1">
            <h3 className="text-xs font-black uppercase text-amber-500 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Matriz de Permissões de Cargos (RBAC Engine)
            </h3>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              O sistema utiliza controlo de acesso baseado em papéis (RBAC). Cada cargo abaixo possui níveis específicos de leitura, edição ou restrição de acessos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {db.roles.map((role) => (
              <div key={role.id} className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-md">
                <div className="border-b border-slate-800/80 pb-3">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    {role.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{role.description}</p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Acesso por Módulo</span>
                  
                  {Object.entries(role.permissions).map(([module, val]) => (
                    <div key={module} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-950/40 border border-slate-900/60 font-mono">
                      <span className="text-slate-400 text-[10px] capitalize font-medium">{module}</span>
                      
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        val === 'manage' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10' :
                        val === 'view' ? 'bg-blue-950/60 text-blue-400 border border-blue-500/10' :
                        'bg-red-950/60 text-red-400 border border-red-500/10'
                      }`}>
                        {val === 'manage' ? 'Total (E/S)' : val === 'view' ? 'Leitura' : 'Sem Acesso'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          EMPLOYEE MODAL overlay forms
          ========================================== */}
      {employeeModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl my-8 space-y-5">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users className="w-4 h-4 text-amber-500" />
              {editingEmployee ? 'Modificar Registo Funcionário' : 'Novo Funcionário Corporativo'}
            </h3>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nome Completo</label>
                  <input
                    type="text"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    placeholder="Nome do Funcionário..."
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Foto Perfil URL</label>
                  <input
                    type="text"
                    value={employeeForm.avatar}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, avatar: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Cargo de Trabalho (RBAC)</label>
                  <select
                    value={employeeForm.roleId}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, roleId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {db.roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Estado de Trabalho</label>
                  <select
                    value={employeeForm.status}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value as Employee['status'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Ativo">Ativo (Pode logar)</option>
                    <option value="Inativo">Inativo (Bloqueado)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    placeholder="exemplo@trsradioonline.com"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Telefone</label>
                  <input
                    type="text"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    placeholder="+244 9..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  Definir Palavra-passe
                </label>
                <input
                  type="text"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                  placeholder="Minimo 6 caracteres"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setEmployeeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-md"
                >
                  Confirmar Funcionário
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
