import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface LocalDocument {
  id: string;
  name: string;
  content: string;
  category: string;
  size: string;
  created_at: string;
  attachments?: Attachment[];
}

interface LocalDocumentState {
  documents: LocalDocument[];
  loading: boolean;
  error: string | null;
  addDocument: (name: string, content: string, category: string) => void;
  getDocuments: () => LocalDocument[];
  getDocument: (id: string) => LocalDocument | undefined;
  updateDocument: (id: string, updates: Partial<LocalDocument>) => void;
  deleteDocument: (id: string) => void;
}

export const useLocalDocumentStore = create<LocalDocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      loading: false,
      error: null,

      addDocument: (name: string, content: string, category: string) => {
        const newDocument: LocalDocument = {
          id: Date.now().toString(), // Use timestamp as ID
          name,
          content,
          category,
          size: `${(content.length / 1024).toFixed(1)} KB`,
          created_at: new Date().toISOString(),
          attachments: [],
        };

        set(state => ({
          documents: [newDocument, ...state.documents]
        }));
      },

      getDocuments: () => {
        return get().documents;
      },

      getDocument: (id: string) => {
        return get().documents.find(doc => doc.id === id);
      },

      updateDocument: (id: string, updates: Partial<LocalDocument>) => {
        set(state => ({
          documents: state.documents.map(doc => {
            if (doc.id === id) {
              const updatedDoc = { ...doc, ...updates };
              // Update size if content changed
              if (updates.content) {
                updatedDoc.size = `${(updates.content.length / 1024).toFixed(1)} KB`;
              }
              return updatedDoc;
            }
            return doc;
          })
        }));
      },

      deleteDocument: (id: string) => {
        set(state => ({
          documents: state.documents.filter(doc => doc.id !== id)
        }));
      },
    }),
    {
      name: 'local-documents-storage', // unique name for localStorage
    }
  )
); 