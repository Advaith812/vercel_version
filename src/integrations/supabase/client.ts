import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ekavfvhinluxspkcbmhh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYXZmdmhpbmx1eHNwa2NibWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzOTgxMjIsImV4cCI6MjA0OTk3NDEyMn0.pSebZSLS0Z-rTk9NQ8mszS-0ANc6gOjWi-a3CCmME-s";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: 'whisper-linker-auth',
      storage: window.localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);