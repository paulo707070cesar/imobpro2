import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lead, LeadStatus, PropertyPortal } from '../types/crm';
import {
  formatCurrencyBRL,
  formatBRPhone,
  detectPortalFromUrl,
  getWhatsAppUrl,
  getTodayDateString,
  formatBRDate,
  getPortalBadgeInfo,
} from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  X,
  MessageSquare,
  ExternalLink,
  Trash2,
  Calendar,
  Clock,
  Building,
  DollarSign,
  Phone,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Check,
  Shield,
} from 'lucide-react';

const leadFormSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter no mínimo 2 caracteres' }),
  phone: z
    .string()
    .min(10, { message: 'Informe um telefone válido com DDD (ex: (11) 98765-4321)' }),
  property_title: z.string().optional(),
  property_url: z.string().optional(),
  property_price: z.number().min(0, { message: 'Valor deve ser positivo' }),
  status: z.enum(['novo', 'visita', 'proposta', 'fechado', 'perdido']),
  follow_up_date: z.string().optional(),
  follow_up_time: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  initialStatus?: LeadStatus;
  onSaveLead: (data: Omit<Lead, 'id' | 'created_at' | 'user_id'>) => Promise<any>;
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<any>;
  onDeleteLead: (id: string) => Promise<any>;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  initialStatus = 'novo',
  onSaveLead,
  onUpdateLead,
  onDeleteLead,
}) => {
  const isEditing = Boolean(lead);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      property_title: '',
      property_url: '',
      property_price: 0,
      status: initialStatus,
      follow_up_date: getTodayDateString(),
      follow_up_time: '14:00',
      notes: '',
    },
  });

  const watchedUrl = watch('property_url');
  const watchedPhone = watch('phone');
  const watchedStatus = watch('status');

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        phone: formatBRPhone(lead.phone),
        property_title: lead.property_title || '',
        property_url: lead.property_url || '',
        property_price: lead.property_price || 0,
        status: lead.status,
        follow_up_date: lead.follow_up_date || getTodayDateString(),
        follow_up_time: lead.follow_up_time || '14:00',
        notes: lead.notes || '',
      });
    } else {
      reset({
        name: '',
        phone: '',
        property_title: '',
        property_url: '',
        property_price: 0,
        status: initialStatus,
        follow_up_date: getTodayDateString(),
        follow_up_time: '14:00',
        notes: '',
      });
    }
    setIsConfirmingDelete(false);
  }, [lead, initialStatus, reset, isOpen]);

  if (!isOpen) return null;

  const detectedPortal = detectPortalFromUrl(watchedUrl);
  const portalBadge = getPortalBadgeInfo(detectedPortal);

  const handleSetPresetDate = (type: 'hoje' | 'amanha' | '2dias') => {
    const d = new Date();
    if (type === 'amanha') {
      d.setDate(d.getDate() + 1);
      setValue('follow_up_time', '10:00');
    } else if (type === '2dias') {
      d.setDate(d.getDate() + 2);
      setValue('follow_up_time', '15:00');
    } else {
      setValue('follow_up_time', '16:00');
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setValue('follow_up_date', `${yyyy}-${mm}-${dd}`);
  };

  const onSubmit = async (data: LeadFormData) => {
    try {
      setIsSubmitting(true);
      const portal: PropertyPortal = detectPortalFromUrl(data.property_url);

      if (data.status === 'fechado') {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00D2FF', '#0070F3', '#10B981'],
          });
        } catch (e) {
          // ignore
        }
      }

      if (isEditing && lead) {
        await onUpdateLead(lead.id, {
          name: data.name,
          phone: formatBRPhone(data.phone),
          property_title: data.property_title,
          property_url: data.property_url,
          property_price: Number(data.property_price) || 0,
          property_portal: portal,
          status: data.status,
          follow_up_date: data.follow_up_date || getTodayDateString(),
          follow_up_time: data.follow_up_time,
          notes: data.notes,
        });
      } else {
        await onSaveLead({
          name: data.name,
          phone: formatBRPhone(data.phone),
          property_title: data.property_title || 'Interesse Imobiliário',
          property_url: data.property_url || '',
          property_price: Number(data.property_price) || 0,
          property_portal: portal,
          status: data.status,
          follow_up_date: data.follow_up_date || getTodayDateString(),
          follow_up_time: data.follow_up_time || '14:00',
          notes: data.notes || '',
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    try {
      setIsSubmitting(true);
      await onDeleteLead(lead.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPhoneToClipboard = () => {
    if (watchedPhone) {
      navigator.clipboard.writeText(watchedPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Dark Immersive Backdrop with subtle cyan gradient tint */}
      <div
        className="fixed inset-0 bg-[#050811]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Sleek Dark Bottom Sheet Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-[#0B132B]/95 backdrop-blur-2xl border-t border-cyan-500/30 sm:border sm:rounded-[24px] rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,210,255,0.1)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Glow Pill Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-cyan-400/50 rounded-full shadow-[0_0_10px_rgba(0,210,255,0.8)]" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,210,255,0.25)]">
              <Shield className="w-4 h-4 text-[#00D2FF]" />
            </div>
            <div>
              <h2 className="font-headline text-[18px] font-bold text-white tracking-tight">
                {isEditing ? 'Detalhes da Oportunidade' : 'Nova Oportunidade'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? 'Atualize o funil e lembretes de contato'
                  : 'Cadastre rápido e configure o follow-up'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto px-5 py-4 flex flex-col gap-4 flex-1 text-slate-200">
          {/* Quick Action Bar if Editing: WhatsApp & Portal Visit Link */}
          {isEditing && lead && (
            <div className="p-3 bg-[#0E1A34] border border-cyan-500/25 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate font-mono">
                  {lead.phone}
                </span>
                <button
                  type="button"
                  onClick={copyPhoneToClipboard}
                  className="p-1 text-slate-400 hover:text-cyan-300"
                  title="Copiar número"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {lead.property_url && (
                  <a
                    href={lead.property_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#00D2FF]" />
                    <span>Visitar Link</span>
                  </a>
                )}

                <a
                  href={getWhatsAppUrl(lead.phone, lead.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-headline font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current stroke-none" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* Field: Phone with WhatsApp icon */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                <span>Número do WhatsApp</span>
                <span className="text-[#00D2FF]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setValue('phone', '(11) 99482-1088')}
                className="text-[11px] font-semibold text-[#00D2FF] hover:underline"
              >
                Colar exemplo
              </button>
            </div>

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3.5 border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all">
                  <div className="flex items-center gap-1.5 pr-2.5">
                    <span className="text-[16px] leading-none">🇧🇷</span>
                    <span className="text-xs font-semibold text-cyan-200/80">+55</span>
                  </div>
                  <div className="w-[1px] h-4 bg-cyan-500/20 mr-3" />
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={field.value}
                    onChange={(e) => {
                      const formatted = formatBRPhone(e.target.value);
                      field.onChange(formatted);
                    }}
                    className="w-full h-11 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <MessageSquare className="w-4 h-4 text-[#00D2FF] shrink-0 fill-current stroke-none drop-shadow-[0_0_6px_rgba(0,210,255,0.5)]" />
                </div>
              )}
            />
            {errors.phone && (
              <span className="text-[11px] text-red-400 font-medium">
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* Field: Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <span>Nome do Lead</span>
              <span className="text-[#00D2FF]">*</span>
            </label>
            <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3.5 border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all">
              <input
                type="text"
                placeholder="Ex: Carlos Eduardo Mendes"
                {...register('name')}
                className="w-full h-11 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <User className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {errors.name && (
              <span className="text-[11px] text-red-400 font-medium">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Field: Property Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Imóvel de Interesse</span>
            </label>
            <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3.5 border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all">
              <input
                type="text"
                placeholder="Ex: Apto 112m² Jardins / Studio Pinheiros"
                {...register('property_title')}
                className="w-full h-11 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Row: Property Price & Portal Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Field: Property Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Valor do Imóvel (R$)</span>
              </label>
              <Controller
                name="property_price"
                control={control}
                render={({ field }) => (
                  <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3.5 border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all">
                    <span className="text-xs font-bold text-cyan-300 mr-2">
                      R$
                    </span>
                    <input
                      type="text"
                      placeholder="1.450.000"
                      value={field.value ? Number(field.value).toLocaleString('pt-BR') : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        field.onChange(raw ? parseFloat(raw) : 0);
                      }}
                      className="w-full h-11 bg-transparent text-sm font-headline font-bold text-[#00D2FF] placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                )}
              />
            </div>

            {/* Field: Property Portal Link */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>Link (ZAP / OLX / VivaReal)</span>
                </label>
                {watchedUrl && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-headline font-bold uppercase border ${portalBadge.bg}`}
                  >
                    {portalBadge.label}
                  </span>
                )}
              </div>
              <div className="relative flex items-center bg-[#0E1A34] rounded-xl px-3.5 border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_14px_rgba(0,210,255,0.3)] transition-all">
                <LinkIcon className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="url"
                  placeholder="https://www.zapimoveis.com.br/imovel/..."
                  {...register('property_url')}
                  className="w-full h-11 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none truncate"
                />
              </div>
            </div>
          </div>

          {/* Field: Funnel Status Pill Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-200">Etapa Inicial no Funil</span>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { id: 'novo', label: 'Novo' },
                      { id: 'visita', label: 'Visita' },
                      { id: 'proposta', label: 'Proposta' },
                      { id: 'fechado', label: 'Fechado' },
                      { id: 'perdido', label: 'Perdido' },
                    ] as const
                  ).map((st) => {
                    const isSelected = field.value === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => field.onChange(st.id)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-headline font-bold transition-all border ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.4)] border-cyan-300'
                            : 'bg-[#0E1A34] text-slate-300 border-white/5 hover:border-cyan-500/40'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Field: Follow-up Reminder & Stage */}
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-gradient-to-r from-[#0d1c3a]/90 to-[#0e182e]/90 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>Lembrete de Follow-up</span>
              </label>
              <span className="text-[11px] text-slate-400">Fuso de Brasília</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => handleSetPresetDate('hoje')}
                className="px-3 py-1.5 rounded-full bg-[#0E1A34] text-slate-300 border border-white/5 text-xs font-medium hover:border-cyan-500/30 transition-all shrink-0 cursor-pointer"
              >
                Hoje às 16h
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetDate('amanha')}
                className="px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/80 text-xs font-bold shadow-[0_0_12px_rgba(0,210,255,0.35)] shrink-0 cursor-pointer"
              >
                Amanhã 10h
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetDate('2dias')}
                className="px-3 py-1.5 rounded-full bg-[#0E1A34] text-slate-300 border border-white/5 text-xs font-medium hover:border-cyan-500/30 transition-all shrink-0 cursor-pointer"
              >
                Em 2 dias
              </button>
            </div>

            {/* Custom Date & Time Inputs */}
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="date"
                {...register('follow_up_date')}
                className="w-full h-11 px-3 rounded-xl bg-[#0E1A34] border border-cyan-500/20 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
              />
              <input
                type="time"
                {...register('follow_up_time')}
                className="w-full h-11 px-3 rounded-xl bg-[#0E1A34] border border-cyan-500/20 text-xs font-medium text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Field: Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Observações / Perfil do Cliente</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Busca apartamento ensolarado face norte, com financiamento aprovado..."
              {...register('notes')}
              className="w-full p-3 rounded-xl bg-[#0E1A34] border border-cyan-500/20 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Action Bottom Fixed Dock with Electric Cyan Gradient Button & Glow */}
          <div className="flex flex-col gap-2 pt-2 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-[#00D2FF] to-[#0070F3] hover:from-[#33dcff] hover:to-[#1a7ff7] text-[#04101e] font-headline text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,210,255,0.5),0_4px_12px_rgba(0,112,243,0.3)] active:scale-[0.98] transition-all cursor-pointer border border-cyan-200/40 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isEditing ? 'Salvar Oportunidade' : 'Salvar Lead'}</span>
            </button>

            {isEditing && (
              <div className="pt-1">
                {!isConfirmingDelete ? (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="w-full h-10 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Lead</span>
                  </button>
                ) : (
                  <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl flex flex-col gap-2 animate-in fade-in">
                    <p className="text-xs text-red-200 font-bold text-center">
                      Tem certeza que deseja excluir este lead?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                      >
                        Sim, Excluir
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(false)}
                        className="h-9 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
