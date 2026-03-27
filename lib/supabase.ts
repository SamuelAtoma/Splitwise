import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://fgudqisiikwnohtteevw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndWRxaXNpaWt3bm9odHRlZXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjkwNTksImV4cCI6MjA4ODgwNTA1OX0.M7LKeRe59CuejCNF24JExbpPpQLtLj_gIUV_Faj1jsM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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