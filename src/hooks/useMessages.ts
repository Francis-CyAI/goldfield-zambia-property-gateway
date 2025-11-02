import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, serverTimestamp, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/constants/firebase';
import type { Message } from '@/lib/models';
import { addDocument, getDocument, listDocuments, setDocument } from '@/lib/utils/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export const useMessages = (userId?: string) => {
  return useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await listDocuments('messages', [
        where('participants', 'array-contains', userId),
        orderBy('created_at', 'desc'),
      ]);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (messageData: {
      recipient_id: string;
      property_id?: string;
      booking_id?: string;
      subject?: string;
      content: string;
    }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await addDocument('messages', {
        ...messageData,
        sender_id: currentUser.uid,
        participants: [currentUser.uid, messageData.recipient_id],
        is_read: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      if (error) throw error;
      if (!data) throw new Error('Failed to send message.');
      return data;
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['messages', message.sender_id] });
      queryClient.invalidateQueries({ queryKey: ['messages', message.recipient_id] });
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
    },
    onError: (error) => {
      console.error('Message error:', error);
      toast({
        title: 'Message failed',
        description: 'There was an error sending your message. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, userId }: { messageId: string; userId: string }) => {
      const { error } = await setDocument(
        'messages',
        messageId,
        removeUndefined({
        is_read: true,
        updated_at: serverTimestamp(),
        }),
      { merge: true });
      if (error) throw error;

      const { data: message, error: fetchError } = await getDocument('messages', messageId);
      if (!message) {
        throw new Error('Message not found after update.');
      }
      if (fetchError) throw fetchError;
      return { message, userId };
    },
    onSuccess: ({ message, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', userId] });
      message.participants?.forEach((participantId) => {
        queryClient.invalidateQueries({ queryKey: ['messages', participantId] });
      });
      queryClient.invalidateQueries({ queryKey: ['messages', message.sender_id] });
      queryClient.invalidateQueries({ queryKey: ['messages', message.recipient_id] });
    },
  });
};
