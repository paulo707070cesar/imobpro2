import React, { useState } from 'react';
import { Lead, LeadStatus } from '../types/crm';
import {
  formatCurrencyBRL,
  formatBRPhone,
  getWhatsAppUrl,
  getFollowUpStatus,
  formatBRDate,
  getPortalBadgeInfo,
} from '../utils/formatters';
import {
  Search,
  Filter,
  MessageSquare,
  ExternalLink,
  Plus,
  Phone,
  Calendar,
  Building,
  LayoutList,
  LayoutGrid,
  MoreVertical,
  Clock,
} from 'lucide-react';

interface ClientsDirectoryProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenAddModal: () => void;
}

export const ClientsDirectory: React.FC<ClientsDirectoryProps> = ({
  leads,
  onSelectLead,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.property_title && lead.property_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case 'novo':
        return { label: 'Novo Contato', bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30' };
      case 'visita':
        return { label: 'Visita Agendada', bg: 'bg-blue-950/80 text-blue-300 border-blue-500/30' };
      case 'proposta':
        return { label: 'Proposta Feita', bg: 'bg-sky-950/80 text-sky-300 border-sky-500/30' };
      case 'fechado':
        return { label: 'Fechado', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' };
      case 'perdido':
        return { label: 'Perdido', bg: 'bg-slate-900 text-slate-400 border-slate-700/60' };
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 md:pb-12 max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-headline font-extrabold text-white tracking-tight">
            Carteira de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {filteredLeads.length} de {leads.length} leads cadastrados
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View toggle (desktop only) */}
          <div className="hidden md:flex items-center bg-[#0E1626] border border-cyan-500/20 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-cyan-500/20 text-[#00D2FF] border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-cyan-500/20 text-[#00D2FF] border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0284c7] text-[#001f28] font-headline font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 font-bold" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Search Input & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3.5 border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone ou imóvel..."
            className="w-full h-11 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'novo', label: 'Novo Contato' },
              { id: 'visita', label: 'Visita' },
              { id: 'proposta', label: 'Proposta' },
              { id: 'fechado', label: 'Fechado' },
              { id: 'perdido', label: 'Perdido' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-headline font-bold shrink-0 transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-[#00D2FF] border border-cyan-400/50 shadow-[0_0_10px_rgba(0,210,255,0.25)]'
                  : 'bg-[#0E1626] text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive View: Table (Desktop) vs Grid Cards (Mobile & Desktop) */}
      {viewMode === 'table' ? (
        <div className="hidden md:block bg-[#0C1322] rounded-2xl border border-cyan-500/20 overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-headline font-bold text-slate-400 uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4">Cliente / Contato</th>
                <th className="py-3 px-4">Imóvel de Interesse</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Portal</th>
                <th className="py-3 px-4">Etapa</th>
                <th className="py-3 px-4">Próximo Contato</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLeads.map((lead) => {
                const st = getStatusLabel(lead.status);
                const portal = getPortalBadgeInfo(lead.property_portal);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-[#10192D] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0E1A34] border border-cyan-500/30 text-[#00D2FF] font-headline font-bold flex items-center justify-center text-xs shrink-0">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                            {lead.name}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{lead.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium max-w-xs truncate">
                      {lead.property_title || 'Interesse Imobiliário'}
                    </td>
                    <td className="py-3.5 px-4 font-headline font-bold text-[#00D2FF]">
                      {formatCurrencyBRL(lead.property_price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-headline font-bold uppercase border ${portal.bg}`}>
                        {portal.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-headline font-bold border ${st.bg}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {lead.follow_up_date ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#00D2FF]" />
                          {formatBRDate(lead.follow_up_date)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${lead.phone.replace(/\D/g, '')}`}
                          className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                          title="Ligar"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={getWhatsAppUrl(lead.phone, lead.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-headline font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current stroke-none" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Responsive Grid of Cards (1 col on mobile, 2 cols on tablet, 3 cols on xl) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredLeads.map((lead) => {
            const st = getStatusLabel(lead.status);
            const portal = getPortalBadgeInfo(lead.property_portal);

            return (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="p-3.5 bg-[#10192D]/95 hover:bg-[#132039] rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 shadow-sm flex flex-col justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {lead.property_image ? (
                    <img
                      src={lead.property_image}
                      alt={lead.property_title || 'Foto do Imóvel'}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-cyan-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#0E1A34] border border-cyan-500/30 text-[#00D2FF] font-headline font-bold flex items-center justify-center text-sm shrink-0 shadow-[0_0_10px_rgba(0,210,255,0.2)]">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-headline font-bold text-sm text-white group-hover:text-[#00D2FF] transition-colors truncate">
                        {lead.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-headline font-bold uppercase border ${portal.bg}`}
                      >
                        {portal.label}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 truncate mt-0.5">
                      {lead.property_title || 'Interesse Imobiliário'}
                    </span>

                    <span className="text-sm font-headline font-extrabold text-[#00D2FF] mt-0.5">
                      {formatCurrencyBRL(lead.property_price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-headline font-bold border ${st.bg}`}
                  >
                    {st.label}
                  </span>

                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={`tel:${lead.phone.replace(/\D/g, '')}`}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                      title="Ligar"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={getWhatsAppUrl(lead.phone, lead.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-headline font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current stroke-none" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredLeads.length === 0 && (
        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-cyan-500/15">
          <p className="font-headline font-bold text-sm text-white">Nenhum lead encontrado</p>
          <p className="text-xs text-slate-400 mt-1">
            Tente alterar os termos da busca ou filtro de etapa.
          </p>
        </div>
      )}
    </div>
  );
};
