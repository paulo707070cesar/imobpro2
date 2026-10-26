import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Lead, LeadStatus, ColumnDefinition } from '../types/crm';
import { LeadCard } from './LeadCard';
import { formatCurrencyBRL } from '../utils/formatters';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: ColumnDefinition;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenAddModal: (initialStatus: LeadStatus) => void;
  onMoveLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  isOverColumn?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  leads,
  onSelectLead,
  onOpenAddModal,
  onMoveLeadStatus,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const totalValue = leads.reduce((sum, lead) => sum + (Number(lead.property_price) || 0), 0);
  const leadIds = leads.map((l) => l.id);

  return (
    <section
      ref={setNodeRef}
      className={`snap-start shrink-0 w-[285px] sm:w-[300px] lg:w-full lg:min-w-0 flex flex-col rounded-2xl bg-[#0C1322]/90 border transition-all p-3 shadow-lg select-none ${
        isOver
          ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-400/30 shadow-[0_0_20px_rgba(0,210,255,0.2)]'
          : 'border-cyan-500/15'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          {/* Glowing Status Dot */}
          <span className={`w-2.5 h-2.5 rounded-full ${column.accentColor} shadow-[0_0_8px_currentColor]`} />
          <h2 className="font-headline text-sm text-white font-bold tracking-tight">
            {column.title}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 font-headline text-[10px] font-bold">
            {leads.length}
          </span>
        </div>

        {/* Total R$ Volume for this Column */}
        <span className="font-body text-xs text-slate-400 font-medium">
          {formatCurrencyBRL(totalValue)}
        </span>
      </div>

      {/* Quick Add Lead to This Stage Button */}
      <button
        type="button"
        onClick={() => onOpenAddModal(column.id)}
        className="w-full h-10 mb-3 rounded-xl bg-slate-900/90 border border-dashed border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 font-headline text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-950/40 active:scale-[0.98] transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 text-[#00D2FF]" />
        <span>Adicionar nesta etapa</span>
      </button>

      {/* Lead Cards List Container */}
      <div className="flex flex-col gap-3 min-h-[160px] flex-1">
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onSelectLead={onSelectLead}
              onMoveLeadStatus={onMoveLeadStatus}
            />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-slate-800/60 rounded-xl px-4">
            <p className="text-xs text-slate-500 font-medium font-body">Nenhum lead nesta etapa</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Arraste um card ou adicione um novo</p>
          </div>
        )}
      </div>
    </section>
  );
};
