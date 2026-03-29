import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CLIENT CONFIGURATION ---
// These keys connect your React application to the Supabase Cloud Backend.
// For the demo to work, make sure these are correctly set in your .env file.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables. Auth will use local fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
