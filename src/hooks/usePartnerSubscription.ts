import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { auth, db, functions, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDoc, serializeDocs } from '@/lib/utils/firestore-serialize';
import type { MobileMoneyNetwork } from './useSubscription';

export interface PartnerSubscription {
  id: string;
  user_id: string;
  partner_name: string;
  business_type: string;
  subscription_tier: string;
  monthly_fee: number;
  status: string;
  lenco_payment_reference?: string | null;
  lenco_payment_id?: string | null;
  lenco_customer_id?: string | null;
  last_payment_status?: string | null;
  mobile_money_network?: string | null;
  mobile_money_number_masked?: string | null;
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

      const subscriptionRef = doc(db, COLLECTIONS.partnerSubscriptions, user.uid);
      const snapshot = await getDoc(subscriptionRef);
      if (!snapshot.exists()) return null;

      return serializeDoc<PartnerSubscription>(snapshot);
    },
    enabled: !!user,
  });
};

export const useCreatePartnerCheckout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      partnerName: string;
      businessType: string;
      subscriptionTierId: string;
      subscriptionTierName: string;
      amount: number;
      msisdn: string;
      mobileMoneyNetwork: MobileMoneyNetwork;
      currency?: string;
    }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be signed in to create a partner checkout.');
      }

      if (!functions) throw new Error('Firebase functions not initialized.');
      const checkoutFn = httpsCallable(functions, 'createPartnerCheckout');
      const result = await checkoutFn({
        ...payload,
        userId: currentUser.uid,
        partnerName: payload.partnerName,
        subscriptionTier: payload.subscriptionTierId,
      });
      return result.data as {
        success: boolean;
        paymentReference: string;
        paymentId: string;
        status: string;
        customerId?: string | null;
        intentPath?: string;
      };
    },
    onSuccess: (data) => {
      toast({
        title: 'Payment initiated',
        description: `Reference ${data.paymentReference}. Confirm the prompt on your phone to complete payment.`,
      });
      queryClient.invalidateQueries({ queryKey: ['partner-subscription'] });
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

export const useCheckPartnerSubscription = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId?: string) => {
      const currentUser = auth.currentUser;
      const targetUserId = userId ?? currentUser?.uid;
      if (!targetUserId) {
        throw new Error('User must be signed in to check subscription.');
      }
      if (!functions) throw new Error('Firebase functions not initialized.');
      const checkFn = httpsCallable(functions, 'checkPartnerSubscription');
      const result = await checkFn({ userId: targetUserId });
      return result.data as {
        subscription: PartnerSubscription;
        paymentStatus?: {
          status: string;
          reference: string;
        };
      };
    },
    onSuccess: (data) => {
      toast({
        title: 'Subscription status updated',
        description: `Current status: ${data.subscription?.status ?? 'unknown'}`,
      });
    },
    onError: (error) => {
      console.error('Error checking partner subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh subscription status.',
        variant: 'destructive',
      });
    },
  });
};
