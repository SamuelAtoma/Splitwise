import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL     = process.env.EXPO_PUBLIC_SUPABASE_URL     || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseMisconfigured = !SUPABASE_URL || !SUPABASE_ANON_KEY;

if (supabaseMisconfigured) {
  console.error(
    '[SPLITWISE] Missing Supabase environment variables.\n' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy.'
  );
}

// Use a stub URL/key when vars are missing so createClient() doesn't throw.
// All real calls will fail gracefully — the app will still render.
export const supabase = createClient(
  SUPABASE_URL     || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: !supabaseMisconfigured,
      persistSession:   !supabaseMisconfigured,
      // On web, Supabase OAuth redirects back with #access_token=... in the URL.
      // detectSessionInUrl must be true on web so the client picks it up.
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  nin: string;
  dob: string;
  phone_verified: boolean;
  nin_verified: boolean;
  face_verified: boolean;
  avatar_url: string | null;
  created_at: string;
};