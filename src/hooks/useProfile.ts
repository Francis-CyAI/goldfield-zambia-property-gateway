
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/constants/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';
import { serializeDoc } from '@/lib/utils/firestore-serialize';

export interface UserProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log('Fetching profile for user:', userId);
      const profileRef = doc(db, 'profiles', userId);
      const snapshot = await getDoc(profileRef);

      if (!snapshot.exists()) {
        console.warn('Profile not found for user:', userId);
        return null;
      }

      const profile = serializeDoc<UserProfile>(snapshot);
      console.log('Profile fetched:', profile);
      return profile;
    },
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, updates }: {
      userId: string;
      updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
    }) => {
      console.log('Updating profile:', { userId, updates });

      const profileRef = doc(db, 'profiles', userId);
      const payload = removeUndefined({
        ...updates,
        updated_at: serverTimestamp(),
      });

      await setDoc(profileRef, payload, { merge: true });
      const updatedSnapshot = await getDoc(profileRef);

      if (!updatedSnapshot.exists()) {
        throw new Error('Profile not found after update');
      }

      return serializeDoc<UserProfile>(updatedSnapshot);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
