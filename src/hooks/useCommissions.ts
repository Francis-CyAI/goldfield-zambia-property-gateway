import { useQuery } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDoc, serializeDocs } from '@/lib/utils/firestore-serialize';

export interface Commission {
  id: string;
  booking_id: string;
  property_id: string;
  host_id: string;
  commission_rate: number;
  booking_amount: number;
  commission_amount: number;
  status: 'pending' | 'processed' | 'paid';
  processed_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  booking?: {
    check_in?: string;
    check_out?: string;
    guest_count?: number;
  };
  property?: {
    title?: string;
    location?: string;
  };
}

const hydrateCommission = async (commission: Commission) => {
  const [bookingSnapshot, propertySnapshot] = await Promise.all([
    commission.booking_id ? getDoc(doc(db, COLLECTIONS.bookings, commission.booking_id)) : Promise.resolve(null),
    commission.property_id ? getDoc(doc(db, COLLECTIONS.properties, commission.property_id)) : Promise.resolve(null),
  ]);

  if (bookingSnapshot && bookingSnapshot.exists()) {
    commission.booking = serializeDoc<{ check_in?: string; check_out?: string; guest_count?: number }>(bookingSnapshot);
  }

  if (propertySnapshot && propertySnapshot.exists()) {
    commission.property = serializeDoc<{ title?: string; location?: string }>(propertySnapshot);
  }

  return commission;
};

export const useHostCommissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['host-commissions', user?.uid],
    queryFn: async () => {
      if (!user) return [];

      const commissionsRef = collection(db, COLLECTIONS.platformCommissions);
      const commissionsQuery = query(
        commissionsRef,
        where('host_id', '==', user.uid),
        orderBy('created_at', 'desc'),
      );

      const snapshot = await getDocs(commissionsQuery);
      const commissions = serializeDocs<Commission>(snapshot);
      return Promise.all(commissions.map(hydrateCommission));
    },
    enabled: !!user,
  });
};

export const usePlatformCommissions = () => {
  return useQuery({
    queryKey: ['platform-commissions'],
    queryFn: async () => {
      const commissionsRef = collection(db, COLLECTIONS.platformCommissions);
      const commissionsQuery = query(commissionsRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(commissionsQuery);
      const commissions = serializeDocs<Commission>(snapshot);
      return Promise.all(commissions.map(hydrateCommission));
    },
  });
};

