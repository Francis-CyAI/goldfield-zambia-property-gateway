
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serverTimestamp, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { listDocuments, setDocument, deleteDocument } from '@/lib/utils/firebase';

export const useWishlist = (userId?: string) => {
  return useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching wishlist for user:', userId);
      const { data, error } = await listDocuments('wishlists', [where('user_id', '==', userId)]);
      if (error) throw error;

      return (data ?? [])
        .map((entry) => entry.property_id as string | undefined)
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
        const { error } = await deleteDocument('wishlists', `${userId}_${propertyId}`);
        if (error) throw error;
      } else {
        const { error } = await setDocument('wishlists', `${userId}_${propertyId}`, {
          user_id: userId,
          property_id: propertyId,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        if (error) throw error;
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
