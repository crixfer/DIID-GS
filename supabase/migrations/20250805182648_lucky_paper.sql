/*
  # Complete DIID GS Database Schema Setup

  1. New Tables
    - `teachers` - Teacher profiles linked to auth users
    - `quarters` - Academic quarters/semesters
    - `students` - Student information
    - `quarter_students` - Junction table for quarter enrollment
    - `student_grades` - Grade records with JSONB structure
    - `attendance_records` - Daily attendance tracking
    - `calendar_notes` - Calendar events and notes

  2. Security
    - Enable RLS on all tables
    - Add policies for teacher data isolation
    - Ensure teachers can only access their own data

  3. Indexes
    - Performance indexes for common queries
    - Foreign key relationships
*/

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quarters table
CREATE TABLE IF NOT EXISTS quarters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  name text UNIQUE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'completed', 'upcoming')),
  created_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  student_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quarter_students junction table
CREATE TABLE IF NOT EXISTS quarter_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter_id uuid REFERENCES quarters(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(quarter_id, student_id)
);

-- Create student_grades table
CREATE TABLE IF NOT EXISTS student_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  quarter_id uuid REFERENCES quarters(id) ON DELETE CASCADE,
  grades jsonb NOT NULL DEFAULT '{}',
  total_score numeric(5,2) NOT NULL DEFAULT 0,
  letter_grade text NOT NULL DEFAULT 'F',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, quarter_id)
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  quarter_id uuid REFERENCES quarters(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'late')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, quarter_id, date)
);

-- Create calendar_notes table
CREATE TABLE IF NOT EXISTS calendar_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter_id uuid REFERENCES quarters(id) ON DELETE CASCADE,
  date date NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('excuse', 'holiday', 'reminder')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teachers_auth_user ON teachers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_quarters_teacher ON quarters(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quarter_students_quarter ON quarter_students(quarter_id);
CREATE INDEX IF NOT EXISTS idx_quarter_students_student ON quarter_students(student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_student ON student_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_quarter ON student_grades(quarter_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_quarter_date ON attendance_records(quarter_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_notes_quarter_date ON calendar_notes(quarter_id, date);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarter_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;

-- Teachers policies
CREATE POLICY "Teachers can read own data" ON teachers
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Teachers can update own data" ON teachers
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id);

-- Quarters policies
CREATE POLICY "Teachers can read own quarters" ON quarters
  FOR SELECT TO authenticated
  USING (teacher_id IN (
    SELECT id FROM teachers WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Teachers can manage own quarters" ON quarters
  FOR ALL TO authenticated
  USING (teacher_id IN (
    SELECT id FROM teachers WHERE auth_user_id = auth.uid()
  ));

-- Students policies
CREATE POLICY "Teachers can read students in their quarters" ON students
  FOR SELECT TO authenticated
  USING (id IN (
    SELECT student_id FROM quarter_students
    WHERE quarter_id IN (
      SELECT id FROM quarters
      WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Teachers can manage students in their quarters" ON students
  FOR ALL TO authenticated
  USING (id IN (
    SELECT student_id FROM quarter_students
    WHERE quarter_id IN (
      SELECT id FROM quarters
      WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  ));

-- Quarter students policies
CREATE POLICY "Teachers can read own quarter students" ON quarter_students
  FOR SELECT TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Teachers can manage own quarter students" ON quarter_students
  FOR ALL TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

-- Student grades policies
CREATE POLICY "Teachers can read grades for their students" ON student_grades
  FOR SELECT TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Teachers can manage grades for their students" ON student_grades
  FOR ALL TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

-- Attendance records policies
CREATE POLICY "Teachers can read attendance for their students" ON attendance_records
  FOR SELECT TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Teachers can manage attendance for their students" ON attendance_records
  FOR ALL TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

-- Calendar notes policies
CREATE POLICY "Teachers can read calendar notes for their quarters" ON calendar_notes
  FOR SELECT TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Teachers can manage calendar notes for their quarters" ON calendar_notes
  FOR ALL TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));