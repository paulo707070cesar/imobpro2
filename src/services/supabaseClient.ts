import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or localStorage stored credentials
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const STORAGE_KEY_CONFIG = 'imobpro_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored Supabase config:', e);
  }
  return {
    url: envUrl,
    anonKey: envAnonKey,
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
    }
  }
  return null;
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

/**
 * SQL script for Supabase matching the exact requested schema & RLS rules:
 */
export const SUPABASE_SQL_SCHEMA = `-- 1. Habilitar UUID e criar ENUM de status
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('novo', 'visita', 'proposta', 'fechado', 'perdido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Tabela de Perfis de Corretores (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  creci TEXT,
  agency_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Leads (leads)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_url TEXT,
  property_price NUMERIC DEFAULT 0,
  property_title TEXT,
  property_portal TEXT DEFAULT 'direto',
  status lead_status DEFAULT 'novo' NOT NULL,
  follow_up_date DATE,
  follow_up_time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. Políticas RLS para leads (auth.uid() = user_id)
CREATE POLICY "Corretores podem visualizar apenas seus próprios leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Corretores podem criar novos leads para si mesmos"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Corretores podem atualizar apenas seus próprios leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Corretores podem excluir apenas seus próprios leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Habilitar Supabase Realtime para a tabela leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
`;
