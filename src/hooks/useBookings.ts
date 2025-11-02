
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, where, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/constants/firebase';
import type { Booking, Property } from '@/lib/models';
import {
  addDocument,
  getDocument,
  listDocuments,
  setDocument,
} from '@/lib/utils/firebase';

export const useBookings = (userId?: string) => {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const { data, error } = await listDocuments('bookings', [
        where('guest_id', '==', userId!),
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      const bookings = data ?? [];

      const enriched = await Promise.all(
        bookings.map(async (booking) => {
          if (!booking.property_id) return booking;

          const { data: property } = await getDocument('properties', booking.property_id);
          if (property) {
            return { ...booking, property: property as Property };
          }
          return booking;
        }),
      );

      return enriched;
    },
    enabled: !!userId,
  });
};

export const useHostBookings = (userId?: string) => {
  return useQuery({
    queryKey: ['host-bookings', userId],
    queryFn: async () => {
      const { data, error } = await listDocuments('bookings', [
        where('host_id', '==', userId!),
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      const bookings = data ?? [];

      const enriched = await Promise.all(
        bookings.map(async (booking) => {
          if (!booking.property_id) return booking;

          const { data: property } = await getDocument('properties', booking.property_id);
          if (property) {
            return { ...booking, property: property as Property };
          }
          return booking;
        }),
      );

      return enriched;
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
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be signed in to create a booking.');
      }

      const { data: property } = await getDocument('properties', bookingData.property_id);
      if (!property) {
        throw new Error('Property not found for booking.');
      }

      const payload = {
        ...bookingData,
        guest_id: currentUser.uid,
        host_id: (property as Property).host_id ?? null,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

            const { data, error } = await addDocument('bookings', payload);
      if (error) throw error;
      if (!data) throw new Error('Failed to create booking.');

      return property ? { ...data, property: property as Property } : data;
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
      const { error } = await setDocument(
        'bookings',
        bookingId,
        {
        status,
        updated_at: serverTimestamp(),
      },
      { merge: true },
      );
      if (error) throw error;
      const { data, error: fetchError } = await getDocument('bookings', bookingId);
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Booking not found after update.');
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
