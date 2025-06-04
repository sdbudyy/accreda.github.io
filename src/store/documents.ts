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
  category?: string;
  supervisor_id?: string;
}

interface DocumentsState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  clearState: () => void;
  createDocument: (title: string, content: string, type: Document['type'], file?: File, category?: string) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  loadUserDocuments: () => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  loading: false,
  error: null,
  lastFetched: null,

  clearState: () => set({
    documents: [],
    loading: false,
    error: null,
    lastFetched: null
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
      const { data: profile } = await supabase
        .from('eit_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      await supabase
        .from('eit_profiles')
        .upsert({
          id: user.id,
          full_name: profile?.full_name || '',
          email: user.email || ''
        });

      // Get file type and size if file is provided
      const file_type = file?.type || 'text/plain';
      const file_size = file?.size || content.length;
      const safeCategory = category || 'Uncategorized';

      // For PDF and DOC files, store the file content as base64
      let processedContent = content;
      if (file && (file_type === 'application/pdf' || 
          file_type === 'application/msword' || 
          file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        const arrayBuffer = await file.arrayBuffer();
        processedContent = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      }

      console.log('Creating document:', { title, type, eit_id: user.id, file_type, file_size, category: safeCategory });

      const { data: document, error: createError } = await supabase
        .from('documents')
        .insert([
          {
            eit_id: user.id,
            title,
            content: processedContent,
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

      if (createError) throw createError;

      set(state => ({
        documents: [...state.documents, document],
        loading: false
      }));
    } catch (error) {
      console.error('Error creating document:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create document', loading: false });
      throw error;
    }
  },

  updateDocument: async (id: string, updates: Partial<Document>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        documents: state.documents.map(doc =>
          doc.id === id ? { ...doc, ...updates } : doc
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating document:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update document', loading: false });
      throw error;
    }
  },

  deleteDocument: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        documents: state.documents.filter(doc => doc.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting document:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete document', loading: false });
      throw error;
    }
  },

  loadUserDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user found');

      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('eit_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Process base64 content for PDF and DOC files
      const processedDocuments = documents.map(doc => {
        if (doc.file_type && (
          doc.file_type === 'application/pdf' ||
          doc.file_type === 'application/msword' ||
          doc.file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )) {
          try {
            const binaryString = atob(doc.content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            doc.content = bytes.buffer;
          } catch (error) {
            console.error('Error processing document content:', error);
          }
        }
        return doc;
      });

      set({
        documents: processedDocuments,
        loading: false,
        lastFetched: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading documents:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load documents', loading: false });
    }
  }
})); 