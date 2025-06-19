
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  property_id?: string;
  booking_id?: string;
  subject?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const useMessages = (userId?: string) => {
  return useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId!},recipient_id.eq.${userId!}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Message[];
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
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          ...messageData,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
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
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};
