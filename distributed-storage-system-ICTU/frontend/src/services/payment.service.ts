import { api } from '@/lib/api';

export const paymentService = {
  /**
   * Crée une session Checkout Stripe et renvoie l'URL de redirection
   */
  createCheckoutSession: async (priceId: string) => {
    const { data } = await api.post<{ checkout_url: string }>('/payments/create-checkout-session', { 
      price_id: priceId 
    });
    return data; // Contient { checkout_url: "https://checkout.stripe.com/..." }
  },

  getSubscriptionStatus: async () => {
    return api.get('/payments/subscription');
  }
};