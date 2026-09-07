import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { getSupabase, resetSupabaseClient, getSupabaseConfig, normalizeSupabaseUrl, normalizeAnonKey } from '../lib/supabase';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  loginRequiredModal: boolean;
  setLoginRequiredModal: (val: boolean) => void;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, displayName: string, makeAdmin?: boolean) => Promise<{ error?: string; confirmationRequired?: boolean }>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error?: string }>;
  saveSupabaseCredentials: (url: string, key: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  toggleAdminDevRole: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'gplay_local_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [loginRequiredModal, setLoginRequiredModal] = useState(false);

  // Initialize auth
  const initAuth = async () => {
    setIsLoading(true);
    const config = getSupabaseConfig();
    setIsSupabaseConfigured(config.isConfigured);
    const client = getSupabase();

    if (client) {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email || '');
        } else {
          loadStoredProfile();
        }

        // Listen for auth state changes
        const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user.email || '');
          } else {
            setUser(null);
            setProfile(null);
            localStorage.removeItem(LOCAL_USER_KEY);
          }
        });

        setIsLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error initializing Supabase Auth:', err);
        loadStoredProfile();
        setIsLoading(false);
      }
    } else {
      loadStoredProfile();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loadStoredProfile = () => {
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
        setUser({ id: parsed.id, email: parsed.email });
      }
    } catch (e) {
      console.warn('Failed to load local profile', e);
    }
  };

  const fetchProfile = async (userId: string, email: string) => {
    const client = getSupabase();
    if (!client) return;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data));
      } else {
        // Fallback profile if row is not yet generated
        const fallbackProfile: UserProfile = {
          id: userId,
          email,
          display_name: email.split('@')[0],
          role: 'user',
          created_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        // Attempt to insert profile record
        await client.from('profiles').upsert(fallbackProfile, { onConflict: 'id' });
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const signIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    const client = getSupabase();

    if (client) {
      const cleanEmail = email.trim();
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user.email || cleanEmail);
      }
      return {};
    } else {
      // Local fallback for evaluation when Supabase credentials are not connected
      const cleanEmail = email.trim();
      const fallbackUser = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        display_name: cleanEmail.split('@')[0],
        role: 'user' as const,
        created_at: new Date().toISOString(),
      };
      setUser(fallbackUser);
      setProfile(fallbackUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser));
      return {};
    }
  };

  const signUp = async (
    email: string, 
    pass: string, 
    displayName: string,
    makeAdmin: boolean = false
  ): Promise<{ error?: string; confirmationRequired?: boolean }> => {
    const client = getSupabase();
    const cleanEmail = email.trim();
    const cleanName = displayName.trim() || cleanEmail.split('@')[0];
    const role: 'admin' | 'user' = makeAdmin ? 'admin' : 'user';

    if (client) {
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            display_name: cleanName,
            role: role,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // If session exists (email confirmation disabled or auto-confirmed)
        if (data.session) {
          setUser(data.user);
          const userProfile: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            display_name: cleanName,
            role: role,
            created_at: new Date().toISOString(),
          };
          setProfile(userProfile);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile));

          // Ensure profile row exists in database
          try {
            await client.from('profiles').upsert(userProfile, { onConflict: 'id' });
          } catch (e) {
            console.warn('Profile sync warning:', e);
          }
          return { confirmationRequired: false };
        } else {
          // Supabase sent verification email
          return { confirmationRequired: true };
        }
      }
      return {};
    } else {
      // Local preview registration
      const newProfile: UserProfile = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        display_name: cleanName,
        role: role,
        created_at: new Date().toISOString(),
      };
      setUser(newProfile);
      setProfile(newProfile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
      return { confirmationRequired: false };
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string; success?: boolean }> => {
    const client = getSupabase();
    if (!client) {
      return { error: 'Supabase credentials are not configured yet.' };
    }

    try {
      const cleanEmail = email.trim();
      const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { error: err?.message || 'Failed to send password recovery email.' };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github'): Promise<{ error?: string }> => {
    const client = getSupabase();
    if (!client) {
      return { error: 'Supabase credentials are not configured yet.' };
    }

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || `OAuth sign-in with ${provider} failed.` };
    }
  };

  const saveSupabaseCredentials = async (url: string, key: string): Promise<{ success: boolean; message?: string }> => {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = normalizeAnonKey(key);

    if (!cleanUrl || !cleanKey) {
      return { success: false, message: 'Both a valid Supabase Project URL and Anon Public Key are required.' };
    }

    localStorage.setItem('gplay_supabase_url', cleanUrl);
    localStorage.setItem('gplay_supabase_anon_key', cleanKey);
    resetSupabaseClient();
    await initAuth();
    return { success: true, message: 'Supabase credentials saved successfully.' };
  };

  const signOut = async () => {
    const client = getSupabase();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const toggleAdminDevRole = () => {
    if (!profile) return;

    const updatedRole: 'admin' | 'user' = profile.role === 'admin' ? 'user' : 'admin';
    const updated: UserProfile = {
      ...profile,
      role: updatedRole,
    };
    setProfile(updated);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));

    const client = getSupabase();
    if (client && user) {
      client.from('profiles').update({ role: updatedRole }).eq('id', user.id).then();
    }
  };

  const refreshSession = async () => {
    await initAuth();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        isSupabaseConfigured,
        loginRequiredModal,
        setLoginRequiredModal,
        signIn,
        signUp,
        resetPassword,
        signInWithOAuth,
        saveSupabaseCredentials,
        signOut,
        toggleAdminDevRole,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

