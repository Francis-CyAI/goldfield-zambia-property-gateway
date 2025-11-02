import React from 'react';
import { usePlatformCommissions } from '@/hooks/useCommissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp } from 'lucide-react';

const AdminCommissionTracking = () => {
  const { data: commissions = [], isLoading } = usePlatformCommissions();

  const totals = commissions.reduce(
    (acc, commission) => {
      acc.total += commission.commission_amount;
      acc.pending += commission.status === 'pending' ? commission.commission_amount : 0;
      acc.processed += commission.status !== 'pending' ? commission.commission_amount : 0;
      return acc;
    },
    { total: 0, pending: 0, processed: 0 },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Commission Tracking
        </CardTitle>
        <CardDescription>Monitor platform commissions collected across bookings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">K{totals.total.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Across all bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">K{totals.pending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processed / Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">K{totals.processed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Completed commissions</p>
            </CardContent>
          </Card>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Loading commissions...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && commissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No commission records found.
                  </TableCell>
                </TableRow>
              )}
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    <div className="font-medium">{commission.booking_id}</div>
                    <div className="text-xs text-muted-foreground">
                      Rate: {(commission.commission_rate * 100).toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{commission.property?.title ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">
                      {commission.property?.location ?? '—'}
                    </div>
                  </TableCell>
                  <TableCell>K{commission.commission_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        commission.status === 'pending'
                          ? 'outline'
                          : commission.status === 'processed'
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {commission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {commission.created_at ? new Date(commission.created_at).toLocaleDateString() : '—'}
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

export default AdminCommissionTracking;

