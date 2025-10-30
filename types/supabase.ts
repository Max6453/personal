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
      tickets: {
        Row: {
          id: string
          created_at: string
          email: string
          subject: string
          description: string
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          ticket_number: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          subject: string
          description: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          ticket_number?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          subject?: string
          description?: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          ticket_number?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}