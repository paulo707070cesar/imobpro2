import { PropertyPortal } from '../types/crm';

/**
 * Format number into Brazilian Real (R$) currency without cents if zero
 * e.g. 1450000 -> "R$ 1.450.000"
 */
export function formatCurrencyBRL(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return 'R$ 0';
  }
  const numericVal = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(numericVal);
}

/**
 * Automatically format Brazilian phone numbers
 * e.g. "11987654321" -> "(11) 98765-4321"
 * e.g. "1133334444" -> "(11) 3333-4444"
 */
export function formatBRPhone(value: string | undefined | null): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // 11 digits: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Strip non-digit characters and ensure country code 55 for Brazil
 */
export function cleanPhoneDigits(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  // If user included leading 0, remove it
  if (cleaned.startsWith('0') && cleaned.length > 10) {
    cleaned = cleaned.substring(1);
  }
  // If user already included 55 at the front with 12 or 13 digits
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    return cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Build WhatsApp deep link matching prompt spec:
 * https://wa.me/55[phone]?text=Olá [Name], tudo bem?
 */
export function getWhatsAppUrl(phone: string, leadName: string, customMsg?: string): string {
  const digits = cleanPhoneDigits(phone);
  const defaultText = `Olá ${leadName.trim()}, tudo bem?`;
  const text = customMsg || defaultText;
  return `https://wa.me/55${digits}?text=${encodeURIComponent(text)}`;
}

/**
 * Get date string for today in local YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD into DD/MM/YYYY
 */
export function formatBRDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Check if follow-up date is today
 */
export function isFollowUpToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

/**
 * Check if follow-up date is in the past (overdue)
 */
export function isFollowUpOverdue(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const today = getTodayDateString();
  return dateStr < today;
}

/**
 * Categorize follow-up status:
 * 'atrasado' | 'hoje' | 'futuro' | 'sem_data'
 */
export function getFollowUpStatus(dateStr: string | undefined): 'atrasado' | 'hoje' | 'futuro' | 'sem_data' {
  if (!dateStr) return 'sem_data';
  const today = getTodayDateString();
  if (dateStr < today) return 'atrasado';
  if (dateStr === today) return 'hoje';
  return 'futuro';
}

/**
 * Detect real estate portal from URL
 */
export function detectPortalFromUrl(url: string | undefined): PropertyPortal {
  if (!url) return 'direto';
  const lower = url.toLowerCase();
  if (lower.includes('zapimoveis.com.br') || lower.includes('zap')) return 'zap';
  if (lower.includes('olx.com.br') || lower.includes('olx')) return 'olx';
  if (lower.includes('vivareal.com.br') || lower.includes('vivareal')) return 'vivareal';
  if (lower.includes('quintoandar.com.br')) return 'outro';
  return 'direto';
}

/**
 * Get badge styling for property portal
 */
export function getPortalBadgeInfo(portal: PropertyPortal | undefined) {
  switch (portal) {
    case 'zap':
      return {
        label: 'ZAP',
        bg: 'bg-blue-950/80 text-blue-300 border-blue-500/30',
        dot: 'bg-blue-400',
      };
    case 'vivareal':
      return {
        label: 'VIVAREAL',
        bg: 'bg-sky-950/80 text-sky-300 border-sky-500/30',
        dot: 'bg-sky-400',
      };
    case 'olx':
      return {
        label: 'OLX',
        bg: 'bg-purple-950/80 text-purple-300 border-purple-500/30',
        dot: 'bg-purple-400',
      };
    case 'indicacao':
      return {
        label: 'INDICAÇÃO',
        bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
        dot: 'bg-[#00D2FF]',
      };
    case 'direto':
      return {
        label: 'DIRETO',
        bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    default:
      return {
        label: 'PORTAL',
        bg: 'bg-slate-900/90 text-slate-300 border-slate-700/60',
        dot: 'bg-slate-400',
      };
  }
}
