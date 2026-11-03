import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getItem, setItem, KEYS } from './storage';
import { INITIAL_USER } from './mockData';

export const authService = {
  async getCurrentUser() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch user profile from public.profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          const mergedUser = {
            id: user.id,
            email: user.email,
            full_name: profile?.full_name || user.user_metadata?.full_name || 'Kabir Ubale',
            avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
            is_cloud: true,
          };
          setItem(KEYS.USER, mergedUser);
          return mergedUser;
        }
      } catch (err) {
        console.warn('Supabase auth check error', err);
      }
    }
    return getItem(KEYS.USER, INITIAL_USER);
  },

  async getSession() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
      } catch (err) {
        console.warn('Supabase getSession error', err);
      }
    }
    return null;
  },

  async signIn(email, password) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured yet. Please configure Supabase in Settings.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return await this.getCurrentUser();
  },

  async signUp(email, password, fullName = 'Kabir Ubale') {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured yet. Please configure Supabase in Settings.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return await this.getCurrentUser();
  },

  async signOut() {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error', err);
      }
    }
    const localUser = INITIAL_USER;
    setItem(KEYS.USER, localUser);
    return localUser;
  },

  async updateProfile(updates) {
    const current = getItem(KEYS.USER, INITIAL_USER);
    const updated = { ...current, ...updates };
    setItem(KEYS.USER, updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              full_name: updated.full_name,
              avatar_url: updated.avatar_url,
              timezone: updated.timezone,
            });
        }
      } catch (err) {
        console.warn('Supabase profile sync error', err);
      }
    }

    return updated;
  },
};
