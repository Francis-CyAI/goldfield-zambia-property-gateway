import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
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
  status: string;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  subscription_tier?: SubscriptionTier;
}

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

      const userSubscriptionsRef = collection(db, COLLECTIONS.userSubscriptions);
      const activeSubscriptionQuery = query(
        userSubscriptionsRef,
        where('user_id', '==', user.uid),
        where('status', '==', 'active'),
        limit(1),
      );

      const snapshot = await getDocs(activeSubscriptionQuery);
      if (snapshot.empty) {
        return null;
      }

      const subscription = serializeDoc<UserSubscription>(snapshot.docs[0]);
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
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
    }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User must be signed in to update subscription.');

      const userSubscriptionsRef = collection(db, COLLECTIONS.userSubscriptions);
      const currentQuery = query(
        userSubscriptionsRef,
        where('user_id', '==', currentUser.uid),
        limit(1),
      );
      const snapshot = await getDocs(currentQuery);

      if (snapshot.empty) {
        throw new Error('User subscription record not found.');
      }

      const subscriptionDoc = snapshot.docs[0];
      const subscriptionRef = subscriptionDoc.ref;

      await updateDoc(
        subscriptionRef,
        removeUndefined({
          subscription_tier_id: data.subscriptionTierId,
          stripe_customer_id: data.stripeCustomerId ?? null,
          stripe_subscription_id: data.stripeSubscriptionId ?? null,
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
    mutationFn: async (payload: { subscriptionTierId: string }) => {
      if (!functions) throw new Error('Firebase functions not initialized.');
      const checkoutFn = httpsCallable(functions, 'createSubscriptionCheckout');
      const result = await checkoutFn(payload);
      return result.data as { url?: string };
    },
  });
};

