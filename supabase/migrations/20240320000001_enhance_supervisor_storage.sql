-- Create supervisor_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS supervisor_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type = 'supervisor'),
    organization TEXT,
    position TEXT,
    license_number TEXT,
    years_of_experience INTEGER,
    specialization TEXT[],
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a table for supervisor-EIT relationships
CREATE TABLE IF NOT EXISTS supervisor_eit_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supervisor_id UUID REFERENCES supervisor_profiles(id) ON DELETE CASCADE,
    eit_id UUID REFERENCES eit_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'rejected')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(supervisor_id, eit_id)
);

-- Create a table for supervisor reviews
CREATE TABLE IF NOT EXISTS supervisor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supervisor_id UUID REFERENCES supervisor_profiles(id) ON DELETE CASCADE,
    eit_id UUID REFERENCES eit_profiles(id) ON DELETE CASCADE,
    review_type TEXT NOT NULL CHECK (review_type IN ('progress', 'final', 'interim')),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on tables
ALTER TABLE supervisor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_eit_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for supervisor_profiles
CREATE POLICY "Users can view their own supervisor profile"
    ON supervisor_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own supervisor profile"
    ON supervisor_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for supervisor_eit_relationships
CREATE POLICY "Supervisors can view their EIT relationships"
    ON supervisor_eit_relationships FOR SELECT
    USING (auth.uid() = supervisor_id);

CREATE POLICY "EITs can view their supervisor relationships"
    ON supervisor_eit_relationships FOR SELECT
    USING (auth.uid() = eit_id);

CREATE POLICY "Supervisors can manage their EIT relationships"
    ON supervisor_eit_relationships FOR ALL
    USING (auth.uid() = supervisor_id);

-- Create policies for supervisor_reviews
CREATE POLICY "Supervisors can manage their reviews"
    ON supervisor_reviews FOR ALL
    USING (auth.uid() = supervisor_id);

CREATE POLICY "EITs can view their reviews"
    ON supervisor_reviews FOR SELECT
    USING (auth.uid() = eit_id);

-- Create triggers for updated_at on tables
CREATE TRIGGER handle_updated_at_supervisor_profiles
    BEFORE UPDATE ON supervisor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_supervisor_relationships
    BEFORE UPDATE ON supervisor_eit_relationships
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_supervisor_reviews
    BEFORE UPDATE ON supervisor_reviews
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_supervisor_profiles_email 
    ON supervisor_profiles(email);
CREATE INDEX IF NOT EXISTS idx_supervisor_eit_relationships_supervisor_id 
    ON supervisor_eit_relationships(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_eit_relationships_eit_id 
    ON supervisor_eit_relationships(eit_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_reviews_supervisor_id 
    ON supervisor_reviews(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_reviews_eit_id 
    ON supervisor_reviews(eit_id); 