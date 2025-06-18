
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  title: string;
  description: string | null;
  location: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
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
      console.log('Fetching properties from Supabase...');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      console.log('Properties fetched:', data);
      return data as Property[];
    },
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      console.log('Fetching property:', id);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching property:', error);
        throw error;
      }

      console.log('Property fetched:', data);
      return data as Property;
    },
  });
};

export const useUserProperties = (userId?: string) => {
  return useQuery({
    queryKey: ['userProperties', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching properties for user:', userId);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('host_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user properties:', error);
        throw error;
      }

      console.log('User properties fetched:', data);
      return data as Property[];
    },
    enabled: !!userId,
  });
};
