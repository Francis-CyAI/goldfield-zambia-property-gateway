
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

export interface Booking {
  id: string;
  property_id: string;
  host_id?: string;
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
      const bookingsRef = collection(db, COLLECTIONS.bookings);
      const bookingsQuery = query(
        bookingsRef,
        where('guest_id', '==', userId!),
        orderBy('created_at', 'desc'),
      );
      const snapshot = await getDocs(bookingsQuery);
      const bookings = serializeDocs<Booking>(snapshot);

      const enriched = await Promise.all(
        bookings.map(async (booking) => {
          if (!booking.property_id) return booking;

          const propertySnapshot = await getDoc(doc(db, COLLECTIONS.properties, booking.property_id));
          if (propertySnapshot.exists()) {
            const propertyData = serializeDoc<{ title?: string; location?: string; images?: string[] }>(
              propertySnapshot,
            );
            return { ...booking, property: propertyData };
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
      const bookingsRef = collection(db, COLLECTIONS.bookings);
      const hostBookingsQuery = query(
        bookingsRef,
        where('host_id', '==', userId!),
        orderBy('created_at', 'desc'),
      );
      const snapshot = await getDocs(hostBookingsQuery);
      const bookings = serializeDocs<Booking>(snapshot);

      const enriched = await Promise.all(
        bookings.map(async (booking) => {
          if (!booking.property_id) return booking;

          const propertySnapshot = await getDoc(doc(db, COLLECTIONS.properties, booking.property_id));
          if (propertySnapshot.exists()) {
            const propertyData = serializeDoc<{ title?: string; location?: string; images?: string[] }>(
              propertySnapshot,
            );
            return { ...booking, property: propertyData };
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

      const propertySnapshot = await getDoc(doc(db, COLLECTIONS.properties, bookingData.property_id));
      if (!propertySnapshot.exists()) {
        throw new Error('Property not found for booking.');
      }
      const propertyData = serializeDoc<{ host_id?: string }>(propertySnapshot);

      const bookingsRef = collection(db, COLLECTIONS.bookings);
      const payload = {
        ...bookingData,
        guest_id: currentUser.uid,
        host_id: propertyData.host_id ?? null,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const docRef = await addDoc(bookingsRef, payload);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error('Failed to create booking.');
      }

      const createdBooking = serializeDoc<Booking>(snapshot);
      if (propertySnapshot.exists()) {
        createdBooking.property = serializeDoc<{ title?: string; location?: string; images?: string[] }>(
          propertySnapshot,
        );
      }

      return createdBooking;
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
      const bookingRef = doc(db, COLLECTIONS.bookings, bookingId);
      await updateDoc(bookingRef, {
        status,
        updated_at: serverTimestamp(),
      });

      const snapshot = await getDoc(bookingRef);
      if (!snapshot.exists()) {
        throw new Error('Booking not found after update.');
      }

      return serializeDoc<Booking>(snapshot);
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
