
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Property;
    },
    enabled: !!id,
  });
};

export const useUserProperties = (userId?: string) => {
  return useQuery({
    queryKey: ['user-properties', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('host_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
    enabled: !!userId,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'host_id'>) => {
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...propertyData,
          host_id: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('properties')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
