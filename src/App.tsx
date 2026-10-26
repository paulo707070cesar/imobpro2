import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import { Lead, LeadStatus, ColumnDefinition } from './types/crm';
import { useAuth } from './hooks/useAuth';
import { useLeads } from './hooks/useLeads';
import { DashboardStats } from './components/DashboardStats';
import { KanbanColumn } from './components/KanbanColumn';
import { LeadCard } from './components/LeadCard';
import { LeadModal } from './components/LeadModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { BottomNavigation, NavigationTab } from './components/BottomNavigation';
import { ClientsDirectory } from './components/ClientsDirectory';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GlobalSearchBar } from './components/GlobalSearchBar';
import {
  formatCurrencyBRL,
  isFollowUpToday,
  isFollowUpOverdue,
  cleanPhoneDigits,
} from './utils/formatters';
import confetti from 'canvas-confetti';
import {
  Shield,
  Plus,
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  LogOut,
  SlidersHorizontal,
  Lock,
  ArrowLeft,
  DollarSign,
  Bell,
  LayoutGrid,
  Columns3,
  Kanban,
  LayoutDashboard,
  Users,
  Settings,
  X,
} from 'lucide-react';

const KANBAN_COLUMNS: ColumnDefinition[] = [
  {
    id: 'novo',
    title: 'Novo',
    shortTitle: 'Novo',
    color: 'border-cyan-500/30',
    accentColor: 'bg-[#00D2FF]',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-300',
    description: 'Novos contatos recebidos',
  },
  {
    id: 'visita',
    title: 'Visita',
    shortTitle: 'Visita',
    color: 'border-blue-500/30',
    accentColor: 'bg-blue-400',
    badgeBg: 'bg-blue-950/80',
    badgeText: 'text-blue-300',
    description: 'Visitas agendadas e em andamento',
  },
  {
    id: 'proposta',
    title: 'Proposta',
    shortTitle: 'Proposta',
    color: 'border-sky-500/30',
    accentColor: 'bg-sky-400',
    badgeBg: 'bg-sky-950/80',
    badgeText: 'text-sky-300',
    description: 'Propostas enviadas em negociação',
  },
  {
    id: 'fechado',
    title: 'Fechado',
    shortTitle: 'Fechado',
    color: 'border-emerald-500/30',
    accentColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-300',
    description: 'Contratos assinados e negócios concluídos',
  },
];

export default function App() {
  const {
    user,
    profile,
    isLoading: isAuthLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    loginAsDemo,
  } = useAuth();

  const {
    leads,
    addLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
    resetToSampleData,
  } = useLeads(user?.id);

  // Navigation tab state: 'dashboard' | 'pipeline' | 'clients' | 'settings'
  const [activeTab, setActiveTab] = useState<NavigationTab>('pipeline');
  const [activeStagePill, setActiveStagePill] = useState(0);

  // Desktop view toggle: grid (all 4 columns side by side) vs scroll
  const [desktopViewMode, setDesktopViewMode] = useState<'grid' | 'carousel'>('grid');

  // Global search state in header: filters leads across ALL CRM views in real-time
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadModalInitialStatus, setLeadModalInitialStatus] = useState<LeadStatus>('novo');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Drag and Drop state
  const [activeDragLead, setActiveDragLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 6,
      },
    })
  );

  // Filter leads in real-time across all views by name or phone
  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return leads;
    const cleanQ = q.replace(/\D/g, '');

    return leads.filter((lead) => {
      // Name match
      const nameMatch = lead.name.toLowerCase().includes(q);
      // Phone match (supports formatted "(11) 99999-0001" and pure digits "999990001")
      const phoneMatch =
        lead.phone.includes(q) ||
        (cleanQ.length >= 2 && cleanPhoneDigits(lead.phone).includes(cleanQ));
      // Optional property title match
      const propertyMatch = lead.property_title && lead.property_title.toLowerCase().includes(q);

      return nameMatch || phoneMatch || propertyMatch;
    });
  }, [leads, searchQuery]);

  const followUpCount = useMemo(() => {
    return filteredLeads.filter(
      (l) => l.status !== 'fechado' && l.status !== 'perdido' && (isFollowUpToday(l.follow_up_date) || isFollowUpOverdue(l.follow_up_date))
    ).length;
  }, [filteredLeads]);

  const totalVolume = useMemo(() => {
    return filteredLeads
      .filter((l) => l.status !== 'fechado' && l.status !== 'perdido')
      .reduce((sum, l) => sum + (Number(l.property_price) || 0), 0);
  }, [filteredLeads]);

  const activeLeadsCount = useMemo(() => {
    return filteredLeads.filter((l) => l.status !== 'fechado' && l.status !== 'perdido').length;
  }, [filteredLeads]);

  const handleOpenAddLead = (initialStatus: LeadStatus = 'novo') => {
    setSelectedLead(null);
    setLeadModalInitialStatus(initialStatus);
    setIsLeadModalOpen(true);
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = leads.find((l) => l.id === active.id);
    if (found) {
      setActiveDragLead(found);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragLead(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const isColumn = KANBAN_COLUMNS.some((col) => col.id === overId);
    let targetStatus: LeadStatus | null = null;

    if (isColumn) {
      targetStatus = overId as LeadStatus;
    } else {
      const targetLead = leads.find((l) => l.id === overId);
      if (targetLead) {
        targetStatus = targetLead.status === 'perdido' ? 'perdido' : targetLead.status;
      }
    }

    if (targetStatus) {
      const currentLead = leads.find((l) => l.id === activeId);
      if (currentLead && currentLead.status !== targetStatus) {
        updateLeadStatus(activeId, targetStatus);

        if (targetStatus === 'fechado') {
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#00D2FF', '#0070F3', '#10B981'],
            });
          } catch (e) {
            // ignore
          }
        }
      }
    }
  };

  const handleScrollToColumn = (index: number) => {
    setActiveStagePill(index);
    const el = document.getElementById(`kanban-col-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#080E1A] text-[#DDE2F3] antialiased font-body">
      {/* Top PWA Install Banner */}
      <PWAInstallBanner />

      {/* Offline Connectivity Toast Indicator */}
      <OfflineIndicator />

      {/* Responsive Header for Mobile & Desktop */}
      <header className="sticky top-0 z-30 bg-[#080E1A]/90 backdrop-blur-xl border-b border-cyan-500/10 px-4 md:px-8 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Mobile Full-width search bar when expanded */}
          {isSearchMobileOpen ? (
            <div className="w-full flex items-center gap-2 py-1 animate-in fade-in slide-in-from-top-1 md:hidden">
              <GlobalSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                leads={filteredLeads}
                filteredCount={filteredLeads.length}
                totalCount={leads.length}
                onSelectLead={handleSelectLead}
                isMobileExpanded={true}
                onCloseMobile={() => {
                  setIsSearchMobileOpen(false);
                  setSearchQuery('');
                }}
                className="flex-1"
              />
            </div>
          ) : (
            <>
              {/* Logo & Brand */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/30 shadow-[0_0_12px_rgba(0,210,255,0.25)]">
                  <Shield className="w-5 h-5 text-[#00D2FF]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline text-base text-white font-bold tracking-tight truncate">
                      ImobPro
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-headline text-[10px] uppercase font-bold tracking-wider">
                      CRM
                    </span>
                  </div>
                  <span className="text-[12px] text-slate-400 truncate">
                    {activeTab === 'dashboard'
                      ? 'Início / Painel Geral'
                      : activeTab === 'pipeline'
                      ? 'Pipeline / Negócios'
                      : activeTab === 'clients'
                      ? 'Carteira de Clientes'
                      : 'Ajustes'}
                  </span>
                </div>
              </div>

              {/* Global Search Bar (Prominently mounted in header for desktop and tablets) */}
              <div className="hidden sm:flex flex-1 max-w-sm md:max-w-md mx-2">
                <GlobalSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  leads={filteredLeads}
                  filteredCount={filteredLeads.length}
                  totalCount={leads.length}
                  onSelectLead={handleSelectLead}
                  className="w-full"
                />
              </div>

              {/* Desktop Navigation Tabs */}
              <nav className="hidden lg:flex items-center bg-[#0E1626] p-1 rounded-xl border border-cyan-500/20 shadow-inner">
                {[
                  { id: 'dashboard' as const, label: 'Início', icon: LayoutDashboard },
                  { id: 'pipeline' as const, label: 'Negócios', icon: Kanban },
                  { id: 'clients' as const, label: 'Clientes', icon: Users },
                  { id: 'settings' as const, label: 'Ajustes', icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-[#00D2FF] border border-cyan-400/40 shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.id === 'dashboard' && followUpCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#00D2FF] text-[#080E1A] text-[9px] font-extrabold shadow-[0_0_6px_#00d2ff]">
                          {followUpCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Right Action Icons & User Avatar */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Mobile Search Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsSearchMobileOpen(true)}
                  className={`w-9 h-9 sm:hidden flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                    searchQuery
                      ? 'bg-cyan-950/80 border-cyan-400/50 text-[#00D2FF]'
                      : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:text-cyan-300'
                  }`}
                  aria-label="Buscar leads"
                >
                  <Search className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAddLead('novo')}
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0284c7] text-[#001f28] font-headline font-bold text-xs shadow-[0_0_15px_rgba(0,210,255,0.35)] active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 font-bold" />
                  <span>Novo Lead</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 border border-transparent hover:border-cyan-500/20 transition-all focus:outline-none cursor-pointer"
                  aria-label="Notificações"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0E1A34] border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-headline font-bold text-xs shadow-[0_0_10px_rgba(0,210,255,0.3)] cursor-pointer hover:scale-105 transition-transform"
                  title="Ajustes do Perfil"
                >
                  {profile?.full_name?.charAt(0) || 'R'}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Active Search Filter Banner across all views */}
      {searchQuery.trim().length > 0 && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-[#0e223f] to-cyan-950/90 border-b border-cyan-500/30 px-4 md:px-8 py-2 text-xs flex items-center justify-between shadow-[0_2px_12px_rgba(0,210,255,0.15)] animate-in fade-in">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse shadow-[0_0_8px_#00d2ff]" />
            <span className="text-slate-300 truncate">
              Filtrando em tempo real por: <strong className="text-white">"{searchQuery}"</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-[#00D2FF] font-headline font-bold text-[11px] shrink-0">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'encontrado' : 'encontrados'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="flex items-center gap-1 text-cyan-300 hover:text-white font-headline font-bold hover:underline shrink-0 ml-3 cursor-pointer"
          >
            <span>Limpar filtro</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col w-full bg-[#080E1A]">
        {/* TAB 1: Dashboard (Home) */}
        {activeTab === 'dashboard' && (
          <DashboardStats
            profile={profile}
            leads={filteredLeads}
            onLogout={signOut}
            onOpenAddModal={() => handleOpenAddLead('novo')}
            onSelectLead={handleSelectLead}
            onGoToPipeline={() => setActiveTab('pipeline')}
          />
        )}

        {/* TAB 2: Pipeline (Kanban Board) */}
        {activeTab === 'pipeline' && (
          <div className="flex-1 flex flex-col pb-24 md:pb-8">
            {/* Sub-header & Metrics Overview Banner */}
            <section className="px-4 md:px-8 pt-3 pb-3 bg-gradient-to-b from-[#0E1626]/80 to-[#080E1A] border-b border-cyan-500/10 mb-3">
              <div className="max-w-7xl mx-auto flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('dashboard')}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer"
                      aria-label="Voltar para início"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="font-headline text-[20px] md:text-2xl text-white font-bold tracking-tight truncate ml-1">
                      Meus Negócios
                    </h1>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Desktop View Mode Toggle (Grid 4-Columns vs Scroll) */}
                    <div className="hidden lg:flex items-center bg-slate-900 border border-cyan-500/20 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setDesktopViewMode('grid')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-headline font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          desktopViewMode === 'grid'
                            ? 'bg-cyan-500/20 text-[#00D2FF] border border-cyan-400/40 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Visualização 4 Colunas em Grade"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Grade (4 Colunas)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDesktopViewMode('carousel')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-headline font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          desktopViewMode === 'carousel'
                            ? 'bg-cyan-500/20 text-[#00D2FF] border border-cyan-400/40 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Visualização em Rolagem"
                      >
                        <Columns3 className="w-3.5 h-3.5" />
                        <span>Carrossel</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddLead('novo')}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/30 transition-all relative cursor-pointer"
                      title="Novo Lead"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00D2FF] shadow-[0_0_8px_#00d2ff]" />
                    </button>
                  </div>
                </div>

                {/* Quick Stat Banner with glowing tech aesthetic matching screenshot */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0e1a2f] to-slate-900/90 border border-cyan-500/25 tech-glow-subtle relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline text-[10px] sm:text-xs text-cyan-300/80 uppercase tracking-wider font-semibold">
                        Volume em Negociação
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-headline text-[20px] sm:text-2xl text-white font-extrabold tracking-tight">
                          {formatCurrencyBRL(totalVolume)}
                        </span>
                        <span className="font-headline text-[11px] sm:text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                          {activeLeadsCount} ativas
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-headline text-[11px] font-semibold tracking-wide shadow-sm relative z-10">
                    Funil Ativo
                  </span>
                </div>
              </div>
            </section>

            {/* Stage Segment Pills */}
            <div className="px-4 md:px-8 mb-3 max-w-7xl mx-auto w-full overflow-x-auto no-scrollbar flex items-center gap-2">
              {KANBAN_COLUMNS.map((col, idx) => {
                const count =
                  col.id === 'fechado'
                    ? filteredLeads.filter((l) => l.status === 'fechado' || l.status === 'perdido').length
                    : filteredLeads.filter((l) => l.status === col.id).length;
                const isActive = activeStagePill === idx;

                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleScrollToColumn(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs shrink-0 transition-all font-headline font-semibold cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 text-[#00D2FF] border border-cyan-400/40 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                        : 'bg-[#0E1626] text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${col.accentColor} ${isActive ? 'shadow-[0_0_6px_#00d2ff]' : ''}`} />
                    <span>{col.shortTitle}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-200 text-[10px]">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Responsive Kanban Board */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
                <div
                  id="kanban-scroll"
                  className={
                    desktopViewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4'
                      : 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar'
                  }
                >
                  {KANBAN_COLUMNS.map((col, idx) => {
                    const columnLeads =
                      col.id === 'fechado'
                        ? filteredLeads.filter((l) => l.status === 'fechado' || l.status === 'perdido')
                        : filteredLeads.filter((l) => l.status === col.id);

                    return (
                      <div key={col.id} id={`kanban-col-${idx}`}>
                        <KanbanColumn
                          column={col}
                          leads={columnLeads}
                          onSelectLead={handleSelectLead}
                          onOpenAddModal={(st) => handleOpenAddLead(st)}
                          onMoveLeadStatus={updateLeadStatus}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drag Overlay card preview while dragging */}
              <DragOverlay>
                {activeDragLead ? (
                  <LeadCard
                    lead={activeDragLead}
                    onSelectLead={() => {}}
                    isDraggingOverlay
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Bottom Visual Tool Strip */}
            <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse shadow-[0_0_8px_#00D2FF]" />
                <span className="text-xs text-slate-400 font-body">Sincronizado via WhatsApp Cloud API</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="font-headline text-xs text-cyan-300 hover:text-cyan-200 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Ver métricas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Clients Directory */}
        {activeTab === 'clients' && (
          <ClientsDirectory
            leads={filteredLeads}
            onSelectLead={handleSelectLead}
            onOpenAddModal={() => handleOpenAddLead('novo')}
          />
        )}

        {/* TAB 4: Settings */}
        {activeTab === 'settings' && (
          <div className="flex flex-col w-full pb-28 md:pb-12 max-w-2xl mx-auto px-4 md:px-8 pt-6 text-slate-200">
            <header className="mb-6">
              <h1 className="text-2xl font-headline font-extrabold text-white tracking-tight">
                Ajustes & Configurações
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Gerencie seu perfil, assinatura Pro e integração com o banco Supabase
              </p>
            </header>

            {/* Profile Overview Card */}
            <div className="p-5 bg-[#0E1626] rounded-2xl border border-cyan-500/20 shadow-xs flex items-center justify-between mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-[#00D2FF] font-headline font-extrabold text-lg flex items-center justify-center shadow-[0_0_12px_rgba(0,210,255,0.25)]">
                  {profile?.full_name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h3 className="font-headline font-extrabold text-base text-white">
                    {profile?.full_name || 'Roberto Mendes'}
                  </h3>
                  <p className="text-xs text-slate-400">{profile?.email}</p>
                  {profile?.creci && (
                    <span className="inline-block mt-1 text-[10px] font-headline font-bold text-[#00D2FF] bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      CRECI {profile.creci}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-cyan-500/30 hover:border-cyan-400 text-xs font-headline font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
              >
                Editar Perfil
              </button>
            </div>

            {/* Menu Options */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="w-full p-4 bg-[#0E1626] rounded-xl border border-cyan-500/15 hover:border-cyan-500/30 shadow-2xs flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-sm font-headline font-bold text-white">Plano de Assinatura</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Corretor Pro (R$ 49/mês)</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="w-full p-4 bg-[#0E1626] rounded-xl border border-cyan-500/15 hover:border-cyan-500/30 shadow-2xs flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-sm font-headline font-bold text-white">Banco de Dados Supabase & RLS</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Configurar URL, chave anon e copiar script SQL</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={resetToSampleData}
                className="w-full p-4 bg-[#0E1626] rounded-xl border border-cyan-500/15 hover:border-cyan-500/30 shadow-2xs flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-sm font-headline font-bold text-slate-300">Restaurar Leads de Exemplo</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Recarrega os leads de demonstração em São Paulo</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Account switch / login */}
            <div className="mt-8 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex-1 h-11 rounded-xl bg-[#0E1A34] hover:bg-slate-800 text-cyan-200 font-headline font-bold text-xs flex items-center justify-center gap-2 border border-cyan-500/20 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#00D2FF]" />
                <span>Trocar de Conta</span>
              </button>

              <button
                type="button"
                onClick={signOut}
                className="flex-1 h-11 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/30 font-headline font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do Aplicativo</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        lead={selectedLead}
        initialStatus={leadModalInitialStatus}
        onSaveLead={addLead}
        onUpdateLead={updateLead}
        onDeleteLead={deleteLead}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
        leads={leads}
        onResetData={resetToSampleData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignIn={signIn}
        onSignUp={signUp}
        onDemoLogin={loginAsDemo}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        followUpCount={followUpCount}
      />
    </div>
  );
}
