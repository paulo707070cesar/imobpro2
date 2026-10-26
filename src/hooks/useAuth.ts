import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '../services/supabaseClient';
import { Profile } from '../types/crm';

const STORAGE_KEY_LOCAL_USER = 'imobpro_local_user';
const STORAGE_KEY_LOCAL_PROFILE = 'imobpro_local_profile';

const DEFAULT_DEMO_PROFILE: Profile = {
  id: 'broker-demo-001',
  full_name: 'Roberto Mendes',
  email: 'roberto.corretor@imobpro.com.br',
  phone: '(11) 98888-7777',
  creci: '184.920-F',
  agency_name: 'Imóveis Jardins & Morumbi',
  created_at: new Date().toISOString(),
};

export interface AuthState {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  isDemo: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
  loginAsDemo: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth
  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    async function init() {
      setIsLoading(true);
      if (supabase) {
        try {
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) throw sessionErr;

          if (session?.user) {
            if (!isMounted) return;
            setUser({ id: session.user.id, email: session.user.email });
            setIsDemo(false);

            // Fetch profile
            const { data: profileData, error: profileErr } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!profileErr && profileData) {
              setProfile(profileData as Profile);
            } else {
              // Fallback profile if row doesn't exist yet
              setProfile({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Corretor',
                email: session.user.email || '',
                created_at: new Date().toISOString(),
              });
            }
            setIsLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn('Supabase session load error, checking local:', err);
        }
      }

      // Check local storage for offline / demo user
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY_LOCAL_USER);
        const storedProfile = localStorage.getItem(STORAGE_KEY_LOCAL_PROFILE);
        if (storedUser && storedProfile) {
          if (!isMounted) return;
          setUser(JSON.parse(storedUser));
          setProfile(JSON.parse(storedProfile));
          setIsDemo(true);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error reading local user:', e);
      }

      // Default to demo user if no session is active, so the user experiences the app right away
      if (isMounted) {
        setUser({ id: DEFAULT_DEMO_PROFILE.id, email: DEFAULT_DEMO_PROFILE.email });
        setProfile(DEFAULT_DEMO_PROFILE);
        setIsDemo(true);
        localStorage.setItem(STORAGE_KEY_LOCAL_USER, JSON.stringify({ id: DEFAULT_DEMO_PROFILE.id, email: DEFAULT_DEMO_PROFILE.email }));
        localStorage.setItem(STORAGE_KEY_LOCAL_PROFILE, JSON.stringify(DEFAULT_DEMO_PROFILE));
        setIsLoading(false);
      }
    }

    init();

    // Listen to Supabase auth changes if client is available
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          setIsDemo(false);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            setProfile(profileData as Profile);
          }
        } else {
          // If logged out from Supabase, clear state
          if (!isDemo) {
            setUser(null);
            setProfile(null);
          }
        }
      });

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isDemo]);

  // Sign In with Supabase Auth (or local fallback)
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authErr) throw authErr;

        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email });
          setIsDemo(false);

          // Get profile
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (prof) {
            setProfile(prof as Profile);
          } else {
            const newProf: Profile = {
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || email.split('@')[0],
              email: data.user.email || email,
              created_at: new Date().toISOString(),
            };
            setProfile(newProf);
            await supabase.from('profiles').insert(newProf);
          }
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Erro ao realizar login.');
        return { success: false, error: err.message || 'Erro ao realizar login.' };
      }
    }

    // Local authentication fallback
    const localUser = { id: 'user_' + Math.random().toString(36).substring(2, 9), email };
    const localProfile: Profile = {
      id: localUser.id,
      full_name: email.split('@')[0],
      email,
      created_at: new Date().toISOString(),
    };
    setUser(localUser);
    setProfile(localProfile);
    setIsDemo(false);
    localStorage.setItem(STORAGE_KEY_LOCAL_USER, JSON.stringify(localUser));
    localStorage.setItem(STORAGE_KEY_LOCAL_PROFILE, JSON.stringify(localProfile));
    setIsLoading(false);
    return { success: true };
  }, []);

  // Sign Up with Supabase Auth + Insert into profiles table
  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    setError(null);
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || '',
            },
          },
        });
        if (authErr) throw authErr;

        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            full_name: fullName,
            email: email,
            phone: phone || '',
            created_at: new Date().toISOString(),
          };

          // Insert into profiles table per requirement:
          // "After signup, create a row in the profiles table with the agent's full name."
          await supabase.from('profiles').insert(newProfile);

          setUser({ id: data.user.id, email: data.user.email });
          setProfile(newProfile);
          setIsDemo(false);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Erro ao criar conta.');
        return { success: false, error: err.message || 'Erro ao criar conta.' };
      }
    }

    // Local fallback signup
    const localUser = { id: 'user_' + Math.random().toString(36).substring(2, 9), email };
    const newProfile: Profile = {
      id: localUser.id,
      full_name: fullName,
      email,
      phone: phone || '',
      created_at: new Date().toISOString(),
    };
    setUser(localUser);
    setProfile(newProfile);
    setIsDemo(false);
    localStorage.setItem(STORAGE_KEY_LOCAL_USER, JSON.stringify(localUser));
    localStorage.setItem(STORAGE_KEY_LOCAL_PROFILE, JSON.stringify(newProfile));
    setIsLoading(false);
    return { success: true };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    localStorage.removeItem(STORAGE_KEY_LOCAL_USER);
    localStorage.removeItem(STORAGE_KEY_LOCAL_PROFILE);
    setUser(null);
    setProfile(null);
    setIsDemo(false);
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    if (!profile) return false;
    const updated = { ...profile, ...data };
    setProfile(updated);
    localStorage.setItem(STORAGE_KEY_LOCAL_PROFILE, JSON.stringify(updated));

    const supabase = getSupabaseClient();
    if (supabase && user && !isDemo) {
      try {
        await supabase.from('profiles').update(data).eq('id', user.id);
      } catch (err) {
        console.error('Error updating profile in Supabase:', err);
      }
    }
    return true;
  }, [profile, user, isDemo]);

  // Quick 1-click login as Demo Broker
  const loginAsDemo = useCallback(() => {
    setUser({ id: DEFAULT_DEMO_PROFILE.id, email: DEFAULT_DEMO_PROFILE.email });
    setProfile(DEFAULT_DEMO_PROFILE);
    setIsDemo(true);
    localStorage.setItem(STORAGE_KEY_LOCAL_USER, JSON.stringify({ id: DEFAULT_DEMO_PROFILE.id, email: DEFAULT_DEMO_PROFILE.email }));
    localStorage.setItem(STORAGE_KEY_LOCAL_PROFILE, JSON.stringify(DEFAULT_DEMO_PROFILE));
  }, []);

  return {
    user,
    profile,
    isLoading,
    isDemo,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    loginAsDemo,
  };
}
