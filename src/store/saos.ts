import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Skill } from './skills';

export interface SAO {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  skills: Skill[];
}

interface SAOsState {
  saos: SAO[];
  loading: boolean;
  error: string | null;
  createSAO: (title: string, content: string, skills: Skill[]) => Promise<void>;
  updateSAO: (id: string, title: string, content: string, skills: Skill[]) => Promise<void>;
  deleteSAO: (id: string) => Promise<void>;
  loadUserSAOs: () => Promise<void>;
}

export const useSAOsStore = create<SAOsState>((set, get) => ({
  saos: [],
  loading: false,
  error: null,

  createSAO: async (title: string, content: string, skills: Skill[]) => {
    set({ loading: true, error: null });
    try {
      console.log('Creating new SAO...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) throw new Error('No authenticated user found');

      // Ensure EIT profile exists for this user
      await supabase
        .from('eit_profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || ''
        });

      console.log('Creating SAO:', { title, content, skills, eit_id: user.id });

      // First, create the SAO
      const { data: sao, error: saoError } = await supabase
        .from('saos')
        .insert([
          {
            eit_id: user.id,
            title,
            content
          }
        ])
        .select()
        .single();

      if (saoError) {
        console.error('Error creating SAO:', {
          error: saoError,
          message: saoError.message,
          details: saoError.details,
          hint: saoError.hint,
          code: saoError.code
        });
        throw saoError;
      }

      console.log('SAO created successfully:', sao);

      // Then, create the SAO skills relationships
      const saoSkills = skills.map(skill => ({
        sao_id: sao.id,
        skill_id: skill.id,
        category_name: skill.category_name || ''
      }));

      console.log('Creating SAO skills relationships:', saoSkills);

      const { error: skillsError } = await supabase
        .from('sao_skills')
        .insert(saoSkills);

      if (skillsError) {
        console.error('Error creating SAO skills:', {
          error: skillsError,
          message: skillsError.message,
          details: skillsError.details,
          hint: skillsError.hint,
          code: skillsError.code
        });
        throw skillsError;
      }

      console.log('SAO skills created successfully');

      // Reload SAOs to get the updated list
      await get().loadUserSAOs();
    } catch (error: any) {
      console.error('Error in createSAO:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      set({ error: `Failed to create SAO: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateSAO: async (id: string, title: string, content: string, skills: Skill[]) => {
    set({ loading: true, error: null });
    try {
      console.log('Updating SAO:', { id, title, content, skills });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) throw new Error('No authenticated user found');

      // Update the SAO
      const { error: saoError } = await supabase
        .from('saos')
        .update({ title, content })
        .eq('id', id)
        .eq('eit_id', user.id);

      if (saoError) {
        console.error('Error updating SAO:', saoError);
        throw saoError;
      }

      // Delete existing SAO skills
      const { error: deleteError } = await supabase
        .from('sao_skills')
        .delete()
        .eq('sao_id', id);

      if (deleteError) {
        console.error('Error deleting existing SAO skills:', deleteError);
        throw deleteError;
      }

      // Create new SAO skills relationships
      const saoSkills = skills.map(skill => ({
        sao_id: id,
        skill_id: skill.id,
        category_name: skill.category_name || ''
      }));

      const { error: skillsError } = await supabase
        .from('sao_skills')
        .insert(saoSkills);

      if (skillsError) {
        console.error('Error updating SAO skills:', skillsError);
        throw skillsError;
      }

      // Reload SAOs to get the updated list
      await get().loadUserSAOs();
    } catch (error: any) {
      console.error('Error in updateSAO:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      set({ error: `Failed to update SAO: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteSAO: async (id: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Deleting SAO:', id);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) throw new Error('No authenticated user found');

      // Delete SAO skills first
      const { error: skillsError } = await supabase
        .from('sao_skills')
        .delete()
        .eq('sao_id', id);

      if (skillsError) {
        console.error('Error deleting SAO skills:', skillsError);
        throw skillsError;
      }

      // Then delete the SAO
      const { error: saoError } = await supabase
        .from('saos')
        .delete()
        .eq('id', id)
        .eq('eit_id', user.id);

      if (saoError) {
        console.error('Error deleting SAO:', saoError);
        throw saoError;
      }

      // Update local state
      set(state => ({
        saos: state.saos.filter(sao => sao.id !== id)
      }));
    } catch (error: any) {
      console.error('Error in deleteSAO:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      set({ error: `Failed to delete SAO: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadUserSAOs: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Loading user SAOs...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) throw new Error('No authenticated user found');

      console.log('Fetching SAOs for user:', user.id);
      const { data: saos, error: saosError } = await supabase
        .from('saos')
        .select(`
          *,
          sao_skills (
            skill_id,
            category_name
          )
        `)
        .eq('eit_id', user.id)
        .order('created_at', { ascending: false });

      if (saosError) {
        console.error('Error fetching SAOs:', saosError);
        throw saosError;
      }

      console.log('SAOs fetched:', saos?.length);

      // Transform the data to match our SAO interface
      const transformedSAOs = saos?.map(sao => ({
        ...sao,
        skills: sao.sao_skills.map((skill: any) => ({
          id: skill.skill_id,
          name: '', // Name not available directly, can be looked up if needed
          category_name: skill.category_name,
          status: 'not-started'
        }))
      })) || [];

      console.log('Transformed SAOs:', transformedSAOs.length);
      set({ saos: transformedSAOs });
    } catch (error: any) {
      console.error('Error in loadUserSAOs:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      set({ error: `Failed to load SAOs: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
})); 