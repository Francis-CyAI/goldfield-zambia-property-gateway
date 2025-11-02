
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db, COLLECTIONS } from '@/lib/constants/firebase';

export const useWishlist = (userId?: string) => {
  return useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching wishlist for user:', userId);
      const wishlistRef = collection(db, COLLECTIONS.wishlists);
      const wishlistQuery = query(wishlistRef, where('user_id', '==', userId));
      const snapshot = await getDocs(wishlistQuery);

      return snapshot.docs
        .map((docSnapshot) => docSnapshot.get('property_id') as string | undefined)
        .filter((propertyId): propertyId is string => Boolean(propertyId));
    },
    enabled: !!userId,
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, propertyId, isWishlisted }: {
      userId: string;
      propertyId: string;
      isWishlisted: boolean;
    }) => {
      console.log('Toggling wishlist:', { userId, propertyId, isWishlisted });
      
      if (isWishlisted) {
        const entryRef = doc(db, COLLECTIONS.wishlists, `${userId}_${propertyId}`);
        await deleteDoc(entryRef);
      } else {
        const entryRef = doc(db, COLLECTIONS.wishlists, `${userId}_${propertyId}`);
        await setDoc(entryRef, {
          user_id: userId,
          property_id: propertyId,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }, { merge: true });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', variables.userId] });
      toast({
        title: variables.isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
        description: variables.isWishlisted ? 'Property removed from your wishlist' : 'Property saved to your wishlist',
      });
    },
    onError: (error) => {
      console.error('Error toggling wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
