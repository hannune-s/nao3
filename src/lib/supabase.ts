import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const customStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      const autoLogin = localStorage.getItem('nao3_auto_login') !== 'false';
      return autoLogin ? localStorage.getItem(key) : sessionStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      const autoLogin = localStorage.getItem('nao3_auto_login') !== 'false';
      if (autoLogin) {
        localStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, value);
      }
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? customStorage : undefined,
  }
});
