/*
  # Create student_grades table

  1. New Tables
    - `student_grades`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `quarter_id` (uuid, foreign key to quarters)
      - `grades` (jsonb, stores all grade components)
      - `total_score` (numeric)
      - `letter_grade` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `student_grades` table
    - Add policy for public access (admin system)

  3. Relationships
    - Foreign key to students table
    - Foreign key to quarters table
    - Unique constraint on student_id + quarter_id
*/

CREATE TABLE IF NOT EXISTS student_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  quarter_id uuid NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
  grades jsonb NOT NULL DEFAULT '{}',
  total_score numeric(5,2) NOT NULL DEFAULT 0,
  letter_grade text NOT NULL DEFAULT 'F',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, quarter_id)
);

ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to student_grades"
  ON student_grades
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public write access to student_grades"
  ON student_grades
  FOR ALL
  TO public
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_student_grades_quarter ON student_grades(quarter_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_student ON student_grades(student_id);