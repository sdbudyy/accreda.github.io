import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Supabase client with service role key for server-side use
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  // Look up the user's subscription in Supabase
  const { data: subData, error: subError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .single();
  if (subError || !subData || !subData.stripe_subscription_id) {
    return res.status(404).json({ error: 'Active subscription not found for user.' });
  }

  try {
    // Cancel the subscription in Stripe
    await stripe.subscriptions.cancel(subData.stripe_subscription_id);
    // Update the user's tier to 'free' in Supabase
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ tier: 'free' })
      .eq('user_id', userId);
    if (updateError) {
      return res.status(500).json({ error: 'Failed to update subscription in database.' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Stripe cancel subscription error:', err);
    return res.status(500).json({ error: 'Failed to cancel subscription with Stripe.' });
  }
} 