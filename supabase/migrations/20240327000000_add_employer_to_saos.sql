-- Add employer field to saos table
ALTER TABLE saos
ADD COLUMN employer TEXT;

-- Update existing rows to have a default value
UPDATE saos
SET employer = 'Not specified'
WHERE employer IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE saos
ALTER COLUMN employer SET NOT NULL; 