import { createClient } from '@supabase/supabase-js';

// Retrieve keys from Vite's import.meta.env, process.env, or window/globals
const supabaseUrl = (((import.meta as any).env?.VITE_SUPABASE_URL) || process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || process.env.SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl !== '' &&
  supabaseAnonKey !== '';

function createMockSupabase() {
  console.warn("Supabase is not configured. Using mock client fallback.");
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_callback: any) => {
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      },
      signInWithOAuth: async () => {
        return { error: new Error("Supabase is not configured yet. Please configure valid SUPABASE_URL and SUPABASE_ANON_KEY environment variables.") };
      },
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null })
    })
  } as any;
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : createMockSupabase();
