
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  search_criteria: Record<string, any>;
  is_active: boolean;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useSavedSearches = (userId?: string) => {
  return useQuery({
    queryKey: ['saved-searches', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId!)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedSearch[];
    },
    enabled: !!userId,
  });
};

export const useCreateSavedSearch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (search: Omit<SavedSearch, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert(search)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
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
    mutationFn: async (searchId: string) => {
      const { error } = await supabase
        .from('saved_searches')
        .update({ is_active: false })
        .eq('id', searchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
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
