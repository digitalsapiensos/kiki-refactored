/**
 * Database types generated from Supabase schema
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/lib/database.types.ts
 */

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
      kiki_users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'superadmin'
          plan: 'free' | 'pro' | 'enterprise'
          project_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'superadmin'
          plan?: 'free' | 'pro' | 'enterprise'
          project_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'superadmin'
          plan?: 'free' | 'pro' | 'enterprise'
          project_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      kiki_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          current_phase: number
          phase_data: Json
          status: 'active' | 'archived' | 'deleted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          current_phase?: number
          phase_data?: Json
          status?: 'active' | 'archived' | 'deleted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          current_phase?: number
          phase_data?: Json
          status?: 'active' | 'archived' | 'deleted'
          created_at?: string
          updated_at?: string
        }
      }
      kiki_chat_messages: {
        Row: {
          id: string
          project_id: string
          phase: number
          assistant_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          phase: number
          assistant_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          phase?: number
          assistant_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json
          created_at?: string
        }
      }
      kiki_documents: {
        Row: {
          id: string
          project_id: string
          name: string
          content: string | null
          type: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          content?: string | null
          type: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          content?: string | null
          type?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      kiki_llm_configs: {
        Row: {
          id: string
          provider: string
          api_key_encrypted: string | null
          models: Json
          is_active: boolean
          default_for_phases: number[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider: string
          api_key_encrypted?: string | null
          models?: Json
          is_active?: boolean
          default_for_phases?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider?: string
          api_key_encrypted?: string | null
          models?: Json
          is_active?: boolean
          default_for_phases?: number[]
          created_at?: string
          updated_at?: string
        }
      }
      kiki_analytics: {
        Row: {
          id: string
          user_id: string | null
          project_id: string | null
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          project_id?: string | null
          event_type: string
          event_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          project_id?: string | null
          event_type?: string
          event_data?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}