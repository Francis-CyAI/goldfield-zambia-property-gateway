
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
  category_ratings?: {
    cleanliness: number;
    accuracy: number;
    checkin: number;
    communication: number;
    location: number;
    value: number;
  };
  is_verified_stay?: boolean;
  created_at: string;
  host_response?: {
    message: string;
    created_at: string;
    host_name: string;
  };
}

export const usePropertyReviews = (propertyId: string) => {
  return useQuery({
    queryKey: ['reviews', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:guest_id (
            first_name,
            last_name
          )
        `)
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...reviewData,
          guest_id: user.user.id,
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

export const useHostResponse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // In a real implementation, you'd have a separate host_responses table
      // For now, we'll update the review with the host response
      const { data, error } = await supabase
        .from('reviews')
        .update({
          host_response: {
            message: response,
            created_at: new Date().toISOString(),
            host_name: 'Property Host' // This would come from the host's profile
          }
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.property_id] });
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
