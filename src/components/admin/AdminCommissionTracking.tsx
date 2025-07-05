
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DollarSign, TrendingUp, Users, Calendar, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

interface Commission {
  id: string;
  booking_amount: number;
  commission_amount: number;
  commission_rate: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  host_id: string;
  property_id: string;
  booking_id: string | null;
  booking?: {
    id: string;
    check_in: string;
    check_out: string;
  };
  property?: {
    title: string;
    location: string;
  };
  host?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

const AdminCommissionTracking = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [stats, setStats] = useState({
    totalCommissions: 0,
    pendingCommissions: 0,
    processedCommissions: 0,
    totalAmount: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCommissions();
  }, [statusFilter, dateRange]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('platform_commissions')
        .select(`
          *,
          booking:bookings(
            id,
            check_in,
            check_out
          ),
          property:properties(
            title,
            location
          ),
          host:profiles!platform_commissions_host_id_fkey(
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }

      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedCommissions: Commission[] = (data || []).map(commission => ({
        ...commission,
        host: Array.isArray(commission.host) ? commission.host[0] : commission.host
      }));

      setCommissions(formattedCommissions);
      calculateStats(formattedCommissions);
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch commission data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (commissions: Commission[]) => {
    const stats = {
      totalCommissions: commissions.length,
      pendingCommissions: commissions.filter(c => c.status === 'pending').length,
      processedCommissions: commissions.filter(c => c.status === 'processed').length,
      totalAmount: commissions.reduce((sum, c) => sum + c.commission_amount, 0)
    };
    setStats(stats);
  };

  const updateCommissionStatus = async (commissionId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'processed') {
        updates.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('platform_commissions')
        .update(updates)
        .eq('id', commissionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Commission ${newStatus} successfully`,
      });

      fetchCommissions();
    } catch (error) {
      console.error('Error updating commission status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update commission status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'processed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const exportCommissions = () => {
    const csvContent = [
      ['Date', 'Host', 'Property', 'Booking Amount', 'Commission Rate', 'Commission Amount', 'Status'],
      ...commissions.map(commission => [
        new Date(commission.created_at).toLocaleDateString(),
        commission.host ? `${commission.host.first_name} ${commission.host.last_name}` : 'Unknown Host',
        commission.property?.title || 'Unknown Property',
        commission.booking_amount.toFixed(2),
        `${(commission.commission_rate * 100).toFixed(1)}%`,
        commission.commission_amount.toFixed(2),
        commission.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commission Tracking</h2>
          <p className="text-muted-foreground">
            Monitor and manage platform commission payments
          </p>
        </div>
        <Button onClick={exportCommissions} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCommissions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processedCommissions}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Commission earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-48">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Transactions</CardTitle>
          <CardDescription>
            Recent commission payments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading commissions...</div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No commission data found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Booking Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(commission.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {commission.host ? (
                          <div>
                            <div className="font-medium">
                              {commission.host.first_name} {commission.host.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {commission.host.first_name} {commission.host.last_name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown Host</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {commission.property?.title || 'Unknown Property'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {commission.property?.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${commission.booking_amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            ${commission.commission_amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(commission.commission_rate * 100).toFixed(1)}% rate
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(commission.status)}>
                          {commission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {commission.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateCommissionStatus(commission.id, 'processed')}
                            >
                              Process
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateCommissionStatus(commission.id, 'failed')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {commission.status === 'processed' && commission.processed_at && (
                          <div className="text-xs text-muted-foreground">
                            Processed: {new Date(commission.processed_at).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommissionTracking;
