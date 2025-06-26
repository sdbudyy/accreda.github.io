import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Readable } from 'stream';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // Stripe requires the raw body
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  console.log('Received Stripe event:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Received checkout.session.completed:', session);

    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription;
    const plan = session.metadata?.plan;
    let planInterval = null;
    if (plan === 'pro_monthly') planInterval = 'monthly';
    if (plan === 'pro_yearly') planInterval = 'yearly';

    console.log('userId:', userId, 'subscriptionId:', subscriptionId, 'planInterval:', planInterval);

    if (userId && subscriptionId) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          tier: 'pro',
          stripe_subscription_id: subscriptionId,
          document_limit: 2147483647,
          sao_limit: 2147483647,
          supervisor_limit: 2147483647,
          plan_interval: planInterval
        })
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
      } else if (data && data.length === 0) {
        console.error('No subscription row found for userId:', userId);
      } else {
        console.log(`Supabase update result for user ${userId}:`, data);
      }
    } else {
      if (!userId) console.error('No userId found in session metadata.');
      if (!subscriptionId) console.error('No subscriptionId found in session.');
    }
    res.status(200).end();
    return;
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const userId = subscription.metadata?.userId;
    const FREE_LIMITS = {
      document_limit: 5,
      sao_limit: 5,
      supervisor_limit: 1,
    };
    if (userId) {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('override, tier')
        .eq('user_id', userId)
        .single();
      if (subData?.override) {
        console.log('Manual override set, skipping Stripe webhook update.');
        res.status(200).end();
        return;
      }
      if (subData?.tier !== 'enterprise') {
        const { data, error } = await supabase
          .from('subscriptions')
          .update({
            tier: 'free',
            document_limit: FREE_LIMITS.document_limit,
            sao_limit: FREE_LIMITS.sao_limit,
            supervisor_limit: FREE_LIMITS.supervisor_limit
          })
          .eq('user_id', userId)
          .select();
        if (error) {
          console.error('Supabase update error:', error);
        } else {
          console.log(`Supabase downgrade result for user ${userId}:`, data);
        }
      }
    } else {
      if (!userId) console.error('No userId found in subscription metadata.');
    }
    res.status(200).end();
    return;
  }

  // Handle payment failures
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      // Get the user ID from the subscription metadata
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        console.log(`Payment failed for user ${userId}, subscription ${subscriptionId}`);
        // You might want to send an email notification to the user
        // or implement a grace period before downgrading
      }
    }
  }

  // Handle payment action required (3D Secure, etc.)
  if (event.type === 'invoice.payment_action_required') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        console.log(`Payment action required for user ${userId}, subscription ${subscriptionId}`);
        // You might want to send an email with payment link
      }
    }
  }

  // Handle successful payments
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        console.log(`Payment succeeded for user ${userId}, subscription ${subscriptionId}`);
        // You might want to send a confirmation email
      }
    }
  }

  // Handle subscription creation
  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;
    const userId = subscription.metadata?.userId;
    
    if (userId) {
      console.log(`Subscription created for user ${userId}, subscription ${subscription.id}`);
      // You might want to send a welcome email
    }
  }

  // Optionally handle other event types here

  res.status(200).end();
} 