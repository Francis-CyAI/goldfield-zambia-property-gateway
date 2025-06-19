
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  property_id: string;
  guest_id: string;
  booking_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export const usePropertyReviews = (propertyId: string) => {
  return useQuery({
    queryKey: ['reviews', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
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
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...reviewData,
          guest_id: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
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
