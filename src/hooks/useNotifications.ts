import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, serverTimestamp, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/lib/models';
import {
  addDocument,
  setDocument,
  listDocuments,
  getDocument,
} from '@/lib/utils/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await listDocuments('notifications', [
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await setDocument(
        'notifications',
        notificationId,
        removeUndefined({ is_read: true, updated_at: serverTimestamp() }),
        { merge: true },
      );
      if (error) throw error;

      const { data: notification, error: fetchError } = await getDocument('notifications', notificationId);
      if (!notification) throw new Error('Notification not found after update.');
      if (fetchError) throw fetchError;
      return notification;
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
      const { data, error } = await addDocument('notifications', {
        ...notificationData,
        type: notificationData.type ?? 'info',
        is_read: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      } as Omit<Notification, 'id'>);
      if (error) throw error;
      if (!data) throw new Error('Failed to create notification.');
      return data;
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
