import { useState, useEffect, useCallback, useRef } from 'react';
import { Lead, LeadStatus } from '../types/crm';
import { getSupabaseClient } from '../services/supabaseClient';
import { getTodayDateString } from '../utils/formatters';

const STORAGE_KEY_LEADS = 'imobpro_leads_cache';

// Realistic initial sample leads for Brazilian independent real estate brokers
export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-001',
    user_id: 'broker-demo-001',
    name: 'Lucas Fontes',
    phone: '(11) 99999-0001',
    property_title: 'Apto Perdizes 98m²',
    property_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI_d5GDEfzIG-hSvo7R1mPl_y5WVAu8HUiOitJFhYzGz8WCY_FUfSRPrykxtZDUWMYEo-IimyhOg6UuSqKd2hOTYEJknju3S1vVq4wh0m60jurgHfsotQOixIz_hu_jIZug4PubK5ohysz8u9GbJjc4tfeLCfHkuSZFU_Vv2yCVlUIe2dRy1yZ2GSt6ysOcHmtD5CBS6KKpsoHHteuXrjyvQtk9raorWPud5XsvmLZqYd2aYavX06A',
    property_price: 1450000,
    property_url: 'https://www.zapimoveis.com.br/imovel/venda-apartamento-perdizes-sao-paulo-sp-98m2-id-2948210',
    property_portal: 'zap',
    status: 'novo',
    follow_up_date: getTodayDateString(), // Today!
    follow_up_time: '14:30',
    notes: 'Cliente busca 3 dormitórios com 2 vagas. Já possui carta de crédito aprovada no Itaú. Agendar ligação para alinhar perfil.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'lead-002',
    user_id: 'broker-demo-001',
    name: 'Camila Nogueira',
    phone: '(11) 99999-0002',
    property_title: 'Studio Pinheiros 42m²',
    property_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB05lS5plS3poK76HMRKiMkwEBzSjil-PudVw5WiSkrz3prpnCxjX7pbZ7-0PDxFA_YTvB3tOLtsJU9-4eUVEvToHj5VbOnwX2gPshLCeAYCfNZdOtmThAa-dZNrsRkXkUDpgYdp0h1m5h9ZztwFdYuaZkP4euc2fCsgUHbnG_IgkjGtZSlU7-qK8_GT3P1LRVSxILVC00zCH68LGgkOaH_bT1mVBNQuyEQMRKJEmhVvVoAc2ldYLnE',
    property_price: 680000,
    property_url: 'https://www.vivareal.com.br/imovel/studio-pinheiros-zona-oeste-sao-paulo-com-garagem-42m2-venda-RS680000-id-9812401/',
    property_portal: 'vivareal',
    status: 'novo',
    follow_up_date: getTodayDateString(), // Today!
    follow_up_time: '16:00',
    notes: 'Investidora para locação por temporada (Airbnb). Quer analisar histórico de condomínio e taxa de ocupação na região.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'lead-003',
    user_id: 'broker-demo-001',
    name: 'Gabriel Sampaio',
    phone: '(11) 99999-0003',
    property_title: 'Sobrado Vila Mariana',
    property_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADcrHUCI-MVgc_lnXp0YjZYCjIpZzI_m_SWX452rgvLpowyv0tJKsvMkF3Lmfx7gZPRcnPgDREp5duDfmIvCV8XjWiEm915LrMPmy1gUi64xyGFK2CMqa-K04AB74UM6jOTQ7C0hIykxPozCDTOQvoRrXDo4CJ1Q0k0a3iZyB1RPENfy_6GppcEYBEcJFexyi69-mTLJcCvXbj1lP-K6lVLWMcyAWr7p5wIANAX7bhmT3jlyxns20E',
    property_price: 780000,
    property_url: '',
    property_portal: 'indicacao',
    status: 'novo',
    follow_up_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    follow_up_time: '10:00',
    notes: 'Indicado pelo Dr. Paulo. Procura casa próxima ao Metrô Ana Rosa. Precisa vender apartamento antigo primeiro.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'lead-004',
    user_id: 'broker-demo-001',
    name: 'Renata Valença',
    phone: '(11) 99999-0004',
    property_title: 'Cobertura Moema Pássaros',
    property_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgj3Jh8ifMU3iOc8ROQ20TfmKPxxVBkFcjlwAJC9C1ngLpg8ZaESRXkuL7Bw9HwDFsQoD_GQ9L_ReXwrWs0B0V0EgV_Z1kQUj38hwps_feQlfeC_pPRQR_uPXaUFD97ScIK1rtD_qPC8E41eovVrrtOsjw8e7E5u9YC-qHtYfPwwu16xEkyFcR6P6Jk7TbqaJ7lhzSbABnaXrms_MGkzAEBfsfkgnbbm1LanVvT7tl1cRGuwSJ01By',
    property_price: 2900000,
    property_url: 'https://www.zapimoveis.com.br/imovel/venda-cobertura-moema-sao-paulo-sp-id-883921',
    property_portal: 'zap',
    status: 'visita',
    follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    follow_up_time: '10:00',
    notes: 'Visita agendada para amanhã às 10h. Zelador Sr. Carlos já avisado com antecedência.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'lead-005',
    user_id: 'broker-demo-001',
    name: 'Felipe Amorim',
    phone: '(11) 99999-0005',
    property_title: 'Casa Jardins 180m²',
    property_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8P8t17D03mlEOc_yYGk_UYakGGmEYzN7jqeisA-toelMQ-_B3_LzT0dZvKz8QPZhWJR_ZbUrqHiAAqtNYPoF6Ru_BSmxk1E08fPbx0xeAQbvvbUTmQ8qJkz5CoNRNvcoprRzCu9QqwSTxhwQTy2M_t8iyBG_qqZ0K_9_HP9Riy7CAvqVDh8tW5a93Wo-wHHz-UAYuUnnRfRBmKfckYvitY4sAI90dD62zQf8UH6suqYA6qk8cNW1B',
    property_price: 920000,
    property_url: 'https://sp.olx.com.br/imoveis/casa-jardins-180m2-oportunidade-1092834',
    property_portal: 'olx',
    status: 'visita',
    follow_up_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    follow_up_time: '11:20',
    notes: 'Segunda visita com a arquiteta para estimativa de reforma dos banheiros.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'lead-006',
    user_id: 'broker-demo-001',
    name: 'Mariana Prado',
    phone: '(11) 99999-0006',
    property_title: 'Loft Vila Madalena',
    property_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfOF36KM1G36-btNjUWju0DjkQQx9SOBTtJ77H6X3bOTvlLvk092U-Ig5c-56YfBfP0mMRsLKmu4K0HHxAqvkUmd72K2tC9SXypW_EDiuqjtEJq86v3BevmZPOE30e219yif3XHEMyMBmATOdj6KdZzAwXPkThng2i-4P3SLUsB47_3g7_p2dEwLPyKp9TDV6Q4SZ2oTPzCzyB7FI37KHmNUlr639R8QsMISgb9L8toCosflMNAwzb',
    property_price: 1150000,
    property_url: 'https://www.zapimoveis.com.br/imovel/venda-loft-vila-madalena-sao-paulo-sp-id-102941',
    property_portal: 'zap',
    status: 'proposta',
    follow_up_date: getTodayDateString(), // Today!
    follow_up_time: '17:30',
    notes: 'Enviou proposta formal de R$ 1.100.000 à vista. Proprietário em viagem retornando hoje.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'lead-007',
    user_id: 'broker-demo-001',
    name: 'Thiago Barros',
    phone: '(11) 99999-0007',
    property_title: 'Apto Itaim Bibi 85m²',
    property_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOMjsturCqY5kwnYi_1FgwoNEYPgC35HACXSW3SprreTp3JhxEnqBpkGr2NN-K_gjaSkqla6p7I08Osoy4F6T2YHvRiPVgx2e_23ebsLOkbhC549ynwjUFedGxfqcAlLW_Sjzh7OzTx1XR_FdkxVq7U4Md7fZDdE40o5U5598k_8Ii_gfHvFMijMIXIFitr8YZh3fqH1qSo7lj8UwioAGUEt14zQqhOvNya7vj_JpynygfT78811F4',
    property_price: 1060000,
    property_url: 'https://www.vivareal.com.br/imovel/apartamento-itaim-bibi-sao-paulo-id-998241',
    property_portal: 'vivareal',
    status: 'proposta',
    follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    follow_up_time: '18:00',
    notes: 'Proposta com permuta de sala comercial em Alphaville. Em análise jurídica.',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'lead-008',
    user_id: 'broker-demo-001',
    name: 'Rodrigo Alencar',
    phone: '(11) 99999-0008',
    property_title: 'Garden Brooklin 140m²',
    property_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrzZ3EzQSdw2oPzd6PHhM3-RTSMYHUMwPuQwzr3ZcXc79hxdRsq9I63ZuXsWrhOnkdgO8YmU4-7u6p01RsoDx9ySWYqTi-1s19c2E95LBRCnn8O3SudOiRRHe20coUP7hl0RVB1WaXUE3tGdy_PP58Snpapf1IcAGt97UqeymGdUKELQewzkUQyfbvRvWPDMXLavWUHrFBweYBKcEoaykThhThW_1jheafS4siP0Q_aPhqooyS2qde',
    property_price: 1850000,
    property_url: '',
    property_portal: 'indicacao',
    status: 'fechado',
    follow_up_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    notes: 'Contrato assinado e sinal de 20% pago. Escritura definitiva agendada no 14º Cartório de Notas.',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export function useLeads(userId?: string) {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_LEADS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading leads from cache:', e);
    }
    return INITIAL_LEADS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const realtimeChannelRef = useRef<any>(null);

  // Sync with localStorage
  const saveLeadsToCache = (newLeads: Lead[]) => {
    setLeads(newLeads);
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(newLeads));
      // Dispatch storage event for multi-tab sync
      window.dispatchEvent(new Event('imobpro_leads_updated'));
    } catch (e) {
      console.error('Error saving leads to cache:', e);
    }
  };

  // Fetch leads from Supabase if connected
  const fetchLeads = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !userId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        saveLeadsToCache(data as Lead[]);
      } else if (leads.length === 0) {
        // If empty on supabase, we can keep the local leads or seed
      }
    } catch (err) {
      console.warn('Error fetching leads from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, leads.length]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    fetchLeads();

    const supabase = getSupabaseClient();
    if (supabase && userId) {
      // Subscribe to real-time changes on leads table matching RLS / user_id
      const channel = supabase
        .channel(`leads_realtime_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'leads',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setLeads((prev) => {
                const next = [payload.new as Lead, ...prev.filter((l) => l.id !== payload.new.id)];
                localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(next));
                return next;
              });
            } else if (payload.eventType === 'UPDATE') {
              setLeads((prev) => {
                const next = prev.map((l) => (l.id === payload.new.id ? (payload.new as Lead) : l));
                localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(next));
                return next;
              });
            } else if (payload.eventType === 'DELETE') {
              setLeads((prev) => {
                const next = prev.filter((l) => l.id !== payload.old.id);
                localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(next));
                return next;
              });
            }
          }
        )
        .subscribe();

      realtimeChannelRef.current = channel;

      return () => {
        if (realtimeChannelRef.current) {
          supabase.removeChannel(realtimeChannelRef.current);
        }
      };
    }

    // Multi-tab listener for local state sync
    const handleStorageEvent = () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY_LEADS);
        if (cached) {
          setLeads(JSON.parse(cached));
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('imobpro_leads_updated', handleStorageEvent);
    return () => {
      window.removeEventListener('imobpro_leads_updated', handleStorageEvent);
    };
  }, [userId, fetchLeads]);

  // Add lead
  const addLead = useCallback(
    async (leadData: Omit<Lead, 'id' | 'created_at' | 'user_id'>) => {
      const currentUserId = userId || 'broker-demo-001';
      const newLead: Lead = {
        ...leadData,
        id: 'lead-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        user_id: currentUserId,
        created_at: new Date().toISOString(),
      };

      // Optimistic local update
      const updated = [newLead, ...leads];
      saveLeadsToCache(updated);

      // Save to Supabase if connected
      const supabase = getSupabaseClient();
      if (supabase && userId && userId !== 'broker-demo-001') {
        try {
          await supabase.from('leads').insert({
            ...leadData,
            user_id: currentUserId,
          });
        } catch (err) {
          console.error('Error inserting lead to Supabase:', err);
        }
      }

      return newLead;
    },
    [leads, userId]
  );

  // Update lead
  const updateLead = useCallback(
    async (id: string, updates: Partial<Omit<Lead, 'id' | 'user_id' | 'created_at'>>) => {
      const updated = leads.map((l) => (l.id === id ? { ...l, ...updates } : l));
      saveLeadsToCache(updated);

      const supabase = getSupabaseClient();
      if (supabase && userId && userId !== 'broker-demo-001') {
        try {
          await supabase.from('leads').update(updates).eq('id', id).eq('user_id', userId);
        } catch (err) {
          console.error('Error updating lead in Supabase:', err);
        }
      }
    },
    [leads, userId]
  );

  // Update status (e.g. from Kanban drag-and-drop)
  const updateLeadStatus = useCallback(
    async (id: string, newStatus: LeadStatus) => {
      const updated = leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l));
      saveLeadsToCache(updated);

      const supabase = getSupabaseClient();
      if (supabase && userId && userId !== 'broker-demo-001') {
        try {
          await supabase.from('leads').update({ status: newStatus }).eq('id', id).eq('user_id', userId);
        } catch (err) {
          console.error('Error updating status in Supabase:', err);
        }
      }
    },
    [leads, userId]
  );

  // Delete lead
  const deleteLead = useCallback(
    async (id: string) => {
      const updated = leads.filter((l) => l.id !== id);
      saveLeadsToCache(updated);

      const supabase = getSupabaseClient();
      if (supabase && userId && userId !== 'broker-demo-001') {
        try {
          await supabase.from('leads').delete().eq('id', id).eq('user_id', userId);
        } catch (err) {
          console.error('Error deleting lead from Supabase:', err);
        }
      }
    },
    [leads, userId]
  );

  // Reset to initial sample data
  const resetToSampleData = useCallback(() => {
    saveLeadsToCache(INITIAL_LEADS);
  }, []);

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
    refreshLeads: fetchLeads,
    resetToSampleData,
  };
}
