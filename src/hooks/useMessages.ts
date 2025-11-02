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
import { auth, db, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDoc, serializeDocs } from '@/lib/utils/firestore-serialize';
import { removeUndefined } from '@/lib/utils/remove-undfined';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  participants?: string[];
  property_id?: string | null;
  booking_id?: string | null;
  subject?: string | null;
  content: string;
  is_read: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export const useMessages = (userId?: string) => {
  return useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => {
      if (!userId) return [];

      const messagesRef = collection(db, COLLECTIONS.messages);
      const messagesQuery = query(
        messagesRef,
        where('participants', 'array-contains', userId),
        orderBy('created_at', 'desc'),
      );

      const snapshot = await getDocs(messagesQuery);
      return serializeDocs<Message>(snapshot);
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

      const messagesRef = collection(db, COLLECTIONS.messages);
      const docRef = await addDoc(messagesRef, {
        ...messageData,
        sender_id: currentUser.uid,
        participants: [currentUser.uid, messageData.recipient_id],
        is_read: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new Error('Failed to send message.');
      }
      return serializeDoc<Message>(snapshot);
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
      const messageRef = doc(db, COLLECTIONS.messages, messageId);
      await updateDoc(messageRef, removeUndefined({
        is_read: true,
        updated_at: serverTimestamp(),
      }));

      const snapshot = await getDoc(messageRef);
      if (!snapshot.exists()) {
        throw new Error('Message not found after update.');
      }
      return { message: serializeDoc<Message>(snapshot), userId };
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
