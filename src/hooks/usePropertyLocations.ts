
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PropertyLocation {
  id: string;
  property_id: string;
  latitude: number;
  longitude: number;
  address_line1?: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

export const usePropertyLocation = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-location', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_locations')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) throw error;
      return data as PropertyLocation | null;
    },
    enabled: !!propertyId,
  });
};

export const useNearbyProperties = (latitude: number, longitude: number, radius: number = 10) => {
  return useQuery({
    queryKey: ['nearby-properties', latitude, longitude, radius],
    queryFn: async () => {
      // This would require PostGIS extension for true geographic queries
      // For now, we'll use a simple bounding box approach
      const latDelta = radius / 111; // Rough conversion: 1 degree ≈ 111 km
      const lngDelta = radius / (111 * Math.cos(latitude * Math.PI / 180));

      const { data, error } = await supabase
        .from('property_locations')
        .select(`
          *,
          properties (*)
        `)
        .gte('latitude', latitude - latDelta)
        .lte('latitude', latitude + latDelta)
        .gte('longitude', longitude - lngDelta)
        .lte('longitude', longitude + lngDelta);

      if (error) throw error;
      return data;
    },
    enabled: !!(latitude && longitude),
  });
};

export const useCreatePropertyLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (location: Omit<PropertyLocation, 'id'>) => {
      const { data, error } = await supabase
        .from('property_locations')
        .upsert(location, { onConflict: 'property_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-location', data.property_id] });
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
