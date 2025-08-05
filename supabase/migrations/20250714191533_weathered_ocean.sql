/*
  # Create calendar_notes table

  1. New Tables
    - `calendar_notes`
      - `id` (uuid, primary key)
      - `quarter_id` (uuid, foreign key to quarters)
      - `date` (date)
      - `title` (text)
      - `description` (text)
      - `type` (enum: excuse, holiday, reminder)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `calendar_notes` table
    - Add policy for public access (admin system)

  3. Relationships
    - Foreign key to quarters table
*/

CREATE TABLE IF NOT EXISTS calendar_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter_id uuid NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
  date date NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('excuse', 'holiday', 'reminder')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to calendar_notes"
  ON calendar_notes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public write access to calendar_notes"
  ON calendar_notes
  FOR ALL
  TO public
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_notes_quarter_date ON calendar_notes(quarter_id, date);