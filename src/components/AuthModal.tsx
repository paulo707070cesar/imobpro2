import React, { useState } from 'react';
import { formatBRPhone } from '../utils/formatters';
import {
  Shield,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onSignUp: (email: string, pass: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  onDemoLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onSignUp,
  onDemoLogin,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await onSignIn(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        }
      } else {
        const res = await onSignUp(email, password, fullName, phone);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.error || 'Erro ao realizar cadastro.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    onDemoLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#050811]/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-[#0B132B]/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-cyan-500/30 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 text-slate-200">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.3)] mb-2">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-headline font-extrabold text-white tracking-tight">
            ImobPro CRM
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'login'
              ? 'Acesse seu funil e gerencie seus negócios'
              : 'Crie sua conta de corretor'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#0E1626] rounded-xl text-xs font-headline font-bold border border-white/5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#0E1A34] text-[#00D2FF] shadow-xs border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#0E1A34] text-[#00D2FF] shadow-xs border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cadastrar Corretor
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-200">Nome Completo</label>
                <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3 border border-cyan-500/20 focus-within:border-cyan-400 transition-all">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Mendes"
                    className="w-full h-10 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-200">Telefone / WhatsApp</label>
                <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3 border border-cyan-500/20 focus-within:border-cyan-400 transition-all">
                  <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatBRPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="w-full h-10 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-200">E-mail Profissional</label>
            <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3 border border-cyan-500/20 focus-within:border-cyan-400 transition-all">
              <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com.br"
                className="w-full h-10 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-200">Senha</label>
            <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3 border border-cyan-500/20 focus-within:border-cyan-400 transition-all">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full h-10 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-1 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0070F3] text-slate-950 font-headline font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(0,210,255,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <span>{mode === 'login' ? 'Entrar no CRM' : 'Criar Conta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDemo}
            className="w-full h-10 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 text-[#00D2FF] font-headline font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_10px_rgba(0,210,255,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Entrar como Corretor Demo (1 Toque)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
