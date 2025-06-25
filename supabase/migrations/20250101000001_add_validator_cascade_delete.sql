-- Add foreign key constraint to skill_validations table to automatically delete
-- validation records when a validator is deleted
-- This ensures data integrity and prevents orphaned validation records

-- First, let's check if skill_validations table exists and add the constraint
DO $$
BEGIN
    -- Check if skill_validations table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'skill_validations') THEN
        -- Add foreign key constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'skill_validations_validator_id_fkey'
        ) THEN
            -- Add the foreign key constraint with CASCADE DELETE
            ALTER TABLE skill_validations 
            ADD CONSTRAINT skill_validations_validator_id_fkey 
            FOREIGN KEY (validator_id) 
            REFERENCES validators(id) 
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Add index for better performance on validator_id lookups
CREATE INDEX IF NOT EXISTS idx_skill_validations_validator_id 
ON skill_validations(validator_id);

-- Add index for better performance on eit_id and skill_id lookups
CREATE INDEX IF NOT EXISTS idx_skill_validations_eit_skill 
ON skill_validations(eit_id, skill_id); 