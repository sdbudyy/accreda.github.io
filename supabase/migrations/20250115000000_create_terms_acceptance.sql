-- Create terms_acceptance table to track when users accept terms and conditions
CREATE TABLE IF NOT EXISTS terms_acceptance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    terms_version VARCHAR(50) NOT NULL DEFAULT '1.0',
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_terms_acceptance_user_id ON terms_acceptance(user_id);

-- Create index for terms version lookups
CREATE INDEX IF NOT EXISTS idx_terms_acceptance_version ON terms_acceptance(terms_version);

-- Create unique constraint to prevent duplicate acceptances for the same user and version
CREATE UNIQUE INDEX IF NOT EXISTS idx_terms_acceptance_unique_user_version ON terms_acceptance(user_id, terms_version);

-- Enable Row Level Security
ALTER TABLE terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own terms acceptance records
CREATE POLICY "Users can view their own terms acceptance" ON terms_acceptance
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own terms acceptance records
CREATE POLICY "Users can insert their own terms acceptance" ON terms_acceptance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own terms acceptance records
CREATE POLICY "Users can update their own terms acceptance" ON terms_acceptance
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_terms_acceptance_updated_at 
    BEFORE UPDATE ON terms_acceptance 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE terms_acceptance IS 'Tracks when users accept terms and conditions with versioning support';
COMMENT ON COLUMN terms_acceptance.user_id IS 'Reference to the user who accepted the terms';
COMMENT ON COLUMN terms_acceptance.terms_version IS 'Version of the terms and conditions that were accepted';
COMMENT ON COLUMN terms_acceptance.accepted_at IS 'Timestamp when the user accepted the terms';
COMMENT ON COLUMN terms_acceptance.ip_address IS 'IP address of the user when they accepted the terms';
COMMENT ON COLUMN terms_acceptance.user_agent IS 'User agent string when the user accepted the terms'; 