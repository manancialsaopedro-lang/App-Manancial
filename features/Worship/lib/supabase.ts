import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../../../lib/supabase';

const sharedClient = getSupabaseClient();

export const isConfigured: boolean = isSupabaseConfigured && !!sharedClient;
export const supabaseConfigMessage: string = isConfigured
  ? ''
  : 'O Supabase não está configurado.';

export const supabase: SupabaseClient =
  sharedClient ??
  createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
