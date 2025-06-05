import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface EssayState {
  loading: boolean;
  startWriting: () => Promise<void>;
  loadEssays: () => Promise<void>;
}

export const useEssayStore = create<EssayState>((set) => ({
  loading: false,
  startWriting: async () => {
    set({ loading: true });
    try {
      const { data: skills } = await supabase
        .from('eit_skills')
        .select('*')
        .eq('status', 'completed');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-essay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills,
          experiences: [] // You would populate this with actual experiences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate essay');
      }

      const { essay } = await response.json();

      // Save the generated essay
      await supabase.from('essays').insert({
        title: 'AI Generated Essay',
        content: essay,
        ai_generated: true,
      });

    } finally {
      set({ loading: false });
    }
  },
  loadEssays: async () => {
    // This is a placeholder for now since we don't have essay loading functionality yet
    return Promise.resolve();
  }
}));