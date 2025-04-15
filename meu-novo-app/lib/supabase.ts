import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Use as variáveis importadas ou forneça valores padrão para desenvolvimento
const supabaseUrl = SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseAnonKey = SUPABASE_ANON_KEY || 'sua-chave-anon';

// Para debugging, apenas durante o desenvolvimento
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 