import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn the user if Supabase config is missing, but don't crash immediately so they can run mock state
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing. Please configure them in your .env file.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
