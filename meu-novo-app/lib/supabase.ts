import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Substitua estas URLs e chaves pelas suas credenciais do Supabase
const supabaseUrl = 'https://seu-projeto.supabase.co';
const supabaseAnonKey = 'sua-chave-anon';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 