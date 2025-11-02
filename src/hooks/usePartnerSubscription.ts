import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { auth, db, functions, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDoc, serializeDocs } from '@/lib/utils/firestore-serialize';

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
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PartnerSubscriptionTier {
  id: string;
  name: string;
  monthly_price: number;
  features: string[];
  max_listings: number | null;
  priority_support: boolean;
  featured_placement: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export const usePartnerSubscriptionTiers = () => {
  return useQuery({
    queryKey: ['partner-subscription-tiers'],
    queryFn: async () => {
      const tiersRef = collection(db, COLLECTIONS.partnerSubscriptionTiers);
      const tiersQuery = query(tiersRef, orderBy('monthly_price', 'asc'));
      const snapshot = await getDocs(tiersQuery);
      return serializeDocs<PartnerSubscriptionTier>(snapshot);
    },
  });
};

export const usePartnerSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['partner-subscription', user?.uid],
    queryFn: async () => {
      if (!user) return null;

      const subscriptionQuery = query(
        collection(db, COLLECTIONS.partnerSubscriptions),
        where('user_id', '==', user.uid),
        where('status', 'in', ['active', 'trialing']),
      );
      const snapshot = await getDocs(subscriptionQuery);
      if (snapshot.empty) return null;

      return serializeDoc<PartnerSubscription>(snapshot.docs[0]);
    },
    enabled: !!user,
  });
};

export const useCreatePartnerCheckout = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      partnerName: string;
      businessType: string;
      subscriptionTier: string;
    }) => {
      if (!functions) throw new Error('Firebase functions not initialized.');
      const checkoutFn = httpsCallable(functions, 'createPartnerCheckout');
      const result = await checkoutFn(payload);
      return result.data as { url?: string };
    },
    onSuccess: (data) => {
      if (data?.url) {
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
      if (!functions) throw new Error('Firebase functions not initialized.');
      const portalFn = httpsCallable(functions, 'partnerCustomerPortal');
      const result = await portalFn();
      return result.data as { url?: string };
    },
    onSuccess: (data) => {
      if (data?.url) {
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
