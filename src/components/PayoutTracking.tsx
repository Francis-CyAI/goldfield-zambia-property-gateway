
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';

const PayoutTracking = () => {
  // Mock data for demonstration
  const payouts = [
    {
      id: '1',
      property_title: 'Modern Apartment in Lusaka',
      amount_kwacha: 2480,
      amount_usd: 120,
      exchange_rate: 20.67,
      payout_date: '2024-01-15',
      payout_method: 'bank_transfer',
      status: 'completed',
      transaction_id: 'TXN-2024-001',
      booking_ref: 'BK-2024-001'
    },
    {
      id: '2',
      property_title: 'Cozy Studio in Ndola',
      amount_kwacha: 1860,
      amount_usd: 90,
      exchange_rate: 20.67,
      payout_date: '2024-01-10',
      payout_method: 'mobile_money',
      status: 'completed',
      transaction_id: 'TXN-2024-002',
      booking_ref: 'BK-2024-002'
    },
    {
      id: '3',
      property_title: 'Villa with Pool in Livingstone',
      amount_kwacha: 4960,
      amount_usd: 240,
      exchange_rate: 20.67,
      payout_date: '2024-01-20',
      payout_method: 'bank_transfer',
      status: 'pending',
      booking_ref: 'BK-2024-003'
    }
  ];

  const totalEarnings = payouts.reduce((sum, payout) => sum + payout.amount_kwacha, 0);
  const completedPayouts = payouts.filter(p => p.status === 'completed');
  const pendingPayouts = payouts.filter(p => p.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <CreditCard className="h-4 w-4" />;
      case 'mobile_money':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payout Tracking</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payouts</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayouts.length}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayouts.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payout</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K{Math.round(totalEarnings / payouts.length).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            Track your earnings and payout status across all properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                    {getPaymentMethodIcon(payout.payout_method)}
                  </div>
                  <div>
                    <h4 className="font-medium">{payout.property_title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{payout.booking_ref}</span>
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(payout.payout_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">K{payout.amount_kwacha.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      ${payout.amount_usd} USD (Rate: {payout.exchange_rate})
                    </div>
                  </div>
                  <Badge variant={getStatusColor(payout.status)}>
                    {payout.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {payouts.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <DollarSign className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No payouts yet</h3>
              <p className="text-muted-foreground">
                Your payout history will appear here once you start receiving bookings
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PayoutTracking;
