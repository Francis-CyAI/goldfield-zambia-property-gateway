
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Commission {
  id: string;
  booking_amount: number;
  commission_amount: number;
  commission_rate: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  booking: {
    check_in: string;
    check_out: string;
    guest_id: string;
  };
  property: {
    title: string;
    location: string;
  };
  host: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

const AdminCommissionTracking = () => {
  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: async () => {
      console.log('Fetching all platform commissions for admin');
      const { data, error } = await supabase
        .from('platform_commissions')
        .select(`
          *,
          bookings!inner (
            check_in,
            check_out,
            guest_id
          ),
          properties!inner (
            title,
            location,
            profiles!properties_host_id_fkey (
              email,
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commissions:', error);
        throw error;
      }

      return data.map(commission => ({
        ...commission,
        booking: commission.bookings,
        property: {
          ...commission.properties,
          host: commission.properties.profiles
        },
        host: commission.properties.profiles
      }));
    },
  });

  const totalCommissions = commissions.reduce((sum, commission) => 
    sum + parseFloat(commission.commission_amount.toString()), 0
  );

  const pendingCommissions = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, commission) => sum + parseFloat(commission.commission_amount.toString()), 0);

  const processedCommissions = commissions
    .filter(c => c.status === 'processed')
    .reduce((sum, commission) => sum + parseFloat(commission.commission_amount.toString()), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {commissions.length} commission{commissions.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">K{pendingCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">K{processedCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Platform Commission Tracking</span>
              </CardTitle>
              <CardDescription>
                Monitor all commission transactions across the platform
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Booking Period</TableHead>
                  <TableHead>Booking Amount</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Commission Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{commission.property.title}</div>
                        <div className="text-sm text-gray-500">{commission.property.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {commission.host?.first_name && commission.host?.last_name 
                            ? `${commission.host.first_name} ${commission.host.last_name}`
                            : commission.host?.email
                          }
                        </div>
                        <div className="text-sm text-gray-500">{commission.host?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(commission.booking.check_in), 'MMM dd')} - 
                        {format(new Date(commission.booking.check_out), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>K{parseFloat(commission.booking_amount.toString()).toFixed(2)}</TableCell>
                    <TableCell>{(commission.commission_rate * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-semibold">
                      K{parseFloat(commission.commission_amount.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        commission.status === 'pending' ? 'default' : 
                        commission.status === 'processed' ? 'secondary' : 'outline'
                      }>
                        {commission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(commission.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommissionTracking;
