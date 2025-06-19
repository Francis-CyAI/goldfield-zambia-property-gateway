
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    location: string;
    images: string[];
  };
}

export const useBookings = (userId?: string) => {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(title, location, images)
        `)
        .eq('guest_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!userId,
  });
};

export const useHostBookings = (userId?: string) => {
  return useQuery({
    queryKey: ['host-bookings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties!inner(title, location, images)
        `)
        .eq('properties.host_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!userId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookingData: {
      property_id: string;
      check_in: string;
      check_out: string;
      guest_count: number;
      total_price: number;
    }) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          guest_id: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: 'Booking created',
        description: 'Your booking has been submitted successfully.',
      });
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: 'There was an error creating your booking. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['host-bookings'] });
      toast({
        title: 'Booking updated',
        description: 'Booking status has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Update booking error:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error updating the booking status.',
        variant: 'destructive',
      });
    },
  });
};
