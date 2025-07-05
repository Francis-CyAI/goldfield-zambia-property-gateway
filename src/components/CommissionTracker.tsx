
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  FileText,
  Download
} from 'lucide-react';
import { useHostCommissions } from '@/hooks/useCommissions';
import { format } from 'date-fns';

const CommissionTracker = () => {
  const { data: commissions = [], isLoading } = useHostCommissions();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Commission Tracking</h2>
        </div>
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

  const totalCommissions = commissions.reduce((sum, commission) => 
    sum + parseFloat(commission.commission_amount.toString()), 0
  );

  const pendingCommissions = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, commission) => sum + parseFloat(commission.commission_amount.toString()), 0);

  const processedCommissions = commissions
    .filter(c => c.status === 'processed')
    .reduce((sum, commission) => sum + parseFloat(commission.commission_amount.toString()), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Commission Tracking</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {commissions.length} booking{commissions.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">K{pendingCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">K{processedCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Details */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>
            Track commissions charged on your completed bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Commissions Yet</h3>
              <p className="text-muted-foreground">
                Commissions will appear here when guests complete their bookings
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium">{commission.property?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {commission.property?.location}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Booking: {commission.booking?.check_in} to {commission.booking?.check_out} • 
                      {commission.booking?.guest_count} guest{commission.booking?.guest_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        commission.status === 'pending' ? 'default' : 
                        commission.status === 'processed' ? 'secondary' : 'outline'
                      }>
                        {commission.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">
                        {(commission.commission_rate * 100).toFixed(1)}% of K{commission.booking_amount}
                      </div>
                      <div className="font-semibold">
                        K{parseFloat(commission.commission_amount.toString()).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(commission.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionTracker;
