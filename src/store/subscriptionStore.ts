import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionData {
  tier: 'free' | 'pro' | 'enterprise';
  document_limit: number;
  sao_limit: number;
  supervisor_limit: number;
}

interface SubscriptionState {
  tier: 'free' | 'pro' | 'enterprise';
  documentLimit: number;
  saoLimit: number;
  supervisorLimit: number;
  hasAiAccess: boolean;
  isLoading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
  checkDocumentLimit: () => Promise<boolean>;
  checkSaoLimit: () => Promise<boolean>;
  checkSupervisorLimit: () => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => {
  let subscriptionChannel: RealtimeChannel | null = null;

  return {
    tier: 'free',
    documentLimit: 5,
    saoLimit: 5,
    supervisorLimit: 1,
    hasAiAccess: false,
    isLoading: false,
    error: null,

    fetchSubscription: async () => {
      set({ isLoading: true, error: null });
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (subscription) {
          set({
            tier: subscription.tier,
            documentLimit: subscription.document_limit,
            saoLimit: subscription.sao_limit,
            supervisorLimit: subscription.supervisor_limit,
          });
        } else {
          // Create default free subscription if none exists
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert([{ user_id: user.id }]);

          if (insertError) throw insertError;
        }

        // Cleanup existing subscription if any
        if (subscriptionChannel) {
          subscriptionChannel.unsubscribe();
        }

        // Set up realtime subscription
        subscriptionChannel = supabase
          .channel('subscription_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'subscriptions',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.new) {
                const newData = payload.new as SubscriptionData;
                set({
                  tier: newData.tier,
                  documentLimit: newData.document_limit,
                  saoLimit: newData.sao_limit,
                  supervisorLimit: newData.supervisor_limit,
                });
              }
            }
          )
          .subscribe();

      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to fetch subscription' });
      } finally {
        set({ isLoading: false });
      }
    },

    checkDocumentLimit: async () => {
      const { documentLimit } = get();
      if (documentLimit === 2147483647 || documentLimit === -1) return true; // Unlimited

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return (count || 0) < documentLimit;
    },

    checkSaoLimit: async () => {
      const { saoLimit } = get();
      if (saoLimit === 2147483647 || saoLimit === -1) return true; // Unlimited

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { count } = await supabase
        .from('saos')
        .select('*', { count: 'exact', head: true })
        .eq('eit_id', user.id);

      return (count || 0) < saoLimit;
    },

    checkSupervisorLimit: async () => {
      const { supervisorLimit } = get();
      if (supervisorLimit === 2147483647 || supervisorLimit === -1) return true; // Unlimited

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { count } = await supabase
        .from('supervisor_eit_relationships')
        .select('*', { count: 'exact', head: true })
        .eq('eit_id', user.id)
        .eq('status', 'active');

      return (count || 0) < supervisorLimit;
    },
  };
}); 