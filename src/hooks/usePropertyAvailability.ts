import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, where, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { PropertyAvailability } from '@/lib/models';
import { listDocuments, setDocument, getDocument } from '@/lib/utils/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export const usePropertyAvailability = (propertyId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['property-availability', propertyId, startDate, endDate],
    queryFn: async () => {
      const constraints = [
        where('property_id', '==', propertyId),
        orderBy('date', 'asc'),
        ...(startDate ? [where('date', '>=', startDate)] : []),
        ...(endDate ? [where('date', '<=', endDate)] : []),
      ];

      const { data, error } = await listDocuments('propertyAvailability', constraints);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!propertyId,
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (availability: Partial<PropertyAvailability> & { property_id: string; date: string }) => {
      const docId = `${availability.property_id}_${availability.date}`;
      const payload = removeUndefined({
        ...availability,
        updated_at: serverTimestamp(),
        ...(availability.id ? {} : { created_at: serverTimestamp() }),
      });

      const { error } = await setDocument(
        'propertyAvailability',
        docId,
        payload,
      );
      if (error) throw error;
      const { data, error: fetchError } = await getDocument('propertyAvailability', docId);
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Availability not found after update.');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['property-availability', data.property_id] });
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
