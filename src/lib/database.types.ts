export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          eit_id: string
          title: string
          content: string
          type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          eit_id: string
          title: string
          content: string
          type: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          eit_id?: string
          title?: string
          content?: string
          type?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      saos: {
        Row: {
          id: string
          eit_id: string
          title: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          eit_id: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          eit_id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          eit_id: string
          name: string
          category: string
          status: string
          completed_at: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          eit_id: string
          name: string
          category: string
          status?: string
          completed_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          eit_id?: string
          name?: string
          category?: string
          status?: string
          completed_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          eit_id: string
          title: string
          company: string
          location: string
          start_date: string
          end_date: string | null
          description: string | null
          skills: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          eit_id: string
          title: string
          company: string
          location: string
          start_date: string
          end_date?: string | null
          description?: string | null
          skills?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          eit_id?: string
          title?: string
          company?: string
          location?: string
          start_date?: string
          end_date?: string | null
          description?: string | null
          skills?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      job_references: {
        Row: {
          id: string
          eit_id: string
          job_id: string
          full_name: string
          email: string
          description: string | null
          reference_number: number
          validation_status: 'pending' | 'validated' | 'rejected'
          validator_id: string | null
          validated_at: string | null
          validation_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          eit_id: string
          job_id: string
          full_name: string
          email: string
          description?: string | null
          reference_number: number
          validation_status?: 'pending' | 'validated' | 'rejected'
          validator_id?: string | null
          validated_at?: string | null
          validation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          eit_id?: string
          job_id?: string
          full_name?: string
          email?: string
          description?: string | null
          reference_number?: number
          validation_status?: 'pending' | 'validated' | 'rejected'
          validator_id?: string | null
          validated_at?: string | null
          validation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      validators: {
        Row: {
          id: string
          eit_id: string
          skill_id: string
          full_name: string
          email: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          eit_id: string
          skill_id: string
          full_name: string
          email: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          eit_id?: string
          skill_id?: string
          full_name?: string
          email?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_all: {
        Args: {
          search_query: string
          eit_id: string
        }
        Returns: {
          id: string
          type: string
          title: string
          description: string | null
          category: string | null
          company: string | null
          location: string | null
          email: string | null
          reference_number: number | null
          skill_name: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }

  eit_connections: {
    Row: {
      id: string
      eit_id: string
      connected_eit_id: string
      status: 'pending' | 'accepted' | 'rejected'
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      eit_id: string
      connected_eit_id: string
      status: 'pending' | 'accepted' | 'rejected'
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      eit_id?: string
      connected_eit_id?: string
      status?: 'pending' | 'accepted' | 'rejected'
      created_at?: string
      updated_at?: string
    }
  }
} 