import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Não cria client fake. Falha “visível” no console.
  console.error(
    "Supabase env vars missing. Check .env.local: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);
console.log("ENV VITE_SUPABASE_URL =", import.meta.env.VITE_SUPABASE_URL);
console.log("ENV VITE_SUPABASE_ANON_KEY exists =", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
