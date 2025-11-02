import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, serverTimestamp, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { SavedSearch } from '@/lib/models';
import {
  addDocument,
  setDocument,
  listDocuments,
} from '@/lib/utils/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export const useSavedSearches = (userId?: string) => {
  return useQuery({
    queryKey: ['saved-searches', userId],
    queryFn: async () => {
      const { data, error } = await listDocuments('savedSearches', [
        where('user_id', '==', userId!),
        where('is_active', '==', true),
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
};

export const useCreateSavedSearch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (search: Omit<SavedSearch, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await addDocument('savedSearches', {
        ...search,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      if (error) throw error;
      if (!data) throw new Error('Failed to create saved search.');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches', data.user_id] });
      toast({
        title: 'Search saved',
        description: 'Your search has been saved successfully.',
      });
    },
    onError: (error) => {
      console.error('Error saving search:', error);
      toast({
        title: 'Error',
        description: 'Failed to save search. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteSavedSearch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ searchId, userId }: { searchId: string; userId: string }) => {
      const { error } = await setDocument(
        'savedSearches',
        searchId,
        removeUndefined({
        is_active: false,
        updated_at: serverTimestamp(),
        }),
        { merge: true },
      );
      if (error) throw error;
      return { userId };
    },
    onSuccess: ({ userId }) => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches', userId] });
      toast({
        title: 'Search deleted',
        description: 'Your saved search has been deleted.',
      });
    },
    onError: (error) => {
      console.error('Error deleting search:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete search. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
