/*
  # Create teachers table and update existing tables

  1. New Tables
    - `teachers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `created_at` (timestamp)

  2. Table Updates
    - Add `teacher_id` to quarters table
    - Add `teacher_id` to students table (through quarter_students)

  3. Security
    - Enable RLS on teachers table
    - Update policies for teacher-specific data access
    - Teachers can only see their own data

  4. Authentication
    - Uses Supabase Auth for secure login
    - Email/password authentication
*/

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Add teacher_id to quarters table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quarters' AND column_name = 'teacher_id'
  ) THEN
    ALTER TABLE quarters ADD COLUMN teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Teachers can only see their own data
CREATE POLICY "Teachers can read own data"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Teachers can update own data"
  ON teachers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Update quarters policies
DROP POLICY IF EXISTS "Allow public read access to quarters" ON quarters;
DROP POLICY IF EXISTS "Allow public write access to quarters" ON quarters;

CREATE POLICY "Teachers can read own quarters"
  ON quarters
  FOR SELECT
  TO authenticated
  USING (teacher_id IN (SELECT id FROM teachers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Teachers can manage own quarters"
  ON quarters
  FOR ALL
  TO authenticated
  USING (teacher_id IN (SELECT id FROM teachers WHERE auth_user_id = auth.uid()));

-- Update quarter_students policies
DROP POLICY IF EXISTS "Allow public read access to quarter_students" ON quarter_students;
DROP POLICY IF EXISTS "Allow public write access to quarter_students" ON quarter_students;

CREATE POLICY "Teachers can read own quarter students"
  ON quarter_students
  FOR SELECT
  TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Teachers can manage own quarter students"
  ON quarter_students
  FOR ALL
  TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

-- Update students policies
DROP POLICY IF EXISTS "Allow public read access to students" ON students;
DROP POLICY IF EXISTS "Allow public write access to students" ON students;

CREATE POLICY "Teachers can read students in their quarters"
  ON students
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT student_id FROM quarter_students WHERE quarter_id IN (
      SELECT id FROM quarters WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Teachers can manage students in their quarters"
  ON students
  FOR ALL
  TO authenticated
  USING (id IN (
    SELECT student_id FROM quarter_students WHERE quarter_id IN (
      SELECT id FROM quarters WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  ));

-- Update student_grades policies
DROP POLICY IF EXISTS "Allow public read access to student_grades" ON student_grades;
DROP POLICY IF EXISTS "Allow public write access to student_grades" ON student_grades;

CREATE POLICY "Teachers can read grades for their students"
  ON student_grades
  FOR SELECT
  TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Teachers can manage grades for their students"
  ON student_grades
  FOR ALL
  TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

-- Update attendance_records policies
DROP POLICY IF EXISTS "Allow public read access to attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "Allow public write access to attendance_records" ON attendance_records;

CREATE POLICY "Teachers can read attendance for their students"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Teachers can manage attendance for their students"
  ON attendance_records
  FOR ALL
  TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

-- Update calendar_notes policies
DROP POLICY IF EXISTS "Allow public read access to calendar_notes" ON calendar_notes;
DROP POLICY IF EXISTS "Allow public write access to calendar_notes" ON calendar_notes;

CREATE POLICY "Teachers can read calendar notes for their quarters"
  ON calendar_notes
  FOR SELECT
  TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Teachers can manage calendar notes for their quarters"
  ON calendar_notes
  FOR ALL
  TO authenticated
  USING (quarter_id IN (
    SELECT id FROM quarters WHERE teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  ));