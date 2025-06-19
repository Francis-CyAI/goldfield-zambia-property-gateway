
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  max_properties: number | null;
  max_bookings: number | null;
  priority_support: boolean;
  analytics_access: boolean;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_tier_id: string;
  status: string;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  subscription_tier?: SubscriptionTier;
}

export const useSubscriptionTiers = () => {
  return useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      console.log('Fetching subscription tiers');
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching subscription tiers:', error);
        throw error;
      }
      return data as SubscriptionTier[];
    },
  });
};

export const useUserSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('Fetching user subscription for:', user.id);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tier:subscription_tiers(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user subscription:', error);
        throw error;
      }
      return data as UserSubscription | null;
    },
    enabled: !!user,
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      subscriptionTierId: string;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
    }) => {
      console.log('Updating user subscription:', data);
      const { data: result, error } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_tier_id: data.subscriptionTierId,
          stripe_customer_id: data.stripeCustomerId,
          stripe_subscription_id: data.stripeSubscriptionId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast({
        title: 'Subscription Updated',
        description: 'Your subscription has been successfully updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
