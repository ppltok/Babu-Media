-- Fix Public Story Access for Anonymous Users
-- This migration ensures that stories with share_token can be accessed by anyone,
-- including users who are not logged in (anonymous access via Supabase anon key)

-- 1. First, ensure RLS is enabled on the stories table
-- (This is safe to run even if RLS is already enabled)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- 2. Drop the existing public access policy if it exists
-- (This ensures we can recreate it with the correct configuration)
DROP POLICY IF EXISTS "Anyone can view stories with share_token" ON stories;

-- 3. Create a new policy that allows anonymous access to shared stories
-- The key is using a simple check that works for both authenticated and anonymous users
-- When share_token IS NOT NULL, anyone can read that story
CREATE POLICY "Anyone can view stories with share_token"
  ON stories FOR SELECT
  TO public  -- This explicitly grants access to the public role (includes anon)
  USING (share_token IS NOT NULL);

-- 4. Also ensure characters table allows reading for shared stories
-- Since PublicStoryReader joins with characters table, we need access there too
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the policy for public character access
DROP POLICY IF EXISTS "Anyone can view characters for shared stories" ON characters;

-- Allow reading characters that are referenced by a story with a share_token
-- Note: stories.character_id references characters.id
CREATE POLICY "Anyone can view characters for shared stories"
  ON characters FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.character_id = characters.id
      AND stories.share_token IS NOT NULL
    )
  );

-- Note: The TO public clause explicitly grants access to both the 'anon' and 'authenticated' roles
-- This ensures that users without a session (anonymous) can still read shared stories
