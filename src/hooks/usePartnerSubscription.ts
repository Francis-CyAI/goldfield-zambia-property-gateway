
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PartnerSubscription {
  id: string;
  user_id: string;
  partner_name: string;
  business_type: string;
  subscription_tier: string;
  monthly_fee: number;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  monthly_price: number;
  features: string[];
  max_listings: number | null;
  priority_support: boolean;
  featured_placement: boolean;
}

export const useSubscriptionTiers = () => {
  return useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_subscription_tiers')
        .select('*')
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      return data as SubscriptionTier[];
    },
  });
};

export const usePartnerSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['partner-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase.functions.invoke('check-partner-subscription');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreatePartnerCheckout = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      partnerName: string;
      businessType: string;
      subscriptionTier: string;
    }) => {
      const { data: result, error } = await supabase.functions.invoke('create-partner-checkout', {
        body: data,
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const usePartnerCustomerPortal = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('partner-customer-portal');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Error accessing customer portal:', error);
      toast({
        title: 'Error',
        description: 'Failed to access customer portal. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
