import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useSkillsStore } from './skills';
import { useSAOsStore } from './saos';
import { useDocumentsStore } from './documents';
import { useProgressStore } from './progress';
import { useSearchStore } from './search';
import { clearAllStates } from '../utils/stateCleanup';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signUp: async (email: string, password: string, fullName: string) => {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) throw signUpError;

    const { error: profileError } = await supabase
      .from('eit_profiles')
      .insert([{ email, full_name: fullName }]);
    
    if (profileError) throw profileError;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearAllStates();
    set({ user: null });
  }
}));

// Initialize auth state with debouncing
let authChangeTimeout: NodeJS.Timeout;
supabase.auth.onAuthStateChange((event, session) => {
  // Clear any pending timeouts
  if (authChangeTimeout) {
    clearTimeout(authChangeTimeout);
  }

  // Debounce the state update
  authChangeTimeout = setTimeout(() => {
    if (event === 'SIGNED_OUT') {
      clearAllStates();
    }
    useAuthStore.setState({ 
      user: session?.user ?? null,
      loading: false,
    });
  }, 100); // 100ms debounce
});