import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, COLLECTIONS } from '@/lib/constants/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { serializeDoc, serializeDocs } from '@/lib/utils/firestore-serialize';
import { auth } from '@/lib/constants/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  max_properties: number | null;
  max_bookings: number | null;
  priority_support: boolean;
  analytics_access: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_tier_id: string;
  subscription_tier_name?: string | null;
  status: string;
  trial_ends_at?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  lenco_payment_reference?: string | null;
  lenco_payment_id?: string | null;
  lenco_customer_id?: string | null;
  last_payment_status?: string | null;
  last_payment_at?: string | null;
  next_billing_at?: string | null;
  mobile_money_network?: string | null;
  mobile_money_number_masked?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  subscription_tier?: SubscriptionTier;
}

export type MobileMoneyNetwork = 'AIRTEL' | 'MTN' | 'ZAMTEL';

export const useSubscriptionTiers = () => {
  return useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const tiersRef = collection(db, COLLECTIONS.subscriptionTiers);
      const tiersQuery = query(tiersRef, orderBy('price', 'asc'));
      const snapshot = await getDocs(tiersQuery);
      return serializeDocs<SubscriptionTier>(snapshot);
    },
  });
};

export const useUserSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-subscription', user?.uid],
    queryFn: async () => {
      if (!user) return null;

      const subscriptionRef = doc(db, COLLECTIONS.userSubscriptions, user.uid);
      const snapshot = await getDoc(subscriptionRef);
      if (!snapshot.exists()) {
        return null;
      }

      const subscription = serializeDoc<UserSubscription>(snapshot);
      if (subscription.subscription_tier_id) {
        const tierSnapshot = await getDoc(doc(db, COLLECTIONS.subscriptionTiers, subscription.subscription_tier_id));
        if (tierSnapshot.exists()) {
          subscription.subscription_tier = serializeDoc<SubscriptionTier>(tierSnapshot);
        }
      }

      return subscription;
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
      subscriptionTierName?: string;
    }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User must be signed in to update subscription.');

      const subscriptionRef = doc(db, COLLECTIONS.userSubscriptions, currentUser.uid);
      const existingSnapshot = await getDoc(subscriptionRef);
      if (!existingSnapshot.exists()) {
        throw new Error('User subscription record not found.');
      }

      await updateDoc(
        subscriptionRef,
        removeUndefined({
          subscription_tier_id: data.subscriptionTierId,
          subscription_tier_name: data.subscriptionTierName ?? null,
          updated_at: serverTimestamp(),
        }),
      );

      const updatedSnapshot = await getDoc(subscriptionRef);
      if (!updatedSnapshot.exists()) {
        throw new Error('Failed to fetch updated subscription.');
      }
      return serializeDoc<UserSubscription>(updatedSnapshot);
    },
    onSuccess: (subscription) => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription', subscription.user_id] });
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

export const useSubscriptionCheckout = () => {
  return useMutation({
    mutationFn: async (payload: {
      subscriptionTierId: string;
      subscriptionTierName: string;
      amount: number;
      msisdn: string;
      mobileMoneyNetwork: MobileMoneyNetwork;
      currency?: string;
    }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User must be signed in to start a checkout.');
      if (!functions) throw new Error('Firebase functions not initialized.');
      const checkoutFn = httpsCallable(functions, 'createSubscriptionCheckout');
      const result = await checkoutFn({
        ...payload,
        userId: currentUser.uid,
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
  });
};
