import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, serverTimestamp, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/constants/firebase';
import type { BookingRequest, Property } from '@/lib/models';
import {
  addDocument,
  getDocument,
  listDocuments,
  setDocument,
} from '@/lib/utils/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';

const enrichWithProperty = async <T extends { property_id: string }>(records: T[]) => {
  return Promise.all(
    records.map(async (record) => {
      const { data: property } = await getDocument('properties', record.property_id);
      if (!property) return record;

      return {
        ...record,
        property: property as Property,
      };
    }),
  );
};

export const useBookingRequests = (userId: string, type: 'guest' | 'host' = 'guest') => {
  return useQuery({
    queryKey: ['booking-requests', userId, type],
    queryFn: async () => {
      const column = type === 'guest' ? 'guest_id' : 'host_id';
      const { data, error } = await listDocuments('bookingRequests', [
        where(column, '==', userId),
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      return enrichWithProperty(data ?? []);
    },
    enabled: !!userId,
  });
};

export const useCreateBookingRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: Omit<BookingRequest, 'id' | 'status' | 'expires_at' | 'created_at' | 'updated_at' | 'property'>) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be signed in to create a booking request.');
      }

      const { data: property } = await getDocument('properties', request.property_id);
      if (!property) {
        throw new Error('Property not found for booking request.');
      }

      const { data, error } = await addDocument('bookingRequests', {
        ...request,
        guest_id: currentUser.uid,
        host_id: (property as Property).host_id ?? request.host_id,
        status: 'pending',
        expires_at: request.expires_at ?? null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      if (error) throw error;
      if (!data) throw new Error('Failed to create booking request.');

      return property ? { ...data, property: property as Property } : data;
    },
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ['booking-requests', request.guest_id, 'guest'] });
      queryClient.invalidateQueries({ queryKey: ['booking-requests', request.host_id, 'host'] });
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
    mutationFn: async ({ requestId, status, userId }: { requestId: string; status: 'approved' | 'declined'; userId: string }) => {
      const { error } = await setDocument(
        'bookingRequests',
        requestId,
        removeUndefined({
        status,
        updated_at: serverTimestamp(),
        }),
        { merge: true },
      );
      if (error) throw error;
      const { data, error: fetchError } = await getDocument('bookingRequests', requestId);
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Booking request not found after update.');
      return { request: data, userId };
    },
    onSuccess: ({ request, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['booking-requests', userId, 'host'] });
      queryClient.invalidateQueries({ queryKey: ['booking-requests', request.guest_id, 'guest'] });
      toast({
        title: 'Request updated',
        description: `Booking request has been ${request.status}.`,
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
