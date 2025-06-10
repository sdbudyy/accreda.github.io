-- Create quick_links table
CREATE TABLE IF NOT EXISTS quick_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS quick_links_user_id_idx ON quick_links(user_id);

-- Enable RLS
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own quick links"
    ON quick_links FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quick links"
    ON quick_links FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick links"
    ON quick_links FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick links"
    ON quick_links FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_quick_links_updated_at
    BEFORE UPDATE ON quick_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 