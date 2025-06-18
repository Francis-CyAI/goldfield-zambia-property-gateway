
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWishlist = (userId?: string) => {
  return useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching wishlist for user:', userId);
      const { data, error } = await supabase
        .from('wishlists')
        .select('property_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
      }

      return data.map(item => item.property_id);
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
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', userId)
          .eq('property_id', propertyId);

        if (error) throw error;
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: userId,
            property_id: propertyId,
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
