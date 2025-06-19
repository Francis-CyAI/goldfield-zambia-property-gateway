
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PropertyAvailability {
  id: string;
  property_id: string;
  date: string;
  is_available: boolean;
  price_override?: number;
  minimum_stay?: number;
}

export const usePropertyAvailability = (propertyId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['property-availability', propertyId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('property_availability')
        .select('*')
        .eq('property_id', propertyId)
        .order('date');

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyAvailability[];
    },
    enabled: !!propertyId,
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (availability: Partial<PropertyAvailability> & { property_id: string; date: string }) => {
      const { data, error } = await supabase
        .from('property_availability')
        .upsert(availability, { onConflict: 'property_id,date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-availability'] });
      toast({
        title: 'Availability updated',
        description: 'Property availability has been successfully updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
