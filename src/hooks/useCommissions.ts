import { useQuery } from '@tanstack/react-query';
import { orderBy, where } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import type { Commission, Booking, Property } from '@/lib/models';
import { listDocuments, getDocument } from '@/lib/utils/firebase';

const hydrateCommission = async (commission: Commission): Promise<Commission> => {
  const [booking, property] = await Promise.all([
    commission.booking_id ? getDocument('bookings', commission.booking_id) : Promise.resolve({ data: null, error: null }),
    commission.property_id ? getDocument('properties', commission.property_id) : Promise.resolve({ data: null, error: null }),
  ]);

  if (booking.data) {
    commission.booking = booking.data as Booking;
  }

  if (property.data) {
    commission.property = property.data as Property;
  }

  return commission;
};

const hydrateCommissions = async (records: Commission[]): Promise<Commission[]> =>
  Promise.all(records.map(hydrateCommission));

export const useHostCommissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['host-commissions', user?.uid],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await listDocuments('platformCommissions', [
        where('host_id', '==', user.uid),
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      return hydrateCommissions(data ?? []);
    },
    enabled: !!user,
  });
};

export const usePlatformCommissions = () => {
  return useQuery({
    queryKey: ['platform-commissions'],
    queryFn: async () => {
      const { data, error } = await listDocuments('platformCommissions', [
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      return hydrateCommissions(data ?? []);
    },
  });
};

