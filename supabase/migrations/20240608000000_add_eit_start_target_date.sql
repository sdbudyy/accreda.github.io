-- Add start_date and target_date to eit_profiles for EIT progress tracking
ALTER TABLE eit_profiles
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS target_date DATE; 