import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead, LeadStatus } from '../types/crm';
import {
  formatCurrencyBRL,
  getWhatsAppUrl,
  getFollowUpStatus,
  formatBRDate,
  getPortalBadgeInfo,
} from '../utils/formatters';
import {
  GripVertical,
  MessageSquare,
  Clock,
  AlertCircle,
  ExternalLink,
  MoreVertical,
  Calendar,
  Building,
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  onMoveLeadStatus?: (leadId: string, newStatus: LeadStatus) => void;
  isDraggingOverlay?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onSelectLead,
  onMoveLeadStatus,
  isDraggingOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      lead,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const followUpStatus = getFollowUpStatus(lead.follow_up_date);
  const portalBadge = getPortalBadgeInfo(lead.property_portal);
  const isAtrasado = followUpStatus === 'atrasado';
  const isHoje = followUpStatus === 'hoje';

  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-xl p-3.5 border transition-all duration-200 flex flex-col gap-2 relative group ${
        isDragging
          ? 'opacity-30 border-dashed border-cyan-400 bg-cyan-950/40'
          : isDraggingOverlay
          ? 'shadow-[0_0_24px_rgba(0,210,255,0.4)] ring-2 ring-[#00D2FF] bg-[#10192D] border-cyan-400 scale-105 z-50'
          : isAtrasado
          ? 'bg-[#10192D]/95 hover:bg-[#132039] border-amber-500/40 shadow-sm'
          : 'bg-[#10192D]/95 hover:bg-[#132039] border-cyan-500/20 hover:border-cyan-400/40 shadow-sm'
      }`}
    >
      {/* Top row: Drag grip + Name + Portal Badge + Quick Menu */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-cyan-300 p-0.5 rounded touch-none -ml-1"
            title="Arraste para mover"
            aria-label="Arraste para mover"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Lead Name (clickable to view details) */}
          <button
            type="button"
            onClick={() => onSelectLead(lead)}
            className="text-left font-headline font-bold text-sm text-white hover:text-[#00D2FF] truncate transition-colors"
          >
            {lead.name}
          </button>
        </div>

        {/* Portal Tag & Menu */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`px-2 py-0.5 rounded font-headline text-[10px] uppercase font-bold tracking-wider border ${portalBadge.bg}`}
          >
            {portalBadge.label}
          </span>

          {/* Quick Menu Button for touch/mobile accessibility */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Ações do lead"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-7 z-50 w-44 bg-[#0E1626] rounded-xl shadow-2xl border border-cyan-500/30 py-1 text-xs text-slate-200">
                  <div className="px-3 py-1.5 font-bold text-cyan-300 uppercase tracking-wider text-[10px]">
                    Mover para etapa:
                  </div>
                  {(
                    [
                      { id: 'novo', label: 'Novo Contato' },
                      { id: 'visita', label: 'Visita Agendada' },
                      { id: 'proposta', label: 'Proposta Feita' },
                      { id: 'fechado', label: 'Fechado' },
                      { id: 'perdido', label: 'Perdido' },
                    ] as const
                  ).map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      disabled={lead.status === col.id}
                      onClick={() => {
                        onMoveLeadStatus?.(lead.id, col.id);
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-cyan-950/60 hover:text-[#00D2FF] transition-colors ${
                        lead.status === col.id ? 'font-bold text-[#00D2FF] bg-cyan-950/40' : 'text-slate-300'
                      }`}
                    >
                      <span>{col.label}</span>
                      {lead.status === col.id && <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] shadow-[0_0_6px_#00D2FF]" />}
                    </button>
                  ))}
                  <div className="border-t border-slate-800 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onSelectLead(lead);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  >
                    Ver detalhes completos
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Property Title & Price with image thumbnail */}
      <div
        onClick={() => onSelectLead(lead)}
        className="cursor-pointer flex items-center gap-3 py-0.5"
      >
        {lead.property_image ? (
          <img
            src={lead.property_image}
            alt={lead.property_title || 'Foto do Imóvel'}
            className="w-12 h-12 rounded-lg object-cover shrink-0 ring-1 ring-cyan-500/30 shadow-xs"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#0E1A34] border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 overflow-hidden shadow-xs">
            <Building className="w-5 h-5 text-cyan-300/80" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-300 font-semibold truncate font-body">
            {lead.property_title || 'Imóvel de Interesse'}
          </span>
          <span className="font-headline text-sm text-[#00D2FF] font-extrabold tracking-tight drop-shadow-[0_0_8px_rgba(0,210,255,0.25)]">
            {formatCurrencyBRL(lead.property_price)}
          </span>
        </div>
      </div>

      {/* Special Visita Tag if scheduled */}
      {lead.status === 'visita' && lead.follow_up_time && (
        <div className="p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 flex items-center gap-1.5 text-xs text-cyan-200">
          <Calendar className="w-3.5 h-3.5 text-[#00D2FF]" />
          <span className="font-headline text-[11px] font-semibold">
            Agendada: {formatBRDate(lead.follow_up_date)} às {lead.follow_up_time}
          </span>
        </div>
      )}

      {/* Follow-up / Time & WhatsApp Action */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-0.5">
        {/* Follow up pill */}
        <div className="flex items-center gap-1 text-[11px] min-w-0">
          {isAtrasado ? (
            <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md font-semibold border border-amber-500/30 text-[10px]">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              Atrasado ({formatBRDate(lead.follow_up_date)})
            </span>
          ) : isHoje ? (
            <span className="inline-flex items-center gap-1 text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md font-semibold border border-cyan-500/30 text-[10px]">
              <Clock className="w-3 h-3 text-[#00D2FF]" />
              Hoje {lead.follow_up_time ? `às ${lead.follow_up_time}` : ''}
            </span>
          ) : lead.follow_up_date ? (
            <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
              <Clock className="w-3 h-3 text-slate-500" />
              {formatBRDate(lead.follow_up_date)}
            </span>
          ) : (
            <span className="text-slate-500 italic text-[10px]">Sem lembrete</span>
          )}
        </div>

        {/* Action icons: Visit link if exists + WhatsApp button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {lead.property_url && (
            <a
              href={lead.property_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/30 flex items-center justify-center transition-all"
              title="Abrir anúncio no portal"
              aria-label="Abrir anúncio no portal"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* WhatsApp Deep Link Button in vibrant emerald matching the mockup */}
          <a
            href={getWhatsAppUrl(lead.phone, lead.name)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#080E1A] flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-all"
            title={`Conversar com ${lead.name} no WhatsApp`}
            aria-label={`Conversar com ${lead.name} no WhatsApp`}
          >
            <MessageSquare className="w-4 h-4 fill-current stroke-none" />
          </a>
        </div>
      </div>
    </article>
  );
};
