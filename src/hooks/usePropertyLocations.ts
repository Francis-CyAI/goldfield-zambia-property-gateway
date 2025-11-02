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

export interface PropertyLocation {
  id: string;
  property_id: string;
  latitude: number;
  longitude: number;
  address_line1?: string | null;
  address_line2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country: string;
  created_at?: string | null;
  updated_at?: string | null;
  property?: {
    title?: string;
    location?: string;
    images?: string[];
  };
}

export const usePropertyLocation = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-location', propertyId],
    queryFn: async () => {
      const locationRef = doc(db, COLLECTIONS.propertyLocations, propertyId);
      const snapshot = await getDoc(locationRef);
      if (!snapshot.exists()) {
        return null;
      }

      const location = serializeDoc<PropertyLocation>(snapshot);
      const propertySnapshot = await getDoc(doc(db, COLLECTIONS.properties, propertyId));
      if (propertySnapshot.exists()) {
        location.property = serializeDoc<{ title?: string; location?: string; images?: string[] }>(propertySnapshot);
      }
      return location;
    },
    enabled: !!propertyId,
  });
};

export const useNearbyProperties = (latitude: number, longitude: number, radius = 10) => {
  return useQuery({
    queryKey: ['nearby-properties', latitude, longitude, radius],
    queryFn: async () => {
      const latDelta = radius / 111;
      const lngDelta = radius / (111 * Math.cos((latitude * Math.PI) / 180));

      const locationsRef = collection(db, COLLECTIONS.propertyLocations);
      const locationsQuery = query(
        locationsRef,
        where('latitude', '>=', latitude - latDelta),
        where('latitude', '<=', latitude + latDelta),
        orderBy('latitude'),
      );

      const snapshot = await getDocs(locationsQuery);
      const locations = serializeDocs<PropertyLocation>(snapshot).filter((location) => {
        return (
          location.longitude >= longitude - lngDelta &&
          location.longitude <= longitude + lngDelta
        );
      });

      return Promise.all(
        locations.map(async (location) => {
          const propertySnapshot = await getDoc(doc(db, COLLECTIONS.properties, location.property_id));
          if (propertySnapshot.exists()) {
            location.property = serializeDoc<{ title?: string; location?: string; images?: string[] }>(propertySnapshot);
          }
          return location;
        }),
      );
    },
    enabled: !!latitude && !!longitude,
  });
};

export const useCreatePropertyLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (location: Omit<PropertyLocation, 'id' | 'created_at' | 'updated_at' | 'property'>) => {
      const locationRef = doc(db, COLLECTIONS.propertyLocations, location.property_id);
      await setDoc(
        locationRef,
        removeUndefined({
          ...location,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }),
        { merge: true },
      );

      const snapshot = await getDoc(locationRef);
      if (!snapshot.exists()) {
        throw new Error('Failed to upsert property location.');
      }

      return serializeDoc<PropertyLocation>(snapshot);
    },
    onSuccess: (location) => {
      queryClient.invalidateQueries({ queryKey: ['property-location', location.property_id] });
      toast({
        title: 'Location updated',
        description: 'Property location has been successfully updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

