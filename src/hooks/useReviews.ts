import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth, db, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDoc, serializeDocs } from '@/lib/utils/firestore-serialize';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export interface Review {
  id: string;
  property_id: string;
  guest_id: string;
  booking_id?: string;
  rating: number;
  comment?: string;
  category_ratings?: {
    cleanliness: number;
    accuracy: number;
    checkin: number;
    communication: number;
    location: number;
    value: number;
  };
  is_verified_stay?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
  host_response?: {
    message: string;
    created_at: string;
    host_name?: string;
  } | null;
}

const hydrateReview = async (review: Review) => {
  const [profileSnapshot] = await Promise.all([
    getDoc(doc(db, COLLECTIONS.profiles, review.guest_id)),
  ]);

  if (profileSnapshot.exists()) {
    const profile = serializeDoc<{ first_name?: string; last_name?: string }>(profileSnapshot);
    review.profiles = {
      first_name: profile.first_name,
      last_name: profile.last_name,
    };
  }

  return review;
};

export const usePropertyReviews = (propertyId: string) => {
  return useQuery({
    queryKey: ['reviews', propertyId],
    queryFn: async () => {
      const reviewsRef = collection(db, COLLECTIONS.reviews);
      const reviewsQuery = query(
        reviewsRef,
        where('property_id', '==', propertyId),
        orderBy('created_at', 'desc'),
      );
      const snapshot = await getDocs(reviewsQuery);
      const reviews = serializeDocs<Review>(snapshot);
      return Promise.all(reviews.map(hydrateReview));
    },
    enabled: !!propertyId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reviewData: {
      property_id: string;
      booking_id?: string;
      rating: number;
      comment?: string;
      category_ratings?: {
        cleanliness: number;
        accuracy: number;
        checkin: number;
        communication: number;
        location: number;
        value: number;
      };
      is_verified_stay?: boolean;
    }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const reviewsRef = collection(db, COLLECTIONS.reviews);
      const docRef = await addDoc(reviewsRef, {
        ...reviewData,
        guest_id: currentUser.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new Error('Failed to create review.');
      }

      return hydrateReview(serializeDoc<Review>(snapshot));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.property_id] });
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      });
    },
    onError: (error) => {
      console.error('Review error:', error);
      toast({
        title: 'Review failed',
        description: 'There was an error submitting your review. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useHostResponse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reviewId, response, hostName }: { reviewId: string; response: string; hostName?: string }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const reviewRef = doc(db, COLLECTIONS.reviews, reviewId);
      await updateDoc(reviewRef, removeUndefined({
        host_response: {
          message: response,
          created_at: new Date().toISOString(),
          host_name: hostName ?? null,
        },
        updated_at: serverTimestamp(),
      }));

      const snapshot = await getDoc(reviewRef);
      if (!snapshot.exists()) {
        throw new Error('Review not found after update.');
      }

      return serializeDoc<Review>(snapshot);
    },
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', review.property_id] });
      toast({
        title: 'Response posted',
        description: 'Your response has been added to the review.',
      });
    },
    onError: (error) => {
      console.error('Host response error:', error);
      toast({
        title: 'Response failed',
        description: 'There was an error posting your response. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

