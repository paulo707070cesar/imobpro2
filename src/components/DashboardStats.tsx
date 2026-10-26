import React, { useState } from 'react';
import { Lead, Profile } from '../types/crm';
import {
  formatCurrencyBRL,
  getWhatsAppUrl,
  isFollowUpToday,
  isFollowUpOverdue,
  formatBRDate,
  getPortalBadgeInfo,
} from '../utils/formatters';
import {
  LogOut,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  Plus,
  ArrowRight,
  Clock,
  Zap,
  PieChart,
  Shield,
  Building,
  Bell,
  Sparkles,
  PhoneCall,
  Search,
} from 'lucide-react';
import { ConversionBarChart } from './ConversionBarChart';

interface DashboardStatsProps {
  profile: Profile | null;
  leads: Lead[];
  onLogout: () => void;
  onOpenAddModal: () => void;
  onSelectLead: (lead: Lead) => void;
  onGoToPipeline: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  profile,
  leads,
  onLogout,
  onOpenAddModal,
  onSelectLead,
  onGoToPipeline,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  // Follow-ups today or overdue
  const followUpLeads = leads.filter(
    (l) => l.status !== 'fechado' && l.status !== 'perdido' && (isFollowUpToday(l.follow_up_date) || isFollowUpOverdue(l.follow_up_date))
  );

  // Sorting: overdue first, then today
  const sortedFollowUps = [...followUpLeads].sort((a, b) => {
    const aOverdue = isFollowUpOverdue(a.follow_up_date) ? 1 : 0;
    const bOverdue = isFollowUpOverdue(b.follow_up_date) ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;
    return (a.follow_up_time || '').localeCompare(b.follow_up_time || '');
  }).filter((lead) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      (lead.property_title && lead.property_title.toLowerCase().includes(q))
    );
  });

  // Active leads count (novo, visita, proposta)
  const activeLeads = leads.filter(
    (l) => l.status === 'novo' || l.status === 'visita' || l.status === 'proposta'
  );

  // Closed leads count
  const closedLeads = leads.filter((l) => l.status === 'fechado');

  // Total active pipeline volume in R$
  const totalPipelineValue = activeLeads.reduce(
    (sum, l) => sum + (Number(l.property_price) || 0),
    0
  );

  const brokerFirstName = profile?.full_name?.split(' ')[0] || 'Roberto';

  return (
    <div className="flex flex-col w-full pb-24 md:pb-12 relative">
      {/* Ambient background glowing accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[380px] md:w-[600px] h-[340px] bg-gradient-to-b from-[#00D2FF]/15 via-[#0369a1]/10 to-transparent blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-24 right-0 w-[240px] md:w-[400px] h-[240px] bg-[#0284c7]/10 blur-[90px] pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#080E1A]/85 backdrop-blur-xl border-b border-cyan-500/10 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 via-sky-500/10 to-slate-900 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.3)] shrink-0">
            <Shield className="w-5 h-5 text-[#00D2FF]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00D2FF] shadow-[0_0_6px_#00D2FF]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[17px] text-white font-extrabold tracking-tight truncate">
                ImobPro
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-400/40 text-[#00D2FF] text-[10px] font-bold tracking-wider uppercase font-headline">
                CRM
              </span>
            </div>
            <span className="text-[12px] text-slate-400 font-medium truncate">
              {profile?.creci ? `CRECI ${profile.creci}` : 'Início / Painel Geral'}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0284c7] text-[#001f28] font-headline font-bold text-xs shadow-[0_0_15px_rgba(0,210,255,0.35)] active:scale-95 transition-all cursor-pointer mr-1"
          >
            <Plus className="w-4 h-4 font-bold" />
            <span>Novo Lead</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Sair da conta"
            aria-label="Sair da conta"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Responsive Grid Container */}
      <div className="px-4 md:px-8 pt-4 md:pt-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Greeting Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-2xl md:text-3xl text-white font-bold tracking-tight">
                Olá, {brokerFirstName}
              </h1>
              <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-[#00D2FF] shadow-[0_0_8px_#00D2FF] animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Gestão de oportunidades e follow-ups em tempo real
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-cyan-500/30 px-3.5 py-1.5 rounded-full shadow-[0_0_12px_rgba(0,210,255,0.15)]">
              <Zap className="w-4 h-4 text-[#00D2FF]" />
              <span className="font-headline text-xs text-cyan-200 font-bold tracking-wide">
                Meta 82% Atingida
              </span>
            </div>
            <button
              type="button"
              onClick={onGoToPipeline}
              className="inline-flex items-center gap-1 text-xs font-headline font-bold text-cyan-300 hover:text-white bg-slate-900/70 border border-slate-700 hover:border-cyan-500/40 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <span>Ver Funil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Responsive 4-Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Pipeline */}
          <div className="bg-slate-900/75 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-headline uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-[#00D2FF]" />
                Volume em Negociação
              </span>
            </div>
            <div className="mt-3">
              <div className="font-headline text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {formatCurrencyBRL(totalPipelineValue)}
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                {activeLeads.length} oportunidades ativas
              </span>
            </div>
          </div>

          {/* Card 2: Follow-ups Hoje */}
          <div className="bg-slate-900/75 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-headline uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#00D2FF]" />
                Follow-ups Hoje
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-[#00D2FF] font-headline text-[10px] font-bold">
                {followUpLeads.length}
              </span>
            </div>
            <div className="mt-3">
              <div className="font-headline text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {followUpLeads.length} Pendentes
              </div>
              <span className="text-xs text-cyan-300 font-medium mt-1 block">
                {followUpLeads.filter((l) => isFollowUpOverdue(l.follow_up_date)).length > 0
                  ? `${followUpLeads.filter((l) => isFollowUpOverdue(l.follow_up_date)).length} atrasado(s)`
                  : 'Todos em dia'}
              </span>
            </div>
          </div>

          {/* Card 3: Leads Ativos */}
          <div className="bg-slate-900/75 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-headline uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#38bdf8]" />
                Leads no Funil
              </span>
            </div>
            <div className="mt-3">
              <div className="font-headline text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {activeLeads.length} Ativos
              </div>
              <span className="text-xs text-slate-400 font-medium mt-1 block">
                {leads.filter((l) => l.status === 'proposta').length} em proposta
              </span>
            </div>
          </div>

          {/* Card 4: Fechados */}
          <div className="bg-slate-900/75 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-headline uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Negócios Fechados
              </span>
            </div>
            <div className="mt-3">
              <div className="font-headline text-xl sm:text-2xl font-extrabold text-emerald-400 tracking-tight">
                {closedLeads.length} Fechados
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                Contratos assinados
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Conversion Bar Chart (Recharts) */}
        <ConversionBarChart leads={leads} />

        {/* 2-Column Responsive Layout for Tablet & Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column: Follow-ups de Hoje List (Spans 7 or 8 on desktop) */}
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            {/* Header with Search & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-lg sm:text-xl font-bold text-white tracking-tight">
                  Follow-ups Prioritários
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[#00D2FF] font-headline text-xs font-bold">
                  {sortedFollowUps.length}
                </span>
              </div>

              {/* Quick filter input */}
              <div className="relative flex items-center max-w-xs w-full bg-[#0E1A34] rounded-xl px-3 border border-cyan-500/20 focus-within:border-cyan-400 transition-all">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Buscar contato ou imóvel..."
                  className="w-full h-9 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* List */}
            {sortedFollowUps.length === 0 ? (
              <div className="rounded-2xl p-8 bg-slate-900/60 border border-cyan-500/15 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-[#00D2FF] flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-headline font-bold text-base text-white">Tudo em dia!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Não há follow-ups atrasados ou pendentes para hoje. Adicione novas oportunidades ou verifique o funil completo.
                </p>
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0284c7] text-[#001f28] font-headline font-bold text-xs shadow-[0_0_15px_rgba(0,210,255,0.3)] active:scale-95 transition-all cursor-pointer"
                >
                  Cadastrar Novo Lead
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedFollowUps.map((lead) => {
                  const isOverdue = isFollowUpOverdue(lead.follow_up_date);
                  const portal = getPortalBadgeInfo(lead.property_portal);

                  return (
                    <article
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="bg-slate-900/75 hover:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/20 hover:border-cyan-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col gap-3 relative cursor-pointer transition-all active:scale-[0.99] group"
                    >
                      {/* Top: Client Name, Avatar, and Status Tag */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-full bg-[#0E1A34] border border-cyan-400/30 text-[#00D2FF] font-headline font-bold flex items-center justify-center text-sm shadow-[0_0_10px_rgba(0,210,255,0.25)]">
                              {lead.name.charAt(0)}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-slate-950 ${
                                isOverdue ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                              }`}
                            />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="font-headline text-[15px] font-bold text-white group-hover:text-[#00D2FF] transition-colors truncate">
                              {lead.name}
                            </span>
                            <span className="text-[12px] text-slate-400 truncate">
                              {lead.notes ? `"${lead.notes}"` : 'Lead qualificado via WhatsApp'}
                            </span>
                          </div>
                        </div>

                        {/* Tag: Atrasado vs Hoje */}
                        <div className="shrink-0 bg-cyan-950/80 border border-cyan-400/40 text-[#00D2FF] px-3 py-1 rounded-full text-[11px] font-headline font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,210,255,0.2)]">
                          {isOverdue ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-amber-300">Atrasado ({formatBRDate(lead.follow_up_date)})</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Hoje {lead.follow_up_time ? `às ${lead.follow_up_time}` : ''}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Property Thumbnail & Info */}
                      <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                        {lead.property_image ? (
                          <img
                            src={lead.property_image}
                            alt={lead.property_title || 'Foto do imóvel'}
                            className="w-16 h-16 rounded-lg object-cover shrink-0 ring-1 ring-cyan-500/30"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-[#0E1A34] border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                            <Building className="w-7 h-7 text-cyan-300/80" />
                          </div>
                        )}
                        <div className="flex flex-col justify-between py-0.5 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-headline font-bold px-1.5 py-0.5 rounded border ${portal.bg}`}>
                                {portal.label}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate font-mono">
                                {lead.phone}
                              </span>
                            </div>
                            <span className="font-headline text-[16px] font-extrabold text-[#00D2FF] tracking-tight">
                              {formatCurrencyBRL(lead.property_price)}
                            </span>
                          </div>
                          <h4 className="font-headline text-[14px] text-slate-100 font-semibold truncate mt-1">
                            {lead.property_title || 'Imóvel de Interesse'}
                          </h4>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#00D2FF]" />
                          <span>Data: {formatBRDate(lead.follow_up_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lead.property_url && (
                            <a
                              href={lead.property_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:text-white hover:border-cyan-400/40 flex items-center justify-center active:scale-95 transition-transform"
                              title="Ver anúncio"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <a
                            href={getWhatsAppUrl(lead.phone, lead.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-headline text-[13px] font-bold shadow-[0_0_16px_rgba(16,185,129,0.35)] active:scale-95 transition-transform"
                          >
                            <MessageSquare className="w-4 h-4 fill-current stroke-none" />
                            <span>Conversar no WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Sidebar Column: Pipeline Summary & Fast Insights (Spans 5 or 4 on desktop) */}
          <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
            {/* Hero Alert Card */}
            <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#0c1c38] via-[#09152b] to-[#060e1f] border border-cyan-400/30 shadow-[0_4px_28px_-6px_rgba(0,210,255,0.28)]">
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#00D2FF]/20 blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-[#00D2FF] border border-cyan-400/30">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <span className="font-headline text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                    Funil em Tempo Real
                  </span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-extrabold text-white">
                    {activeLeads.length} Oportunidades
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 font-body">
                    Distribuição pelas 4 etapas ativas de atendimento imobiliário.
                  </p>
                </div>

                {/* Funnel distribution bars */}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                  {[
                    { label: 'Novo Contato', count: leads.filter((l) => l.status === 'novo').length, color: 'bg-[#00D2FF]' },
                    { label: 'Visita Agendada', count: leads.filter((l) => l.status === 'visita').length, color: 'bg-blue-400' },
                    { label: 'Proposta Feita', count: leads.filter((l) => l.status === 'proposta').length, color: 'bg-sky-400' },
                    { label: 'Fechado / Ganho', count: leads.filter((l) => l.status === 'fechado').length, color: 'bg-emerald-400' },
                  ].map((st) => (
                    <div key={st.label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{st.label}</span>
                        <span className="text-white font-headline font-bold">{st.count}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${st.color}`}
                          style={{ width: `${Math.min(100, Math.max(10, (st.count / (leads.length || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onGoToPipeline}
                  className="w-full mt-2 h-10 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0284c7] text-[#001f28] font-headline text-xs font-bold shadow-[0_0_18px_rgba(0,210,255,0.45)] active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Abrir Funil Kanban</span>
                  <ArrowRight className="w-4 h-4 font-bold" />
                </button>
              </div>
            </div>

            {/* Quick Agent Activity Card */}
            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between">
                <span className="font-headline text-xs font-bold uppercase tracking-wider text-slate-400">
                  Desempenho Semanal
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                +6 novos contatos captados esta semana através dos portais ZAP, VivaReal e Indicação.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                <span className="text-slate-400">WhatsApp Cloud API</span>
                <span className="text-cyan-300 font-semibold font-headline">Conectado</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Button (FAB) on mobile / hidden on desktop if preferred, or always available */}
      <div className="fixed right-4 md:right-8 bottom-20 md:bottom-8 z-40">
        <button
          type="button"
          onClick={onOpenAddModal}
          title="Adicionar Novo Lead"
          aria-label="Adicionar Novo Lead"
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D2FF] to-[#0284c7] text-[#001f28] flex items-center justify-center shadow-[0_0_24px_rgba(0,210,255,0.55)] border border-cyan-200/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
