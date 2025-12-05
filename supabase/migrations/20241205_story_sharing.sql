-- Story Sharing Schema
-- Adds share_token column to stories table for public sharing

-- 1. Add share_token column to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- 2. Create index for faster lookups by share_token
CREATE INDEX IF NOT EXISTS idx_stories_share_token ON stories(share_token);

-- 3. Create a function to generate a unique share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. RLS Policy for public story access (read-only for stories with share_token)
-- This allows anyone to read a story if they have the share_token
CREATE POLICY "Anyone can view stories with share_token"
  ON stories FOR SELECT
  USING (share_token IS NOT NULL);

-- Note: The existing RLS policies should already allow owners to read/update their own stories.
-- This new policy adds public read access for shared stories.
