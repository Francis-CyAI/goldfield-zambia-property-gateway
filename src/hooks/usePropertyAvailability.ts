import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDoc, serializeDocs } from '@/lib/utils/firestore-serialize';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export interface PropertyAvailability {
  id: string;
  property_id: string;
  date: string;
  is_available: boolean;
  price_override?: number | null;
  minimum_stay?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const usePropertyAvailability = (propertyId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['property-availability', propertyId, startDate, endDate],
    queryFn: async () => {
      let availabilityQuery = query(
        collection(db, COLLECTIONS.propertyAvailability),
        where('property_id', '==', propertyId),
        orderBy('date', 'asc'),
      );

      if (startDate) {
        availabilityQuery = query(availabilityQuery, where('date', '>=', startDate));
      }
      if (endDate) {
        availabilityQuery = query(availabilityQuery, where('date', '<=', endDate));
      }

      const snapshot = await getDocs(availabilityQuery);
      return serializeDocs<PropertyAvailability>(snapshot);
    },
    enabled: !!propertyId,
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (availability: Partial<PropertyAvailability> & { property_id: string; date: string }) => {
      const docId = `${availability.property_id}_${availability.date}`;
      const availabilityRef = doc(db, COLLECTIONS.propertyAvailability, docId);
      await setDoc(
        availabilityRef,
        removeUndefined({
          ...availability,
          updated_at: serverTimestamp(),
          created_at: availability.id ? undefined : serverTimestamp(),
        }),
        { merge: true },
      );

      const snapshot = await getDoc(availabilityRef);
      if (!snapshot.exists()) {
        throw new Error('Availability not found after update.');
      }
      return serializeDoc<PropertyAvailability>(snapshot);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-availability', data.property_id] });
      toast({
        title: 'Availability updated',
        description: 'Property availability has been successfully updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

