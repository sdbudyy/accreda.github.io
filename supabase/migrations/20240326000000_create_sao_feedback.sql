-- Create sao_feedback table
CREATE TABLE IF NOT EXISTS sao_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sao_id UUID REFERENCES saos(id) ON DELETE CASCADE,
    supervisor_id UUID REFERENCES supervisor_profiles(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'submitted', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE sao_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sao_feedback
CREATE POLICY "Supervisors can manage their feedback"
    ON sao_feedback FOR ALL
    USING (auth.uid() = supervisor_id);

CREATE POLICY "EITs can view feedback on their SAOs"
    ON sao_feedback FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM saos
            WHERE saos.id = sao_feedback.sao_id
            AND saos.eit_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at_sao_feedback
    BEFORE UPDATE ON sao_feedback
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sao_feedback_sao_id 
    ON sao_feedback(sao_id);
CREATE INDEX IF NOT EXISTS idx_sao_feedback_supervisor_id 
    ON sao_feedback(supervisor_id); 