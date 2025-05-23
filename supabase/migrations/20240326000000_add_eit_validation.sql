-- Create eit_connections table for managing EIT-to-EIT connections
CREATE TABLE eit_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    eit_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connected_eit_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Ensure unique connections between EITs
    UNIQUE(eit_id, connected_eit_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_eit_connections_eit_id ON eit_connections(eit_id);
CREATE INDEX idx_eit_connections_connected_eit_id ON eit_connections(connected_eit_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_eit_connections_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_eit_connections_updated_at
    BEFORE UPDATE ON eit_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_eit_connections_updated_at_column();

-- Enable Row Level Security
ALTER TABLE eit_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for eit_connections table
CREATE POLICY "Users can view their own connections"
    ON eit_connections
    FOR SELECT
    USING (auth.uid() = eit_id OR auth.uid() = connected_eit_id);

CREATE POLICY "Users can create their own connections"
    ON eit_connections
    FOR INSERT
    WITH CHECK (auth.uid() = eit_id);

CREATE POLICY "Users can update their own connections"
    ON eit_connections
    FOR UPDATE
    USING (auth.uid() = eit_id OR auth.uid() = connected_eit_id)
    WITH CHECK (auth.uid() = eit_id OR auth.uid() = connected_eit_id);

-- Modify job_references table to add validation support
ALTER TABLE job_references
    ADD COLUMN validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
    ADD COLUMN validator_id UUID REFERENCES auth.users(id),
    ADD COLUMN validated_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN validation_notes TEXT;

-- Create index for validator lookups
CREATE INDEX idx_job_references_validator_id ON job_references(validator_id);

-- Update RLS policies for job_references to allow validators to view and update references
DROP POLICY IF EXISTS "Users can only access their own job references" ON job_references;

CREATE POLICY "Users can view their own references and references they need to validate"
    ON job_references
    FOR SELECT
    USING (
        auth.uid() = eit_id OR 
        auth.uid() IN (
            SELECT connected_eit_id 
            FROM eit_connections 
            WHERE eit_id = job_references.eit_id 
            AND status = 'accepted'
        )
    );

CREATE POLICY "Users can create and update their own references"
    ON job_references
    FOR ALL
    USING (auth.uid() = eit_id)
    WITH CHECK (auth.uid() = eit_id);

CREATE POLICY "Validators can update references they are validating"
    ON job_references
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT connected_eit_id 
            FROM eit_connections 
            WHERE eit_id = job_references.eit_id 
            AND status = 'accepted'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT connected_eit_id 
            FROM eit_connections 
            WHERE eit_id = job_references.eit_id 
            AND status = 'accepted'
        )
    ); 