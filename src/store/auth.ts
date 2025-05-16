import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useSkillsStore } from './skills';
import { useSAOsStore } from './saos';
import { useDocumentsStore } from './documents';
import { useProgressStore } from './progress';
import { useSearchStore } from './search';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAllStores: () => void;
}

const clearAllStores = () => {
  // Clear skills store
  useSkillsStore.setState({
    skillCategories: [],
    loading: false,
    error: null
  });

  // Clear SAOs store
  useSAOsStore.setState({
    saos: [],
    loading: false,
    error: null
  });

  // Clear documents store
  useDocumentsStore.setState({
    documents: [],
    loading: false,
    error: null
  });

  // Clear progress store
  useProgressStore.setState({
    overallProgress: 0,
    completedSkills: 0,
    documentedExperiences: 0,
    supervisorApprovals: 0,
    lastUpdated: new Date().toISOString(),
    loading: false,
    initialized: false
  });

  // Clear search store
  useSearchStore.setState({
    results: [],
    loading: false,
    error: null
  });
};

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
    clearAllStores(); // Clear all stores before setting user to null
    set({ user: null });
  },
  clearAllStores
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    clearAllStores(); // Clear all stores on sign out
  }
  useAuthStore.setState({ 
    user: session?.user ?? null,
    loading: false,
  });
});