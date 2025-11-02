
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

export interface Property {
  id: string;
  title: string;
  description?: string;
  location: string;
  price_per_night: number;
  property_type: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  is_active: boolean;
  host_id: string;
  created_at: string;
  updated_at: string;
}

export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const propertiesRef = collection(db, COLLECTIONS.properties);
      const propertiesQuery = query(
        propertiesRef,
        where('is_active', '==', true),
        orderBy('created_at', 'desc'),
      );
      const snapshot = await getDocs(propertiesQuery);
      return serializeDocs<Property>(snapshot);
    },
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const propertyRef = doc(db, COLLECTIONS.properties, id);
      const snapshot = await getDoc(propertyRef);
      if (!snapshot.exists()) {
        throw new Error('Property not found');
      }
      return serializeDoc<Property>(snapshot);
    },
    enabled: !!id,
  });
};

export const useUserProperties = (userId?: string) => {
  return useQuery({
    queryKey: ['user-properties', userId],
    queryFn: async () => {
      const propertiesRef = collection(db, COLLECTIONS.properties);
      const userPropertiesQuery = query(
        propertiesRef,
        where('host_id', '==', userId!),
        orderBy('created_at', 'desc'),
      );
      const snapshot = await getDocs(userPropertiesQuery);
      return serializeDocs<Property>(snapshot);
    },
    enabled: !!userId,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'host_id'>) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be signed in to create a property.');
      }

      const propertiesRef = collection(db, COLLECTIONS.properties);
      const payload = {
        ...propertyData,
        host_id: currentUser.uid,
        is_active: propertyData.is_active ?? true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const docRef = await addDoc(propertiesRef, payload);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error('Failed to create property');
      }

      return serializeDoc<Property>(snapshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      toast({
        title: 'Property created',
        description: 'Your property has been listed successfully.',
      });
    },
    onError: (error) => {
      console.error('Property creation error:', error);
      toast({
        title: 'Property creation failed',
        description: 'There was an error creating your property. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Property> & { id: string }) => {
      const propertyRef = doc(db, COLLECTIONS.properties, id);
      const payload = removeUndefined({
        ...updateData,
        updated_at: serverTimestamp(),
      });

      await updateDoc(propertyRef, payload);
      const snapshot = await getDoc(propertyRef);

      if (!snapshot.exists()) {
        throw new Error('Property not found after update');
      }

      return serializeDoc<Property>(snapshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      toast({
        title: 'Property updated',
        description: 'Your property has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Property update error:', error);
      toast({
        title: 'Property update failed',
        description: 'There was an error updating your property. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
