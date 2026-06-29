import React, { useState, useEffect } from 'react';
import { Lock, Mail, AlertCircle, Sparkles, HelpCircle, ArrowLeft } from 'lucide-react';
import { Employee } from '../../services/db';
import { TRS_Database_Service } from '../../services/db';

interface AdminLoginProps {
  onLoginSuccess: (employee: Employee) => void;
  onBackToSite: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToSite }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lockoutTime > 0) {
      setError(`Muitas tentativas falhadas. Aguarde ${lockoutTime} segundos antes de tentar novamente.`);
      return;
    }

    if (!email || !password) {
      setError('Por favor preencha todos os campos.');
      return;
    }

    const employees = await TRS_Database_Service.query('employees');
    const matchedEmployee = employees.find(
      (emp) => emp.email.toLowerCase() === email.toLowerCase() && emp.status === 'Ativo'
    );

    if (matchedEmployee && matchedEmployee.passwordHash === password) {
      // Login Success
      setAttempts(0);
      
      // Update last active date and save system log
      const updatedEmployee = { 
        ...matchedEmployee, 
        lastAccess: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) 
      };
      await TRS_Database_Service.update('employees', matchedEmployee.id, updatedEmployee, matchedEmployee.email);
      await TRS_Database_Service.addLog(matchedEmployee.email, 'Sessão iniciada', 'AUTH', 'O utilizador entrou no painel de administração.');
      
      onLoginSuccess(updatedEmployee);
    } else {
      // Failed login
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      
      if (nextAttempts >= 5) {
        setLockoutTime(30); // 30 seconds lockout
        setError('Conta bloqueada temporariamente. Excedeu as 5 tentativas máximas de início de sessão.');
        await TRS_Database_Service.addLog(email || 'Desconhecido', 'Bloqueio de IP por tentativas', 'AUTH', `IP bloqueado devido a ${nextAttempts} falhas de palavra-passe.`);
      } else {
        setError(`E-mail ou Palavra-passe incorreta. Tentativa ${nextAttempts} de 5.`);
      }
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setError('Insira o seu email de funcionário.');
      return;
    }

    setRecoverySent(true);
    setError(null);
    TRS_Database_Service.addLog(recoveryEmail, 'Pedido de recuperação de palavra-passe', 'AUTH', 'Foi solicitada uma recuperação de palavra-passe.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic graphic backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6 relative z-10">
        
        {/* Back Button */}
        <button
          onClick={onBackToSite}
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar à Rádio
        </button>

        {/* Brand Header */}
        <div className="text-center pt-4 space-y-1">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-amber-500/10 to-red-600/10 border border-amber-500/20 rounded-2xl mb-2 text-amber-500 shadow-lg animate-pulse">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">TRS Admin Portal</h1>
          <p className="text-slate-400 text-xs">Introduza as suas credenciais para aceder ao sintonizador interno.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!isRecovering ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@trsradioonline.com"
                  disabled={lockoutTime > 0}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/25 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400">Palavra-passe</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecovering(true);
                    setError(null);
                  }}
                  className="text-[10px] text-amber-500 hover:underline font-bold"
                >
                  Esqueceu-se?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={lockoutTime > 0}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/25 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={lockoutTime > 0}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {lockoutTime > 0 ? `Bloqueado (${lockoutTime}s)` : 'Entrar no Painel'}
            </button>
          </form>
        ) : (
          /* Password Recovery */
          <div className="space-y-4">
            {!recoverySent ? (
              <form onSubmit={handleRecovery} className="space-y-4">
                <p className="text-slate-400 text-xs leading-relaxed text-center">
                  Introduza o e-mail associado à sua conta de funcionário para receber as instruções de reposição de credenciais.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="exemplo@trsradioonline.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/25 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecovering(false);
                      setRecoverySent(false);
                      setError(null);
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                  >
                    Repor Senha
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4 py-4 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Instruções Enviadas!</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1">
                    Se o e-mail <span className="text-slate-200 font-semibold">{recoveryEmail}</span> constar no nosso sistema de pessoal, receberá em breve uma ligação segura para alterar a palavra-passe.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsRecovering(false);
                    setRecoverySent(false);
                    setRecoveryEmail('');
                    setError(null);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Voltar ao Login
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Help Footer */}
        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            TRS Core v2.0
          </span>
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            Suporte Interno
          </span>
        </div>

      </div>
    </div>
  );
}
