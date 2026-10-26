import React, { useState } from 'react';
import { Profile, Lead } from '../types/crm';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  resetSupabaseClient,
  SUPABASE_SQL_SCHEMA,
} from '../services/supabaseClient';
import { formatBRPhone, formatCurrencyBRL } from '../utils/formatters';
import {
  X,
  User,
  Phone,
  Shield,
  CreditCard,
  Database,
  Check,
  Copy,
  Download,
  Smartphone,
  ExternalLink,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onUpdateProfile: (data: Partial<Profile>) => Promise<boolean>;
  leads: Lead[];
  onResetData: () => void;
  onInstallPWA?: () => void;
  isPWAInstallable?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  leads,
  onResetData,
  onInstallPWA,
  isPWAInstallable,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'plans' | 'database'>('profile');

  // Profile Form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [creci, setCreci] = useState(profile?.creci || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Supabase settings state
  const [supabaseConfig, setSupabaseConfig] = useState(getStoredSupabaseConfig());
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedDbConfig, setSavedDbConfig] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await onUpdateProfile({
      full_name: fullName,
      phone: formatBRPhone(phone),
      creci,
    });
    setIsSavingProfile(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  const handleSaveDatabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(supabaseConfig);
    resetSupabaseClient();
    setSavedDbConfig(true);
    setTimeout(() => setSavedDbConfig(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Imóvel', 'Valor', 'Portal', 'Status', 'Data Follow-up', 'Notas'];
    const rows = leads.map((l) => [
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.property_title || ''}"`,
      l.property_price,
      `"${l.property_portal || ''}"`,
      `"${l.status}"`,
      `"${l.follow_up_date}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_imobpro_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#050811]/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-[#0B132B]/95 backdrop-blur-2xl border-t border-cyan-500/30 sm:border sm:rounded-[24px] rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,210,255,0.1)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-[#00D2FF]" />
            </div>
            <div>
              <h2 className="font-headline text-[18px] font-bold text-white tracking-tight">
                Ajustes do Corretor
              </h2>
              <p className="text-xs text-slate-400">
                Perfil, planos de assinatura e integração Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-white/[0.06] bg-[#0E1626] px-5 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 text-xs font-headline font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-[#00D2FF] text-[#00D2FF]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Perfil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`pb-2.5 text-xs font-headline font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'plans'
                ? 'border-[#00D2FF] text-[#00D2FF]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Planos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`pb-2.5 text-xs font-headline font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'border-[#00D2FF] text-[#00D2FF]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase & SQL</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto px-5 py-4 flex-1 flex flex-col gap-4">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-200">Nome Completo</label>
                <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3.5 border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="w-full h-11 bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-200">Telefone / WhatsApp</label>
                <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3.5 border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatBRPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="w-full h-11 bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* CRECI */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-200">Registro CRECI</label>
                <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3.5 border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all">
                  <input
                    type="text"
                    value={creci}
                    onChange={(e) => setCreci(e.target.value)}
                    placeholder="Ex: 184.920-F"
                    className="w-full h-11 bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Email da Conta</label>
                <div className="bg-[#080E1A] rounded-xl px-3.5 h-11 flex items-center border border-white/5 text-slate-400 text-sm">
                  {profile?.email || 'corretor@imobpro.com.br'}
                </div>
              </div>

              {profileSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Perfil atualizado com sucesso!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0070F3] text-slate-950 font-headline font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] cursor-pointer active:scale-95 transition-all"
              >
                <span>Salvar Perfil</span>
              </button>

              {/* Backup & Actions */}
              <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                <span className="text-xs font-headline font-bold text-slate-400 uppercase tracking-wider">
                  Ferramentas & Backup
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="h-10 px-3 rounded-xl bg-[#0E1A34] border border-cyan-500/20 hover:border-cyan-400/40 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00D2FF]" />
                    <span>Exportar CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={onResetData}
                    className="h-10 px-3 rounded-xl bg-[#0E1A34] border border-cyan-500/20 hover:border-cyan-400/40 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Restaurar Demo</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'plans' && (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-400/30 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-[#00D2FF] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-headline font-bold text-white">Plano Ativo: Corretor Pro</h4>
                  <p className="text-[11px] text-cyan-200/80">
                    Acesso completo a todas as ferramentas, funil e WhatsApp ilimitado.
                  </p>
                </div>
              </div>

              {/* Pricing Cards Placeholder */}
              <div className="grid grid-cols-1 gap-3">
                {/* Plan 1 */}
                <div className="p-4 rounded-xl border border-white/5 bg-[#0E1A34] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase font-headline">Gratuito</span>
                      <h3 className="text-base font-headline font-extrabold text-white">Iniciante</h3>
                    </div>
                    <span className="text-lg font-headline font-extrabold text-slate-300">R$ 0</span>
                  </div>
                  <ul className="text-xs text-slate-400 flex flex-col gap-1 py-1">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-cyan-400" /> Até 15 leads no funil
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-cyan-400" /> Deep Link de WhatsApp
                    </li>
                  </ul>
                  <button
                    type="button"
                    disabled
                    className="w-full h-9 rounded-lg bg-white/5 text-slate-500 font-bold text-xs cursor-default"
                  >
                    Plano Básico
                  </button>
                </div>

                {/* Plan 2: Pro (Active) */}
                <div className="p-4 rounded-xl border-2 border-cyan-400 bg-gradient-to-br from-cyan-950/40 to-[#0c1c38] flex flex-col gap-2 relative shadow-[0_0_20px_rgba(0,210,255,0.2)]">
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#00D2FF] text-[#080E1A] text-[10px] font-headline font-extrabold uppercase shadow-[0_0_8px_#00d2ff]">
                    Mais Popular
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#00D2FF] uppercase font-headline">Corretor Pro</span>
                      <h3 className="text-base font-headline font-extrabold text-white">Profissional Autônomo</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-headline font-extrabold text-[#00D2FF]">R$ 49</span>
                      <span className="text-[10px] text-slate-400">/mês</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-200 flex flex-col gap-1 py-1">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Leads e Follow-ups ilimitados
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Sincronização em tempo real na nuvem Supabase
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> PWA instalável no celular offline-first
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="w-full h-9 rounded-lg bg-gradient-to-r from-[#00D2FF] to-[#0284c7] text-[#001f28] font-headline font-bold text-xs shadow-[0_0_12px_rgba(0,210,255,0.3)]"
                  >
                    Plano Ativo
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" />
                <p>
                  O ImobPro suporta sincronização nativa com <strong>Supabase</strong> (PostgreSQL, Auth e Row Level Security).
                </p>
              </div>

              {/* Supabase Connection Form */}
              <form onSubmit={handleSaveDatabaseConfig} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-200">Supabase Project URL</label>
                  <input
                    type="url"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full h-10 px-3 rounded-xl bg-[#0E1A34] border border-cyan-500/20 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-200">Supabase Anon Key</label>
                  <input
                    type="password"
                    value={supabaseConfig.anonKey}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full h-10 px-3 rounded-xl bg-[#0E1A34] border border-cyan-500/20 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {savedDbConfig && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Configurações do Supabase salvas com sucesso!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Salvar Credenciais Supabase</span>
                </button>
              </form>

              {/* Copy SQL Schema Box */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-headline font-bold text-white">
                    Script SQL Oficial (Tabelas + RLS)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-400/40 text-[#00D2FF] text-xs font-bold hover:bg-cyan-900 transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                  </button>
                </div>
                <div className="p-3 bg-black/60 text-cyan-300/90 font-mono text-[11px] rounded-xl max-h-40 overflow-y-auto leading-relaxed border border-cyan-500/20 select-all">
                  <pre>{SUPABASE_SQL_SCHEMA}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
