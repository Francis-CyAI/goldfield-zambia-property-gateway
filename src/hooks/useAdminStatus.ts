
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminStatus {
  isAdmin: boolean;
  adminType: string | null;
  branchLocation: string | null;
  permissions: string[];
  isActive: boolean;
}

export const useAdminStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-status', user?.id],
    queryFn: async (): Promise<AdminStatus> => {
      if (!user) {
        return {
          isAdmin: false,
          adminType: null,
          branchLocation: null,
          permissions: [],
          isActive: false
        };
      }

      console.log('Checking admin status for user:', user.id);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.log('User is not an admin:', error.message);
        return {
          isAdmin: false,
          adminType: null,
          branchLocation: null,
          permissions: [],
          isActive: false
        };
      }

      return {
        isAdmin: true,
        adminType: data.admin_type,
        branchLocation: data.branch_location,
        permissions: data.permissions || [],
        isActive: data.is_active
      };
    },
    enabled: !!user,
  });
};
