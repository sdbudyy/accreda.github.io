-- Add position column to validators table
ALTER TABLE validators
ADD COLUMN position TEXT;

-- Update existing rows to have a default value
UPDATE validators
SET position = 'supervisor'
WHERE position IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE validators
ALTER COLUMN position SET NOT NULL; 