import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDoc, serializeDocs } from '@/lib/utils/firestore-serialize';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];

      const notificationsRef = collection(db, COLLECTIONS.notifications);
      const notificationsQuery = query(
        notificationsRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
      );

      const snapshot = await getDocs(notificationsQuery);
      return serializeDocs<Notification>(snapshot);
    },
    enabled: !!userId,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const notificationRef = doc(db, COLLECTIONS.notifications, notificationId);
      await updateDoc(
        notificationRef,
        removeUndefined({ is_read: true, updated_at: serverTimestamp() }),
      );
      const snapshot = await getDoc(notificationRef);
      if (!snapshot.exists()) {
        throw new Error('Notification not found after update.');
      }
      return serializeDoc<Notification>(snapshot);
    },
    onSuccess: (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', notification.user_id] });
      toast({
        title: 'Notification marked as read',
        description: 'The notification has been updated.',
      });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationData: {
      user_id: string;
      title: string;
      message: string;
      type?: 'info' | 'success' | 'warning' | 'error';
      related_id?: string | null;
    }) => {
      const notificationsRef = collection(db, COLLECTIONS.notifications);
      const docRef = await addDoc(notificationsRef, {
        ...notificationData,
        type: notificationData.type ?? 'info',
        is_read: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new Error('Failed to create notification.');
      }
      return serializeDoc<Notification>(snapshot);
    },
    onSuccess: (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', notification.user_id] });
      toast({
        title: 'Notification created',
        description: 'The notification has been sent successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to create notification. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

