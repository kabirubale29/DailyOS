import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or custom local storage settings
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('dailyos_supabase_url');
  const localKey = localStorage.getItem('dailyos_supabase_anon_key');

  const supabaseUrl = localUrl || envUrl || '';
  const supabaseAnonKey = localKey || envKey || '';

  return { supabaseUrl, supabaseAnonKey };
};

export const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

export const isSupabaseConfigured = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

export const createSupabaseInstance = (url, key) => {
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase = isSupabaseConfigured()
  ? createSupabaseInstance(supabaseUrl, supabaseAnonKey)
  : null;
