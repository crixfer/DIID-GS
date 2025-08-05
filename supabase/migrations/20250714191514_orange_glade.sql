/*
  # Create students table

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `student_id` (text, unique)
      - `email` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `students` table
    - Add policy for public access (admin system)
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  student_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to students"
  ON students
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public write access to students"
  ON students
  FOR ALL
  TO public
  USING (true);