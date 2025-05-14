-- Drop existing table and related objects
DROP TABLE IF EXISTS professional_references CASCADE;
DROP TABLE IF EXISTS job_references CASCADE;

-- Create job_references table
CREATE TABLE job_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    description TEXT,
    reference_number INTEGER NOT NULL CHECK (reference_number IN (1, 2)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Ensure only one reference per number per job
    UNIQUE(job_id, reference_number)
);

-- Create indexes for faster lookups
CREATE INDEX idx_job_references_user_id ON job_references(user_id);
CREATE INDEX idx_job_references_job_id ON job_references(job_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_references_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_job_references_updated_at
    BEFORE UPDATE ON job_references
    FOR EACH ROW
    EXECUTE FUNCTION update_job_references_updated_at_column();

-- Enable Row Level Security
ALTER TABLE job_references ENABLE ROW LEVEL SECURITY;

-- Create policies for job_references table
CREATE POLICY "Users can only access their own job references"
    ON job_references
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 