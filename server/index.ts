import dotenv from 'dotenv';
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import googleDriveRoutes from './routes/googleDrive';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Loaded ENV:', process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const app = express();
const port = process.env.PORT || 3001;

// --- STRIPE SETUP ---
const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const stripe = new Stripe(stripeSecretKey);

// --- WEBHOOK ROUTE: MUST BE FIRST! ---
app.post('/api/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, stripeWebhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
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
    res.end();
    return;
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
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
        res.end();
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
    res.end();
    return;
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any;
    // You can add more logic here for downgrades/cancellations if needed
  }

  res.end();
});

// --- ALL OTHER MIDDLEWARE AND ROUTES ---
app.use(cors());
app.use(express.json());

const proMonthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID as string;
const proYearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID as string;

if (!proMonthlyPriceId || !proYearlyPriceId) {
  throw new Error('Missing Stripe environment variables. Please set STRIPE_PRO_MONTHLY_PRICE_ID and STRIPE_PRO_YEARLY_PRICE_ID in your .env file.');
}

console.log('Loaded Stripe Price IDs:', proMonthlyPriceId, proYearlyPriceId);

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key in environment variables');
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Debug endpoint to check subscriptions table access
app.get('/api/debug-subscriptions', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);
    console.log('DEBUG subscriptions:', data, error);
    res.json({ data, error });
  } catch (err) {
    console.error('DEBUG subscriptions error:', err);
    res.status(500).json({ error: 'Failed to query subscriptions table.' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

interface WaitlistRequestBody {
  email: string;
  province: string;
}

// Waitlist endpoint
const waitlistHandler: RequestHandler = async (req: Request<{}, {}, WaitlistRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, province } = req.body;
    if (!email || !province) {
      res.status(400).json({ error: 'Email and province are required.' });
      return;
    }
    const { error } = await supabase.from('waitlist').insert([{ email, province }]);
    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Request body:', req.body);
      if (error.code === '23505' || (error.message && error.message.includes('duplicate key value'))) {
        res.status(409).json({ error: 'This email is already on the waitlist.' });
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// All other routes go here!
app.post('/api/waitlist', waitlistHandler);

// Endpoint to create Stripe Checkout session
app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
  try {
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
      res.status(400).json({ error: 'Invalid plan selected.' });
      return;
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?canceled=true`,
      metadata: { userId, plan: planMetadata },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    res.status(500).json({ error: 'Failed to create Stripe Checkout session.' });
  }
});

// Cancel Stripe subscription endpoint
app.post('/api/cancel-stripe-subscription', async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'Missing userId' });
    return;
  }
  // Look up the user's subscription in Supabase
  const { data: subData, error: subError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .single();
  if (subError || !subData || !subData.stripe_subscription_id) {
    res.status(404).json({ error: 'Active subscription not found for user.' });
    return;
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
      res.status(500).json({ error: 'Failed to update subscription in database.' });
      return;
    }
    res.json({ success: true });
    res.end();
  } catch (err) {
    console.error('Stripe cancel subscription error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription with Stripe.' });
    res.end();
  }
});

// Admin endpoint to manually override a user's subscription tier and limits
app.post('/api/admin/set-subscription', async (req: Request, res: Response) => {
  // NOTE: No authentication is added. Add admin auth in production!
  const { userId, tier, document_limit, sao_limit, supervisor_limit, plan_interval } = req.body;
  if (!userId || !tier) {
    res.status(400).json({ error: 'Missing userId or tier' });
    return;
  }
  // Set limits for pro/enterprise if not provided
  let docLimit = document_limit;
  let saoLimit = sao_limit;
  let supLimit = supervisor_limit;
  if (tier === 'pro' || tier === 'enterprise') {
    docLimit = docLimit ?? 2147483647;
    saoLimit = saoLimit ?? 2147483647;
    supLimit = supLimit ?? 2147483647;
  }
  const updateObj: any = {
    tier,
    document_limit: docLimit,
    sao_limit: saoLimit,
    supervisor_limit: supLimit,
    override: true, // Prevent Stripe from overwriting
  };
  if (plan_interval) updateObj.plan_interval = plan_interval;
  const { error } = await supabase
    .from('subscriptions')
    .update(updateObj)
    .eq('user_id', userId);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ success: true });
});

// Serve static files from the frontend build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../dist');
  app.use(express.static(buildPath));
  // Serve index.html for any non-API route
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use('/api', googleDriveRoutes); 