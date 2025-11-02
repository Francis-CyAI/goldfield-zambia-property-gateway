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

export interface BookingRequest {
  id: string;
  property_id: string;
  guest_id: string;
  host_id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  message?: string | null;
  status: 'pending' | 'approved' | 'declined' | 'expired';
  total_price?: number | null;
  expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  property?: {
    title?: string;
    location?: string;
    images?: string[];
  };
}

const enrichWithProperty = async <T extends { property_id: string }>(records: T[]) => {
  return Promise.all(
    records.map(async (record) => {
      const propertySnapshot = await getDoc(doc(db, COLLECTIONS.properties, record.property_id));
      if (!propertySnapshot.exists()) return record;

      return {
        ...record,
        property: serializeDoc<{ title?: string; location?: string; images?: string[] }>(propertySnapshot),
      };
    }),
  );
};

export const useBookingRequests = (userId: string, type: 'guest' | 'host' = 'guest') => {
  return useQuery({
    queryKey: ['booking-requests', userId, type],
    queryFn: async () => {
      const column = type === 'guest' ? 'guest_id' : 'host_id';
      const requestsRef = collection(db, COLLECTIONS.bookingRequests);
      const requestsQuery = query(
        requestsRef,
        where(column, '==', userId),
        orderBy('created_at', 'desc'),
      );

      const snapshot = await getDocs(requestsQuery);
      const requests = serializeDocs<BookingRequest>(snapshot);
      return enrichWithProperty(requests);
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

      const propertySnapshot = await getDoc(doc(db, COLLECTIONS.properties, request.property_id));
      if (!propertySnapshot.exists()) {
        throw new Error('Property not found for booking request.');
      }
      const property = serializeDoc<{ host_id?: string }>(propertySnapshot);

      const requestsRef = collection(db, COLLECTIONS.bookingRequests);
      const docRef = await addDoc(requestsRef, {
        ...request,
        guest_id: currentUser.uid,
        host_id: property.host_id ?? request.host_id,
        status: 'pending',
        expires_at: request.expires_at ?? null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new Error('Failed to create booking request.');
      }

      const createdRequest = serializeDoc<BookingRequest>(snapshot);
      createdRequest.property = serializeDoc<{ title?: string; location?: string; images?: string[] }>(propertySnapshot);
      return createdRequest;
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
      const requestRef = doc(db, COLLECTIONS.bookingRequests, requestId);
      await updateDoc(requestRef, removeUndefined({
        status,
        updated_at: serverTimestamp(),
      }));

      const snapshot = await getDoc(requestRef);
      if (!snapshot.exists()) {
        throw new Error('Booking request not found after update.');
      }
      return { request: serializeDoc<BookingRequest>(snapshot), userId };
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

