-- Create EIT profiles table
CREATE TABLE IF NOT EXISTS eit_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type = 'eit'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create supervisor profiles table
CREATE TABLE IF NOT EXISTS supervisor_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type = 'supervisor'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE eit_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_profiles ENABLE ROW LEVEL SECURITY;

-- EIT profiles policies
CREATE POLICY "Users can view their own EIT profile"
    ON eit_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own EIT profile"
    ON eit_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Supervisor profiles policies
CREATE POLICY "Users can view their own supervisor profile"
    ON supervisor_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own supervisor profile"
    ON supervisor_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_eit_profiles
    BEFORE UPDATE ON eit_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_supervisor_profiles
    BEFORE UPDATE ON supervisor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at(); 