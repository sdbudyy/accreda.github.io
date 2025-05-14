-- Drop existing table if it exists
DROP TABLE IF EXISTS user_skills CASCADE;

-- Create user_skills table to store user skill rankings
CREATE TABLE user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL,
    category_name TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    rank INTEGER,
    status TEXT DEFAULT 'not-started' CHECK (status IN ('completed', 'in-progress', 'not-started')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, skill_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_skills_updated_at ON user_skills;
CREATE TRIGGER update_user_skills_updated_at
    BEFORE UPDATE ON user_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only access their own skills" ON user_skills;

-- Create policy to allow users to only see and modify their own skills
CREATE POLICY "Users can only access their own skills"
    ON user_skills
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 