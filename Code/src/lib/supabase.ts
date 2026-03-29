import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CLIENT CONFIGURATION ---
// These keys connect your React application to the Supabase Cloud Backend.
// For the demo to work, make sure these are correctly set in your .env file.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('[Supabase] Missing environment variables. Handshake will use simulated local fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
