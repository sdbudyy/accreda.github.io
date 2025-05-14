import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const getStripe = () => {
  return stripePromise;
};

export const handleCheckout = async (priceId: string) => {
  try {
    const response = await fetch('http://localhost:3001/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { sessionId } = await response.json();
    const stripe = await getStripe();
    
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}; 