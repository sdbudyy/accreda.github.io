import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const proMonthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
const proYearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { plan, userId, userEmail } = req.body;
  let priceId;
  let planMetadata = '';
  if (plan === 'pro_monthly') {
    priceId = proMonthlyPriceId;
    planMetadata = 'pro_monthly';
  } else if (plan === 'pro_yearly') {
    priceId = proYearlyPriceId;
    planMetadata = 'pro_yearly';
  } else {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      success_url: `${process.env.CLIENT_URL || 'https://www.accreda.ca'}/thank-you`,
      cancel_url: `${process.env.CLIENT_URL || 'https://www.accreda.ca'}/settings?canceled=true`,
      metadata: { userId, plan: planMetadata },
    });
    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    return res.status(500).json({ error: 'Failed to create Stripe Checkout session.' });
  }
} 