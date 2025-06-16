-- Add position column to validators table
ALTER TABLE validators
ADD COLUMN position TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN validators.position IS 'The position or role of the validator in their organization';

-- Backfill position with supervisor data
UPDATE validators v
SET position = sp.position
FROM supervisor_profiles sp
WHERE v.email = sp.email
AND sp.position IS NOT NULL; 