-- Drop existing tables if they exist
DROP TABLE IF EXISTS sao_skills CASCADE;
DROP TABLE IF EXISTS saos CASCADE;

-- Create saos table
CREATE TABLE saos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sao_skills table for the many-to-many relationship between SAOs and skills
CREATE TABLE sao_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sao_id UUID REFERENCES saos(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL,
    category_name TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(sao_id, skill_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_saos_user_id ON saos(user_id);
CREATE INDEX idx_sao_skills_sao_id ON sao_skills(sao_id);
CREATE INDEX idx_sao_skills_skill_id ON sao_skills(skill_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saos_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_saos_updated_at ON saos;
CREATE TRIGGER update_saos_updated_at
    BEFORE UPDATE ON saos
    FOR EACH ROW
    EXECUTE FUNCTION update_saos_updated_at_column();

-- Enable Row Level Security
ALTER TABLE saos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sao_skills ENABLE ROW LEVEL SECURITY;

-- Create policies for saos table
DROP POLICY IF EXISTS "Users can only access their own SAOs" ON saos;
CREATE POLICY "Users can only access their own SAOs"
    ON saos
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policies for sao_skills table
DROP POLICY IF EXISTS "Users can only access their own SAO skills" ON sao_skills;
CREATE POLICY "Users can only access their own SAO skills"
    ON sao_skills
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM saos
            WHERE saos.id = sao_skills.sao_id
            AND saos.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM saos
            WHERE saos.id = sao_skills.sao_id
            AND saos.user_id = auth.uid()
        )
    ); 