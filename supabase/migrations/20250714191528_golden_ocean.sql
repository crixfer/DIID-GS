/*
  # Create attendance_records table

  1. New Tables
    - `attendance_records`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `quarter_id` (uuid, foreign key to quarters)
      - `date` (date)
      - `status` (enum: present, absent, excused, late)
      - `notes` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `attendance_records` table
    - Add policy for public access (admin system)

  3. Relationships
    - Foreign key to students table
    - Foreign key to quarters table
    - Unique constraint on student_id + quarter_id + date
*/

CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  quarter_id uuid NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'late')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, quarter_id, date)
);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to attendance_records"
  ON attendance_records
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public write access to attendance_records"
  ON attendance_records
  FOR ALL
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_quarter_date ON attendance_records(quarter_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);