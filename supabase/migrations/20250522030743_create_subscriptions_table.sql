-- Create enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier subscription_tier DEFAULT 'free',
    document_limit INTEGER DEFAULT 5,
    sao_limit INTEGER DEFAULT 5,
    supervisor_limit INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to set subscription limits based on tier
CREATE OR REPLACE FUNCTION set_subscription_limits()
RETURNS TRIGGER AS $$
BEGIN
    CASE NEW.tier
        WHEN 'free' THEN
            NEW.document_limit := 5;
            NEW.sao_limit := 5;
            NEW.supervisor_limit := 1;
        WHEN 'pro' THEN
            NEW.document_limit := 2147483647; -- Max integer value for "unlimited"
            NEW.sao_limit := 2147483647;
            NEW.supervisor_limit := 2147483647;
        WHEN 'enterprise' THEN
            NEW.document_limit := 2147483647;
            NEW.sao_limit := 2147483647;
            NEW.supervisor_limit := 2147483647;
    END CASE;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for setting subscription limits
CREATE TRIGGER set_subscription_limits_trigger
    BEFORE INSERT OR UPDATE OF tier ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION set_subscription_limits();

-- Create RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscription
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to update their own subscription
CREATE POLICY "Users can update own subscription"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow service role to manage all subscriptions
CREATE POLICY "Service role can manage all subscriptions"
    ON subscriptions
    USING (auth.jwt() ->> 'role' = 'service_role');
