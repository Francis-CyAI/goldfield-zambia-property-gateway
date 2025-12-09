import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePurchaseRequests, useUpdatePurchaseRequestStatus } from '@/hooks/usePurchaseRequests';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Phone, Mail, CheckCircle, Timer } from 'lucide-react';

const statusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'contacted':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Contacted</Badge>;
    case 'sold':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Sold</Badge>;
    case 'seller_paid':
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Seller paid</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const AdminPurchaseRequests = () => {
  const { data: requests = [], isLoading } = usePurchaseRequests();
  const updateStatus = useUpdatePurchaseRequestStatus();
  const { toast } = useToast();

  const openCount = useMemo(
    () => requests.filter((req) => req.status === 'pending' || req.status === 'contacted').length,
    [requests],
  );

  const soldCount = useMemo(() => requests.filter((req) => req.status === 'sold').length, [requests]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Requests</CardTitle>
        <CardDescription>Buyers who want to purchase properties (offline flow, no payments collected here).</CardDescription>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>
            Open: <strong>{openCount}</strong>
          </span>
          <span>
            Sold: <strong>{soldCount}</strong>
          </span>
          <span>
            Total: <strong>{requests.length}</strong>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Loading purchase requests...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No purchase requests yet.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">{request.property_title || 'Untitled property'}</div>
                      <div className="text-xs text-muted-foreground truncate">{request.property_id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold">{request.buyer_name || 'Unknown buyer'}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {request.buyer_phone}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {request.buyer_email}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {request.created_at ? format(new Date(request.created_at), 'dd MMM yyyy, HH:mm') : '—'}
                    </TableCell>
                    <TableCell>{statusBadge(request.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {request.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateStatus.mutate({ requestId: request.id, status: 'contacted', sellerId: request.seller_id })
                          }
                        >
                          <Timer className="h-3 w-3 mr-1" />
                          Mark contacted
                        </Button>
                      )}
                      {request.status !== 'sold' && request.status !== 'seller_paid' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!window.confirm('Mark this property as sold? This will notify the seller.')) return;
                            updateStatus.mutate(
                              {
                                requestId: request.id,
                                status: 'sold',
                                propertyId: request.property_id,
                                sellerId: request.seller_id,
                              },
                              {
                                onError: () =>
                                  toast({
                                    title: 'Failed to mark sold',
                                    description: 'Please try again.',
                                    variant: 'destructive',
                                  }),
                              },
                            );
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark sold
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPurchaseRequests;
