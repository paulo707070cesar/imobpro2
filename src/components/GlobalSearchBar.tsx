import React, { useState, useRef, useEffect } from 'react';
import { Lead } from '../types/crm';
import { formatCurrencyBRL, getWhatsAppUrl, getPortalBadgeInfo } from '../utils/formatters';
import {
  Search,
  X,
  Phone,
  Building,
  MessageSquare,
  ArrowRight,
  User,
  SlidersHorizontal,
} from 'lucide-react';

interface GlobalSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  leads: Lead[];
  filteredCount: number;
  totalCount: number;
  onSelectLead: (lead: Lead) => void;
  className?: string;
  isMobileExpanded?: boolean;
  onCloseMobile?: () => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  leads,
  filteredCount,
  totalCount,
  onSelectLead,
  className = '',
  isMobileExpanded = false,
  onCloseMobile,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when expanded on mobile
  useEffect(() => {
    if (isMobileExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobileExpanded]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        onSearchChange('');
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  const hasSearch = searchQuery.trim().length > 0;

  // Filtered preview matches (top 5 for dropdown preview)
  const previewMatches = hasSearch ? leads.slice(0, 5) : [];

  return (
    <div ref={containerRef} className={`relative flex items-center ${className}`}>
      {/* Search Input Box */}
      <div
        className={`relative flex items-center w-full bg-[#0E1A34] rounded-xl px-3 border transition-all ${
          isFocused || hasSearch
            ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.3)] ring-1 ring-cyan-400/40 bg-[#0E1A34]'
            : 'border-cyan-500/20 hover:border-cyan-500/40'
        }`}
      >
        <Search className={`w-4 h-4 mr-2 shrink-0 transition-colors ${hasSearch ? 'text-[#00D2FF]' : 'text-slate-400'}`} />

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Buscar lead por nome ou (XX) 9..."
          className="w-full h-10 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />

        {/* Clear Search Button */}
        {hasSearch && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
            title="Limpar busca (ESC)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Matches Badge */}
        {hasSearch ? (
          <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 text-[#00D2FF] border border-cyan-400/40 font-headline text-[10px] font-bold shrink-0">
            {filteredCount}
          </span>
        ) : (
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-[10px] text-slate-400 font-mono">
            ⌘K
          </kbd>
        )}

        {/* Close mobile button if expanded */}
        {isMobileExpanded && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-2 px-2 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 font-medium hover:text-white sm:hidden"
          >
            Fechar
          </button>
        )}
      </div>

      {/* Floating Instant Preview Dropdown when typing */}
      {isFocused && hasSearch && (
        <div className="absolute left-0 right-0 top-12 z-50 bg-[#0B132B]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_15px_rgba(0,210,255,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2 border-b border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 bg-[#0E1626]/80">
            <span className="font-headline font-bold text-white">
              {filteredCount} {filteredCount === 1 ? 'lead encontrado' : 'leads encontrados'}
            </span>
            <span className="text-[10px] text-cyan-300 font-mono">Filtrando em todas as telas</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
            {previewMatches.map((lead) => {
              const portal = getPortalBadgeInfo(lead.property_portal);

              return (
                <div
                  key={lead.id}
                  onClick={() => {
                    onSelectLead(lead);
                    setIsFocused(false);
                  }}
                  className="p-3 hover:bg-[#10192D] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {lead.property_image ? (
                      <img
                        src={lead.property_image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-cyan-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#0E1A34] border border-cyan-500/30 text-[#00D2FF] font-headline font-bold flex items-center justify-center text-xs shrink-0">
                        {lead.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline font-bold text-sm text-white group-hover:text-[#00D2FF] transition-colors truncate">
                          {lead.name}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-headline font-bold uppercase border ${portal.bg}`}>
                          {portal.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-[#00D2FF]" />
                        {lead.phone}
                        {lead.property_title && ` • ${lead.property_title}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="font-headline font-bold text-xs text-[#00D2FF]">
                      {formatCurrencyBRL(lead.property_price)}
                    </span>
                    <a
                      href={getWhatsAppUrl(lead.phone, lead.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-xs transition-transform active:scale-95"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current stroke-none" />
                    </a>
                  </div>
                </div>
              );
            })}

            {filteredCount === 0 && (
              <div className="p-5 text-center text-xs text-slate-400">
                Nenhum lead encontrado para "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
