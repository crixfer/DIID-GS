import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client even if env vars are missing - we'll handle this in the UI
const defaultUrl = 'https://placeholder.supabase.co';
const defaultKey = 'placeholder-key';

export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey
);

// Database types
export interface Database {
  public: {
    Tables: {
      quarters: {
        Row: {
          id: string;
          teacher_id: string;
          name: string;
          start_date: string;
          end_date: string;
          status: 'active' | 'completed' | 'upcoming';
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          name: string;
          start_date: string;
          end_date: string;
          status?: 'active' | 'completed' | 'upcoming';
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          status?: 'active' | 'completed' | 'upcoming';
          created_at?: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          auth_user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          student_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          student_id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          student_id?: string;
          email?: string;
          created_at?: string;
        };
      };
      quarter_students: {
        Row: {
          id: string;
          quarter_id: string;
          student_id: string;
          enrollment_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          quarter_id: string;
          student_id: string;
          enrollment_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          quarter_id?: string;
          student_id?: string;
          enrollment_date?: string;
          created_at?: string;
        };
      };
      student_grades: {
        Row: {
          id: string;
          student_id: string;
          quarter_id: string;
          grades: any;
          total_score: number;
          letter_grade: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          quarter_id: string;
          grades: any;
          total_score: number;
          letter_grade: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          quarter_id?: string;
          grades?: any;
          total_score?: number;
          letter_grade?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          student_id: string;
          quarter_id: string;
          date: string;
          status: 'present' | 'absent' | 'excused' | 'late';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          quarter_id: string;
          date: string;
          status: 'present' | 'absent' | 'excused' | 'late';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          quarter_id?: string;
          date?: string;
          status?: 'present' | 'absent' | 'excused' | 'late';
          notes?: string | null;
          created_at?: string;
        };
      };
      calendar_notes: {
        Row: {
          id: string;
          quarter_id: string;
          date: string;
          title: string;
          description: string;
          type: 'excuse' | 'holiday' | 'reminder';
          created_at: string;
        };
        Insert: {
          id?: string;
          quarter_id: string;
          date: string;
          title: string;
          description: string;
          type: 'excuse' | 'holiday' | 'reminder';
          created_at?: string;
        };
        Update: {
          id?: string;
          quarter_id?: string;
          date?: string;
          title?: string;
          description?: string;
          type?: 'excuse' | 'holiday' | 'reminder';
          created_at?: string;
        };
      };
    };
  };
}