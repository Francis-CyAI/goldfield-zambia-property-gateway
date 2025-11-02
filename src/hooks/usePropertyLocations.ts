import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, where, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { PropertyLocation, Property } from '@/lib/models';
import { getDocument, listDocuments, setDocument } from '@/lib/utils/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export const usePropertyLocation = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-location', propertyId],
    queryFn: async () => {
      const { data, error } = await getDocument('propertyLocations', propertyId);
      if (error) throw error;
      if (!data) return null;

      const property = await getDocument('properties', propertyId);
      if (property.data) {
        (data as PropertyLocation & { property?: Property }).property = property.data as Property;
      }
      return data;
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

      const { data, error } = await listDocuments('propertyLocations', [
        where('latitude', '>=', latitude - latDelta),
        where('latitude', '<=', latitude + latDelta),
        orderBy('latitude'),
      ]);
      if (error) throw error;
      const locations = (data ?? []).filter(
        (location) =>
          location.longitude >= longitude - lngDelta && location.longitude <= longitude + lngDelta,
      );

      return Promise.all(
        locations.map(async (location) => {
          const property = await getDocument('properties', location.property_id);
          if (property.data) {
            (location as PropertyLocation & { property?: Property }).property = property.data as Property;
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
      const payload = removeUndefined({
        ...location,
        updated_at: serverTimestamp(),
        created_at: serverTimestamp(),
      });

      const { error } = await setDocument(
        'propertyLocations',
        location.property_id,
        payload,
      );
      if (error) throw error;
      const { data, error: fetchError } = await getDocument('propertyLocations', location.property_id);
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Failed to upsert property location.');
      return data;
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
