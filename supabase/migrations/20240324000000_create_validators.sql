-- Drop existing table and related objects
DROP TABLE IF EXISTS validators CASCADE;

-- Create validators table
CREATE TABLE validators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Add unique constraint to ensure only one validator per skill per user
    CONSTRAINT unique_validator_per_skill UNIQUE (user_id, skill_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_validators_user_id ON validators(user_id);
CREATE INDEX idx_validators_skill_id ON validators(skill_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_validators_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_validators_updated_at
    BEFORE UPDATE ON validators
    FOR EACH ROW
    EXECUTE FUNCTION update_validators_updated_at_column();

-- Enable Row Level Security
ALTER TABLE validators ENABLE ROW LEVEL SECURITY;

-- Create policies for validators table
CREATE POLICY "Users can only access their own validators"
    ON validators
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 