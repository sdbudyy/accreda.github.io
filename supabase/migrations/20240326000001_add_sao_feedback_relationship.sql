-- Add foreign key relationship between saos and sao_feedback
ALTER TABLE sao_feedback
ADD CONSTRAINT fk_sao_feedback_sao
FOREIGN KEY (sao_id)
REFERENCES saos(id)
ON DELETE CASCADE;

-- Add foreign key relationship between supervisor_profiles and sao_feedback
ALTER TABLE sao_feedback
ADD CONSTRAINT fk_sao_feedback_supervisor
FOREIGN KEY (supervisor_id)
REFERENCES supervisor_profiles(id)
ON DELETE CASCADE;

-- Create index for the foreign key relationships
CREATE INDEX IF NOT EXISTS idx_sao_feedback_sao_id_fk 
ON sao_feedback(sao_id);
CREATE INDEX IF NOT EXISTS idx_sao_feedback_supervisor_id_fk 
ON sao_feedback(supervisor_id); 