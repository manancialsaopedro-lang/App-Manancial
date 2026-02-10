
// FACADE PATTERN: Re-export from the new infrastructure layer.
// This ensures existing imports in the project do not break.
export { supabase, isSupabaseConfigured, signInWithGoogle, signOut } from './lib/supabase';
