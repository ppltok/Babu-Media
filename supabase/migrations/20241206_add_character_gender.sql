-- Add gender column to characters table
-- Values: 'male', 'female', or NULL (for "I don't care" option where we use smart defaults)

ALTER TABLE characters ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN characters.gender IS 'Character gender for proper pronoun usage in stories. NULL means use smart defaults based on animal type.';
