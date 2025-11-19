import { useQuery } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDoc } from '@/lib/utils/firestore-serialize';

export interface AdminStatus {
  isAdmin: boolean;
  adminType: string | null;
  branchLocation: string | null;
  permissions: string[];
  isActive: boolean;
}

export const useAdminStatus = () => {
  const { user } = useAuth();

  const defaultStatus: AdminStatus = {
    isAdmin: false,
    adminType: null,
    branchLocation: null,
    permissions: [],
    isActive: false,
  };

  return useQuery({
    queryKey: ['admin-status', user?.uid],
    queryFn: async (): Promise<AdminStatus> => {
      if (!user) {
        return defaultStatus;
      }

      let hasAdminClaim = false;
      try {
        const token = await user.getIdTokenResult(true);
        hasAdminClaim = token.claims?.isAdmin === true;
      } catch (claimError) {
        console.warn('Failed to read admin claim:', claimError);
      }

      const adminDocRef = doc(db, COLLECTIONS.adminUsers, user.uid);
      let adminSnapshot = await getDoc(adminDocRef);

      if (!adminSnapshot.exists()) {
        const adminQuery = query(
          collection(db, COLLECTIONS.adminUsers),
          where('user_id', '==', user.uid),
          where('is_active', '==', true),
        );
        const querySnapshot = await getDocs(adminQuery);
        adminSnapshot = querySnapshot.docs[0];
      }

      if (!adminSnapshot || !adminSnapshot.exists()) {
        if (hasAdminClaim) {
          return {
            isAdmin: true,
            adminType: 'super_admin',
            branchLocation: null,
            permissions: [],
            isActive: true,
          };
        }
        return defaultStatus;
      }

      const data = serializeDoc<{
        admin_type?: string;
        branch_location?: string;
        permissions?: string[];
        is_active?: boolean;
      }>(adminSnapshot);

      return {
        isAdmin: true,
        adminType: data.admin_type ?? null,
        branchLocation: data.branch_location ?? null,
        permissions: data.permissions ?? [],
        isActive: data.is_active ?? true,
      };
    },
    enabled: !!user,
  });
};
