import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import debounce from 'lodash/debounce';

interface SearchResult {
  id: string;
  type: 'document' | 'sao' | 'skill' | 'job' | 'reference' | 'validator';
  title: string;
  description?: string;
  category?: string;
  metadata?: {
    company?: string;
    location?: string;
    email?: string;
    referenceNumber?: number;
    skillName?: string;
  };
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

      // Search across all tables
      const { data, error } = await supabase.rpc('search_all', {
        search_query: query,
        user_id: user.id
      });

      if (error) throw error;

      // Transform the results to include metadata
      const transformedResults = (data || []).map((result: any) => {
        const baseResult = {
          id: result.id,
          type: result.type,
          title: result.title,
          description: result.description,
          category: result.category
        };

        // Add metadata based on type
        switch (result.type) {
          case 'job':
            return {
              ...baseResult,
              metadata: {
                company: result.company,
                location: result.location
              }
            };
          case 'reference':
            return {
              ...baseResult,
              metadata: {
                email: result.email,
                referenceNumber: result.reference_number
              }
            };
          case 'validator':
            return {
              ...baseResult,
              metadata: {
                email: result.email,
                skillName: result.skill_name
              }
            };
          default:
            return baseResult;
        }
      });

      set({ 
        results: transformedResults, 
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