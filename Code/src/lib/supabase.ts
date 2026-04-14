import { createClient } from '@supabase/supabase-js';

// Uses env vars first, falls back to production keys for Vercel deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kjdodywiyxrbzginvqii.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZG9keXdpeXhyYnpnaW52cWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjUzMTgsImV4cCI6MjA4NjEwMTMxOH0.hPg2E5rIAwSwQVeXZZRkNKJ1YMQgdq_U6fik6JLGI4k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
