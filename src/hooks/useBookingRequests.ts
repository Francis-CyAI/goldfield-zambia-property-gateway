
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BookingRequest {
  id: string;
  property_id: string;
  guest_id: string;
  host_id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  message?: string;
  status: 'pending' | 'approved' | 'declined' | 'expired';
  total_price?: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export const useBookingRequests = (userId: string, type: 'guest' | 'host' = 'guest') => {
  return useQuery({
    queryKey: ['booking-requests', userId, type],
    queryFn: async () => {
      const column = type === 'guest' ? 'guest_id' : 'host_id';
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          properties (title, location, images)
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateBookingRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: Omit<BookingRequest, 'id' | 'status' | 'expires_at' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('booking_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-requests'] });
      toast({
        title: 'Booking request sent',
        description: 'Your booking request has been sent to the host.',
      });
    },
    onError: (error) => {
      console.error('Error creating booking request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send booking request. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBookingRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'approved' | 'declined' }) => {
      const { data, error } = await supabase
        .from('booking_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['booking-requests'] });
      toast({
        title: 'Request updated',
        description: `Booking request has been ${data.status}.`,
      });
    },
    onError: (error) => {
      console.error('Error updating booking request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking request. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
