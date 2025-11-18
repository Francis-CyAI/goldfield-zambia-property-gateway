
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, where, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/constants/firebase';
import type { Property } from '@/lib/models';
import {
  addDocument,
  getDocument,
  listDocuments,
  setDocument,
  deleteDocument as deleteDocHelper,
} from '@/lib/utils/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await listDocuments('properties', [
        where('is_active', '==', true),
        where('approval_status', '==', 'approved'),
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await getDocument('properties', id);
      if (error) throw error;
      if (!data) {
        throw new Error('Property not found');
      }
      return data;
    },
    enabled: !!id,
  });
};

export const useUserProperties = (userId?: string) => {
  return useQuery({
    queryKey: ['user-properties', userId],
    queryFn: async () => {
      const { data, error } = await listDocuments('properties', [
        where('host_id', '==', userId!),
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      return data ?? [];
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

      const payload = {
        ...propertyData,
        host_id: currentUser.uid,
        is_active: propertyData.is_active ?? false,
        approval_status: propertyData.approval_status ?? 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const { data, error } = await addDocument('properties', payload);
      if (error) throw error;
      if (!data) throw new Error('Failed to create property');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      toast({
        title: 'Property submitted',
        description: 'Your property has been submitted for review.',
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
      const payload = removeUndefined({
        ...updateData,
        updated_at: serverTimestamp(),
      });

      const { error } = await setDocument('properties', id, payload);
      if (error) throw error;
      const { data, error: fetchError } = await getDocument('properties', id);
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Property not found after update');
      return data;
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

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteDocHelper('properties', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      toast({
        title: 'Property removed',
        description: 'The property has been deleted.',
      });
    },
    onError: (error) => {
      console.error('Property delete error:', error);
      toast({
        title: 'Property delete failed',
        description: 'There was an error deleting your property. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
