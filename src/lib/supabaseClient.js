import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    '[supabaseClient] VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não estão definidas. ' +
    'Copie o arquivo .env.example para .env e preencha com os dados do seu projeto Supabase ' +
    '(Project Settings → API).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
