import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderBy, serverTimestamp, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/constants/firebase';
import type { Property, PurchaseRequest } from '@/lib/models';
import { addDocument, listDocuments, setDocument } from '@/lib/utils/firebase';

type PurchaseRequestFilters = {
  propertyId?: string;
  sellerId?: string;
  onlyOpen?: boolean;
};

const createNotification = async (userId: string, title: string, message: string, relatedId?: string | null) => {
  const { error } = await addDocument('notifications', {
    user_id: userId,
    title,
    message,
    related_id: relatedId ?? null,
    type: 'info',
    is_read: false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  if (error) throw error;
};

const notifyAdmins = async (message: string, relatedId?: string | null) => {
  const { data: admins } = await listDocuments('adminUsers', [where('is_active', '==', true)]);
  await Promise.all(
    (admins ?? []).map(async (admin: any) => {
      if (admin?.user_id) {
        await createNotification(admin.user_id, 'New property purchase request', message, relatedId);
      }
    }),
  );
};

export const usePurchaseRequests = (filters: PurchaseRequestFilters = {}) => {
  const shouldEnable =
    (filters.sellerId === undefined && filters.propertyId === undefined) ||
    Boolean(filters.sellerId || filters.propertyId);

  return useQuery({
    queryKey: ['purchase-requests', filters],
    queryFn: async () => {
      const constraints = [orderBy('created_at', 'desc')];
      if (filters.propertyId) {
        constraints.push(where('property_id', '==', filters.propertyId));
      }
      if (filters.sellerId) {
        constraints.push(where('seller_id', '==', filters.sellerId));
      }

      const { data, error } = await listDocuments('purchaseRequests', constraints);
      if (error) throw error;
      const requests = data ?? [];
      return filters.onlyOpen ? requests.filter((req) => req.status !== 'cancelled') : requests;
    },
    enabled: shouldEnable,
  });
};

export const useCreatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      property,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerNotes,
      buyerIdFrontUrl,
      buyerIdBackUrl,
    }: {
      property: Property;
      buyerName: string;
      buyerEmail: string;
      buyerPhone: string;
      buyerNotes?: string;
      buyerIdFrontUrl: string;
      buyerIdBackUrl: string;
    }) => {
      const currentUser = auth.currentUser;
      const payload = {
        property_id: property.id,
        property_title: property.title,
        seller_id: property.host_id ?? null,
        buyer_user_id: currentUser?.uid ?? null,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        buyer_notes: buyerNotes ?? null,
        buyer_id_front_url: buyerIdFrontUrl,
        buyer_id_back_url: buyerIdBackUrl,
        status: 'pending' as PurchaseRequest['status'],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const { data, error } = await addDocument('purchaseRequests', payload);
      if (error) throw error;
      const createdRequest = data as PurchaseRequest | null;

      const message = `${buyerName || 'A buyer'} wants to purchase "${property.title}".`;
      await notifyAdmins(message, createdRequest?.id ?? null);
      if (property.host_id) {
        await createNotification(
          property.host_id,
          'New purchase request',
          `Buyer ${buyerName || buyerEmail} wants to purchase ${property.title}.`,
          createdRequest?.id ?? null,
        );
      }

      return createdRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      toast({
        title: 'Request sent',
        description: 'The admin has been notified. They will contact you to continue offline.',
      });
    },
    onError: (error) => {
      console.error('Purchase request error:', error);
      toast({
        title: 'Could not submit request',
        description: 'Please try again after a moment.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePurchaseRequestStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      propertyId,
      sellerId,
    }: {
      requestId: string;
      status: PurchaseRequest['status'];
      propertyId?: string;
      sellerId?: string | null;
    }) => {
      await setDocument(
        'purchaseRequests',
        requestId,
        {
          status,
          updated_at: serverTimestamp(),
          sold_at: status === 'sold' ? serverTimestamp() : undefined,
        },
        { merge: true },
      );

      const shouldCloseListing = status === 'sold' || status === 'seller_paid';
      if (propertyId && shouldCloseListing) {
        await setDocument(
          'properties',
          propertyId,
          {
            sale_status: 'sold',
            is_active: false,
            updated_at: serverTimestamp(),
          },
          { merge: true },
        );
      }

      if (status === 'sold' && sellerId) {
        await createNotification(
          sellerId,
          'Your property was marked as sold',
          'Contact the site owner to arrange your payout and confirm once received.',
          requestId,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Status updated',
        description: 'The purchase request status has been updated.',
      });
    },
    onError: (error) => {
      console.error('Update purchase request status error:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update the purchase request. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
