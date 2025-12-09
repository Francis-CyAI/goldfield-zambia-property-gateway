import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchaseRequests, useUpdatePurchaseRequestStatus } from '@/hooks/usePurchaseRequests';
import { useUserProperties } from '@/hooks/useProperties';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/constants/firebase';
import { setDocument } from '@/lib/utils/firebase';
import { deleteObject, ref } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Trash2, CheckCircle } from 'lucide-react';

const extractStoragePath = (fileUrl: string): string | null => {
  try {
    const url = new URL(fileUrl);
    const pathSegment = url.pathname.split('/o/')[1];
    if (!pathSegment) return null;
    const rawPath = pathSegment.split('?')[0];
    return decodeURIComponent(rawPath);
  } catch {
    return null;
  }
};

const deleteFilesByUrl = async (urls: (string | null | undefined)[]) => {
  const valid = urls.filter((u): u is string => Boolean(u));
  await Promise.all(
    valid.map(async (url) => {
      const path = extractStoragePath(url);
      if (path) {
        try {
          await deleteObject(ref(storage, path));
        } catch (err) {
          console.warn('Failed to delete file', err);
        }
      }
    }),
  );
};

const SellerSaleRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const sellerId = user?.uid ?? '';
  const { data: requests = [], isLoading } = usePurchaseRequests({ sellerId, onlyOpen: false });
  const { data: properties = [] } = useUserProperties(user?.uid);
  const updateStatus = useUpdatePurchaseRequestStatus();
  const [cleaningId, setCleaningId] = useState<string | null>(null);

  const soldOrPaid = useMemo(
    () => requests.filter((req) => req.status === 'sold' || req.status === 'seller_paid').length,
    [requests],
  );

  const handleConfirmPayout = (requestId: string, propertyId?: string, sellerId?: string | null) => {
    updateStatus.mutate({ requestId, status: 'seller_paid', propertyId, sellerId });
  };

  const handleCleanup = async (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;
    const property = properties.find((p) => p.id === request.property_id);
    setCleaningId(requestId);
    try {
      const urlsToDelete = [
        ...(property?.images ?? []),
        property?.seller_id_front_url,
        property?.seller_id_back_url,
        ...(property?.ownership_documents ?? []),
        request.buyer_id_front_url,
        request.buyer_id_back_url,
      ];
      await deleteFilesByUrl(urlsToDelete);

      if (property) {
        const { error } = await setDocument(
          'properties',
          property.id,
          {
            images: [],
            seller_id_front_url: null,
            seller_id_back_url: null,
            ownership_documents: [],
            data_deleted_at: serverTimestamp(),
            is_active: false,
          },
          { merge: true },
        );
        if (error) throw error;
      }

      const { error: purchaseError } = await setDocument(
        'purchaseRequests',
        requestId,
        {
          data_deleted_at: serverTimestamp(),
        },
        { merge: true },
      );
      if (purchaseError) throw purchaseError;

      toast({
        title: 'Data deleted',
        description: 'Your uploaded files for this sale have been removed.',
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: 'Cleanup failed',
        description: 'Could not remove files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCleaningId(null);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sale requests</CardTitle>
        <CardDescription>Track buyers interested in your for-sale listings.</CardDescription>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>Open: {requests.filter((req) => req.status === 'pending').length}</span>
          <span>Completed: {soldOrPaid}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    Loading sale requests...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    No purchase requests yet.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-semibold">{request.property_title || 'Untitled property'}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.created_at ? format(new Date(request.created_at), 'dd MMM yyyy') : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.buyer_name || request.buyer_email}</div>
                      <div className="text-xs text-muted-foreground">{request.buyer_phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'sold' || request.status === 'seller_paid' ? 'secondary' : 'outline'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {request.status === 'sold' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmPayout(request.id, request.property_id, request.seller_id)}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          I received payout
                        </Button>
                      )}
                      {(request.status === 'seller_paid' || request.status === 'sold') && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCleanup(request.id)}
                          disabled={cleaningId === request.id}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete uploaded data
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Once you confirm payment, please delete your uploaded IDs, ownership documents, and listing photos for this sale.
        </p>
      </CardContent>
    </Card>
  );
};

export default SellerSaleRequests;
