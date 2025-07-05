
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  created_at: string;
  updated_at: string;
  booking?: {
    check_in: string;
    check_out: string;
    guest_count: number;
  };
  property?: {
    title: string;
    location: string;
  };
}

export const useHostCommissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['host-commissions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching commission data for host:', user.id);
      const { data, error } = await supabase
        .from('platform_commissions')
        .select(`
          *,
          booking:bookings(check_in, check_out, guest_count),
          property:properties(title, location)
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commissions:', error);
        throw error;
      }
      return data as Commission[];
    },
    enabled: !!user,
  });
};

export const usePlatformCommissions = () => {
  return useQuery({
    queryKey: ['platform-commissions'],
    queryFn: async () => {
      console.log('Fetching all platform commission data');
      const { data, error } = await supabase
        .from('platform_commissions')
        .select(`
          *,
          booking:bookings(check_in, check_out, guest_count),
          property:properties(title, location)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching platform commissions:', error);
        throw error;
      }
      return data as Commission[];
    },
  });
};
