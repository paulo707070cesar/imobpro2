export type LeadStatus = 'novo' | 'visita' | 'proposta' | 'fechado' | 'perdido';

export type PropertyPortal = 'zap' | 'olx' | 'vivareal' | 'indicacao' | 'direto' | 'outro';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  property_url?: string;
  property_image?: string;
  property_price: number;
  property_title?: string;
  property_portal?: PropertyPortal;
  status: LeadStatus;
  follow_up_date: string; // YYYY-MM-DD
  follow_up_time?: string; // HH:mm
  notes?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  creci?: string;
  agency_name?: string;
  created_at: string;
}

export interface ColumnDefinition {
  id: LeadStatus;
  title: string;
  shortTitle: string;
  color: string; // Tailwind color class or hex
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}
