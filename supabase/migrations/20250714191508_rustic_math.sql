/*
  # Create quarters table

  1. New Tables
    - `quarters`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (enum: active, completed, upcoming)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `quarters` table
    - Add policy for public read access (since this is an admin system)
    - Add policy for public write access (since this is an admin system)
*/

CREATE TABLE IF NOT EXISTS quarters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'completed', 'upcoming')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to quarters"
  ON quarters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public write access to quarters"
  ON quarters
  FOR ALL
  TO public
  USING (true);