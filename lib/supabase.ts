import { createClient, SupabaseClient } from "@supabase/supabase-js";

const getEnv = (key: string): string => {
  const viteEnv = (import.meta as any)?.env ?? {};
  const windowEnv = (globalThis as any)?.__ENV__ ?? {};
  const nodeEnv = (globalThis as any)?.process?.env ?? {};

  const value =
    viteEnv[key] ??
    windowEnv[key] ??
    nodeEnv[key];

  return value ? String(value).trim() : "";
};

const supabaseUrl =
  getEnv("VITE_SUPABASE_URL") || getEnv("REACT_APP_SUPABASE_URL");

const supabaseAnonKey =
  getEnv("VITE_SUPABASE_ANON_KEY") || getEnv("REACT_APP_SUPABASE_ANON_KEY");

const hasPlaceholderValue = (value: string) => {
  const upper = value.toUpperCase();
  return (
    upper.includes("SEU-PROJETO") ||
    upper.includes("SUA_ANON_KEY") ||
    upper.includes("SUA_SERVICE_KEY") ||
    upper.includes("YOUR-PROJECT") ||
    upper.includes("YOUR_PROJECT") ||
    upper.includes("PLACEHOLDER")
  );
};

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  !hasPlaceholderValue(supabaseUrl) &&
  !hasPlaceholderValue(supabaseAnonKey) &&
  supabaseUrl.startsWith("https://") &&
  supabaseUrl.includes(".supabase.co")
);

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured) return null;
  if (clientInstance) return clientInstance;

  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
};

export const supabase = (): SupabaseClient => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      "Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
    );
  }
  return client;
};

export const getAuthRedirectUrl = (extraQuery?: string) => {
  if (typeof window !== "undefined" && window.location?.origin) {
    const base = `${window.location.origin}/#/auth/confirm`;
    return extraQuery ? `${base}?${extraQuery}` : base;
  }

  const configured = getEnv("VITE_SUPABASE_REDIRECT_URL");
  if (configured) {
    const normalized = configured.includes("#")
      ? configured
      : `${configured.replace(/\/$/, "")}/#/auth/confirm`;
    return extraQuery ? `${normalized}?${extraQuery}` : normalized;
  }

  return "";
};

export const ADMIN_BUILDER_EMAILS = [
  "stcaioaug@gmail.com",
  "stcaioaug@hotmail.com",
  "manancialsaopedro@gmail.com",
  "caioaugustoaranha@gmail.com",
  "caioaugustomenino@hotmail.com",
  "elevesuaedicao@gmail.com",
];

export const ADMIN_DEFAULT_EMAIL = "stcaioaug@gmail.com";
export const ADMIN_DEFAULT_PASSWORD = "Manancial2026!";

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_BUILDER_EMAILS.includes(email.trim().toLowerCase());
};

export const signInWithGoogle = async () => {
  const redirectTo = getAuthRedirectUrl();

  return supabase().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
};

export const signOut = async () => supabase().auth.signOut();

export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  return supabase().auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: {
        name: name || undefined,
        full_name: name || undefined,
      },
    },
  });
};

export const signInWithEmailPassword = async (email: string, password: string) => {
  return supabase().auth.signInWithPassword({ email, password });
};

export const sendMagicLink = async (email: string) => {
  return supabase().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: getAuthRedirectUrl("type=magiclink"),
      shouldCreateUser: true,
    },
  });
};

export const sendPasswordRecovery = async (email: string) => {
  return supabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: getAuthRedirectUrl("type=recovery"),
  });
};

export const updateUserPassword = async (newPassword: string) => {
  return supabase().auth.updateUser({
    password: newPassword,
  });
};
