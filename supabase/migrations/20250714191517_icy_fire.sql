/*
  # Create quarter_students junction table

  1. New Tables
    - `quarter_students`
      - `id` (uuid, primary key)
      - `quarter_id` (uuid, foreign key to quarters)
      - `student_id` (uuid, foreign key to students)
      - `enrollment_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `quarter_students` table
    - Add policy for public access (admin system)

  3. Relationships
    - Foreign key to quarters table
    - Foreign key to students table
    - Unique constraint on quarter_id + student_id
*/

CREATE TABLE IF NOT EXISTS quarter_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter_id uuid NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(quarter_id, student_id)
);

ALTER TABLE quarter_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to quarter_students"
  ON quarter_students
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public write access to quarter_students"
  ON quarter_students
  FOR ALL
  TO public
  USING (true);