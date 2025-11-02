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
import { db, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDoc, serializeDocs } from '@/lib/utils/firestore-serialize';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  search_criteria: Record<string, any>;
  is_active: boolean;
  notification_enabled: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export const useSavedSearches = (userId?: string) => {
  return useQuery({
    queryKey: ['saved-searches', userId],
    queryFn: async () => {
      const searchesRef = collection(db, COLLECTIONS.savedSearches);
      const searchesQuery = query(
        searchesRef,
        where('user_id', '==', userId!),
        where('is_active', '==', true),
        orderBy('created_at', 'desc'),
      );
      const snapshot = await getDocs(searchesQuery);
      return serializeDocs<SavedSearch>(snapshot);
    },
    enabled: !!userId,
  });
};

export const useCreateSavedSearch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (search: Omit<SavedSearch, 'id' | 'created_at' | 'updated_at'>) => {
      const searchesRef = collection(db, COLLECTIONS.savedSearches);
      const docRef = await addDoc(searchesRef, {
        ...search,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new Error('Failed to create saved search.');
      }

      return serializeDoc<SavedSearch>(snapshot);
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
      const searchRef = doc(db, COLLECTIONS.savedSearches, searchId);
      await updateDoc(searchRef, removeUndefined({
        is_active: false,
        updated_at: serverTimestamp(),
      }));
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

