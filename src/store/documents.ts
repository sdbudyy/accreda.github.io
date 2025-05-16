import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  type: 'essay' | 'saos' | 'other';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  feedback?: string;
  word_count: number;
  file_type?: string;
  file_size?: number;
}

interface DocumentsState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  createDocument: (title: string, content: string, type: Document['type'], file?: File, category?: string) => Promise<void>;
  updateDocument: (id: string, title: string, content: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  loadUserDocuments: () => Promise<void>;
  clearState: () => void;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  loading: false,
  error: null,

  clearState: () => set({
    documents: [],
    loading: false,
    error: null
  }),

  createDocument: async (title: string, content: string, type: Document['type'], file?: File, category?: string) => {
    set({ loading: true, error: null });
    try {
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

      // Get file type and size if file is provided
      const file_type = file?.type || 'text/plain';
      const file_size = file?.size || content.length;
      const safeCategory = category || 'Uncategorized';

      console.log('Creating document:', { title, type, eit_id: user.id, file_type, file_size, category: safeCategory });

      const { data: document, error: createError } = await supabase
        .from('documents')
        .insert([
          {
            eit_id: user.id,
            title,
            content,
            type,
            status: 'draft',
            word_count: content.split(/\s+/).length,
            file_type,
            file_size,
            category: safeCategory
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating document:', {
          error: createError,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        });
        throw createError;
      }

      console.log('Document created successfully:', document);

      // Update local state
      set(state => ({
        documents: [document, ...state.documents]
      }));
    } catch (error: any) {
      console.error('Error in createDocument:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      set({ error: `Failed to create document: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateDocument: async (id: string, title: string, content: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Updating document:', { id, title });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) throw new Error('No authenticated user found');

      const { error: updateError } = await supabase
        .from('documents')
        .update({
          title,
          content,
          word_count: content.split(/\s+/).length,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('eit_id', user.id);

      if (updateError) {
        console.error('Error updating document:', {
          error: updateError,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        });
        throw updateError;
      }

      // Update local state
      set(state => ({
        documents: state.documents.map(doc =>
          doc.id === id
            ? {
                ...doc,
                title,
                content,
                word_count: content.split(/\s+/).length,
                updated_at: new Date().toISOString()
              }
            : doc
        )
      }));
    } catch (error: any) {
      console.error('Error in updateDocument:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      set({ error: `Failed to update document: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteDocument: async (id: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Deleting document:', id);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) throw new Error('No authenticated user found');

      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('eit_id', user.id);

      if (deleteError) {
        console.error('Error deleting document:', {
          error: deleteError,
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint
        });
        throw deleteError;
      }

      // Update local state
      set(state => ({
        documents: state.documents.filter(doc => doc.id !== id)
      }));
    } catch (error: any) {
      console.error('Error in deleteDocument:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      set({ error: `Failed to delete document: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadUserDocuments: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Loading user documents...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) throw new Error('No authenticated user found');

      console.log('Fetching documents for user:', user.id);
      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('eit_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching documents:', {
          error: fetchError,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint
        });
        throw fetchError;
      }

      console.log('Documents fetched:', documents?.length);
      set({ documents: documents || [] });
    } catch (error: any) {
      console.error('Error in loadUserDocuments:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      set({ error: `Failed to load documents: ${error.message || 'Unknown error'}` });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
})); 