import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AdminSubscriptionState {
  isLoading: boolean;
  error: string | null;
  updateUserSubscription: (userId: string, tier: 'free' | 'pro' | 'enterprise') => Promise<void>;
  getUserSubscription: (userId: string) => Promise<{
    tier: 'free' | 'pro' | 'enterprise';
    documentLimit: number;
    saoLimit: number;
    supervisorLimit: number;
  } | null>;
}

export const useAdminSubscriptionStore = create<AdminSubscriptionState>((set) => ({
  isLoading: false,
  error: null,

  updateUserSubscription: async (userId: string, tier: 'free' | 'pro' | 'enterprise') => {
    set({ isLoading: true, error: null });
    try {
      // Update or insert subscription
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          tier: tier,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Trigger a realtime event to notify the user's client
      await supabase
        .from('subscriptions')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);

    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update subscription' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getUserSubscription: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          tier: data.tier,
          documentLimit: data.document_limit,
          saoLimit: data.sao_limit,
          supervisorLimit: data.supervisor_limit,
        };
      }
      return null;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch subscription' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
})); 