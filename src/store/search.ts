import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import debounce from 'lodash/debounce';

interface SearchResult {
  id: string;
  type: 'document' | 'sao' | 'skill';
  title: string;
  description?: string;
  category?: string;
}

interface SearchStore {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  results: [],
  loading: false,
  error: null,

  search: debounce(async (query: string) => {
    if (!query.trim()) {
      set({ results: [], loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Single query using UNION to search across all tables
      const { data, error } = await supabase.rpc('search_all', {
        search_query: query,
        user_id: user.id
      });

      if (error) throw error;

      set({ 
        results: data || [], 
        loading: false 
      });
    } catch (error) {
      console.error('Search error:', error);
      set({ 
        error: 'Failed to search', 
        loading: false 
      });
    }
  }, 300), // 300ms debounce

  clearResults: () => set({ results: [], error: null })
})); 