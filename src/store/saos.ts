import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Skill } from './skills';
import { sendSAOScoreNotification, sendSAOValidationRequestNotification, sendSAOFeedbackNotification } from '../utils/notifications';
import { SAOAnnotation } from '../types/sao';

export interface SAOFeedback {
  id: string;
  sao_id: string;
  supervisor_id: string;
  feedback: string;
  status: 'pending' | 'submitted' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface SAO {
  id: string;
  title: string;
  situation: string;
  action: string;
  outcome: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'complete';
  skills: Skill[];
  feedback?: SAOFeedback[];
}

interface SAOsState {
  saos: SAO[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  createSAO: (title: string, situation: string, action: string, outcome: string, skills: Skill[], status: 'draft' | 'complete') => Promise<void>;
  updateSAO: (id: string, title: string, situation: string, action: string, outcome: string, skills: Skill[], status: 'draft' | 'complete') => Promise<void>;
  deleteSAO: (id: string) => Promise<void>;
  loadUserSAOs: (force?: boolean) => Promise<void>;
  clearState: () => void;
  requestFeedback: (saoId: string, supervisorId: string) => Promise<void>;
  submitFeedback: (saoId: string, feedback: string) => Promise<void>;
  resolveFeedback: (feedbackId: string) => Promise<void>;
  fetchAnnotations: (saoId: string, section?: string) => Promise<SAOAnnotation[]>;
  addAnnotation: (saoId: string, location: any, annotation: string, section?: string) => Promise<void>;
  fetchReplies: (annotationId: string) => Promise<any[]>;
  addReply: (annotationId: string, content: string) => Promise<void>;
  resolveAnnotation: (annotationId: string) => Promise<void>;
  deleteAnnotation: (annotationId: string) => Promise<void>;
  updateAnnotationStatus: (annotationId: string, status: string) => Promise<void>;
  fetchSAOVersions: (saoId: string) => Promise<any[]>;
}

export const useSAOsStore = create<SAOsState>((set, get) => ({
  saos: [],
  loading: false,
  error: null,
  lastFetched: null,

  clearState: () => set({
    saos: [],
    loading: false,
    error: null,
    lastFetched: null
  }),

  createSAO: async (title: string, situation: string, action: string, outcome: string, skills: Skill[], status: 'draft' | 'complete') => {
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

      console.log('Creating SAO:', { title, situation, action, outcome, skills, eit_id: user.id });

      // First, create the SAO with draft status
      const { data: sao, error: saoError } = await supabase
        .from('saos')
        .insert([
          {
            eit_id: user.id,
            title,
            situation,
            action,
            outcome,
            status
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

      // Save version history
      await supabase.from('sao_versions').insert({
        sao_id: sao.id,
        title: sao.title,
        situation: sao.situation,
        action: sao.action,
        outcome: sao.outcome
      });

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

  updateSAO: async (id: string, title: string, situation: string, action: string, outcome: string, skills: Skill[], status: 'draft' | 'complete') => {
    set({ loading: true, error: null });
    try {
      console.log('Updating SAO:', { id, title, situation, action, outcome, skills });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) throw new Error('No authenticated user found');

      // Update the SAO
      const { error: saoError } = await supabase
        .from('saos')
        .update({ title, situation, action, outcome, status })
        .eq('id', id)
        .eq('eit_id', user.id);

      if (saoError) {
        console.error('Error updating SAO:', saoError);
        throw saoError;
      }

      // Save version history
      await supabase.from('sao_versions').insert({
        sao_id: id,
        title,
        situation,
        action,
        outcome
      });

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

      // Update local state immediately
      set(state => ({
        saos: state.saos.map(sao => 
          sao.id === id 
            ? { ...sao, title, situation, action, outcome, status, skills }
            : sao
        )
      }));

      // Reload SAOs to ensure everything is in sync
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

  requestFeedback: async (saoId: string, supervisorId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');
      const { data: sao } = await supabase.from('saos').select('title').eq('id', saoId).single();
      // Remove any existing feedback for this SAO
      await supabase
        .from('sao_feedback')
        .delete()
        .eq('sao_id', saoId);
      // Update SAO status to 'in-review' when requesting feedback
      await supabase
        .from('saos')
        .update({ status: 'in-review' })
        .eq('id', saoId);
      await supabase
        .from('sao_feedback')
        .insert([
          {
            sao_id: saoId,
            supervisor_id: supervisorId,
            feedback: '',
            status: 'pending'
          }
        ]);
      // Get user name from profile tables
      let userName = user.email;
      const { data: supervisorProfile } = await supabase
        .from('supervisor_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (supervisorProfile && supervisorProfile.full_name) {
        userName = supervisorProfile.full_name;
      } else {
        const { data: eitProfile } = await supabase
          .from('eit_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (eitProfile && eitProfile.full_name) {
          userName = eitProfile.full_name;
        }
      }
      const saoTitle = sao?.title ?? 'SAO';
      await sendSAOValidationRequestNotification(supervisorId, userName ?? 'Unknown', saoTitle);
      // Reload SAOs to get updated feedback
      await get().loadUserSAOs(true);
    } catch (error: any) {
      set({ error: `Failed to request feedback: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  submitFeedback: async (saoId: string, feedback: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');
      const { data: sao } = await supabase.from('saos').select('eit_id, title').eq('id', saoId).single();
      await supabase
        .from('sao_feedback')
        .update({ feedback, status: 'submitted' })
        .eq('sao_id', saoId)
        .eq('supervisor_id', user.id);
      // Notify EIT
      if (sao?.eit_id) {
        await sendSAOFeedbackNotification(sao.eit_id, sao?.title || 'SAO');
      }
      // Reload SAOs to get updated feedback
      await get().loadUserSAOs(true);
    } catch (error: any) {
      set({ error: `Failed to submit feedback: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resolveFeedback: async (feedbackId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sao_feedback')
        .update({ status: 'resolved' })
        .eq('id', feedbackId);

      if (error) throw error;

      // Reload SAOs to get updated feedback
      await get().loadUserSAOs(true);
    } catch (error: any) {
      set({ error: `Failed to resolve feedback: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadUserSAOs: async (force = false) => {
    const now = Date.now();
    const lastFetched = get().lastFetched;
    if (!force && lastFetched && now - lastFetched < 5 * 60 * 1000) {
      return;
    }
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
          ),
          sao_feedback:sao_feedback_sao_id_fkey (
            id,
            supervisor_id,
            feedback,
            status,
            created_at,
            updated_at
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
          name: '',
          category_name: skill.category_name,
          status: 'not-started'
        })),
        feedback: sao.sao_feedback || []
      })) || [];

      console.log('Transformed SAOs:', transformedSAOs.length);
      set({ saos: transformedSAOs, lastFetched: now });
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
  },

  fetchAnnotations: async (saoId: string, section?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('sao_annotation')
        .select('*')
        .eq('sao_id', saoId)
        .order('created_at', { ascending: true });
      if (section) {
        query = query.eq('status', section);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as SAOAnnotation[];
    } catch (error: any) {
      set({ error: `Failed to fetch annotations: ${error.message || 'Unknown error'}` });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  addAnnotation: async (saoId: string, location: any, annotation: string, section?: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user found');
      // Get author_name from profile tables
      let author_name = user.email || 'Unknown';
      const { data: supervisorProfile } = await supabase
        .from('supervisor_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (supervisorProfile && supervisorProfile.full_name) {
        author_name = supervisorProfile.full_name;
      } else {
        const { data: eitProfile } = await supabase
          .from('eit_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (eitProfile && eitProfile.full_name) {
          author_name = eitProfile.full_name;
        }
      }
      const { error } = await supabase
        .from('sao_annotation')
        .insert([
          {
            sao_id: saoId,
            supervisor_id: user.id,
            created_by: user.id,
            author_name,
            author_role: 'supervisor',
            location,
            annotation,
            status: section || 'active',
          }
        ]);
      if (error) throw error;
      // Optionally, refresh annotations in state if you keep them there
    } catch (error: any) {
      set({ error: `Failed to add annotation: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchReplies: async (annotationId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sao_annotation_replies')
        .select('*')
        .eq('annotation_id', annotationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      set({ error: `Failed to fetch replies: ${error.message || 'Unknown error'}` });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  addReply: async (annotationId: string, content: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user found');
      const { error } = await supabase
        .from('sao_annotation_replies')
        .insert([
          {
            annotation_id: annotationId,
            content,
            author_id: user.id,
          }
        ]);
      if (error) throw error;
    } catch (error: any) {
      set({ error: `Failed to add reply: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resolveAnnotation: async (annotationId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sao_annotation')
        .update({ resolved: true })
        .eq('id', annotationId);
      if (error) throw error;
    } catch (error: any) {
      set({ error: `Failed to resolve annotation: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteAnnotation: async (annotationId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sao_annotation')
        .delete()
        .eq('id', annotationId);
      if (error) throw error;
    } catch (error: any) {
      set({ error: `Failed to delete annotation: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateAnnotationStatus: async (annotationId: string, status: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sao_annotation')
        .update({ status })
        .eq('id', annotationId);
      if (error) throw error;
    } catch (error: any) {
      set({ error: `Failed to update annotation status: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchSAOVersions: async (saoId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sao_versions')
        .select('*')
        .eq('sao_id', saoId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error: any) {
      set({ error: `Failed to fetch SAO versions: ${error.message || 'Unknown error'}` });
      return [];
    } finally {
      set({ loading: false });
    }
  }
})); 