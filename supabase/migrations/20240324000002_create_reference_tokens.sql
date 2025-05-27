-- Create reference_tokens table
CREATE TABLE reference_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    reference_id UUID REFERENCES job_references(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX idx_reference_tokens_token ON reference_tokens(token);
CREATE INDEX idx_reference_tokens_reference_id ON reference_tokens(reference_id);

-- Enable Row Level Security
ALTER TABLE reference_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for reference_tokens table
CREATE POLICY "Anyone can insert reference tokens"
    ON reference_tokens
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can read reference tokens"
    ON reference_tokens
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can update reference tokens"
    ON reference_tokens
    FOR UPDATE
    USING (true)
    WITH CHECK (true); 