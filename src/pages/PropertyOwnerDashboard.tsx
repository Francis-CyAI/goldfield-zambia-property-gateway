
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  Users, 
  Plus,
  TrendingUp,
  MessageSquare,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProperties } from '@/hooks/useProperties';
import { useHostBookings } from '@/hooks/useBookings';
import { useListerEarnings, useListerEarningEntries } from '@/hooks/useListerEarnings';
import PropertyListings from '@/components/PropertyListings';
import BookingManagement from '@/components/BookingManagement';
import EarningsOverview from '@/components/EarningsOverview';
import CommissionTracker from '@/components/CommissionTracker';
import { useNavigate } from 'react-router-dom';
import { useListerEarnings, useListerEarningEntries } from '@/hooks/useListerEarnings';
import { useListerWithdrawals } from '@/hooks/useListerWithdrawals';
import { useInitiateWithdrawal } from '@/hooks/useWithdrawal';

const calculateLencoFeeUi = (amount: number) => {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (amount < 1000) return 5;
  if (amount < 5000) return 15;
  if (amount < 10000) return 25;
  return 35;
};

const PropertyOwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawOperator, setWithdrawOperator] = useState('airtel');
  
  const { data: properties = [], isLoading: propertiesLoading } = useUserProperties(user?.uid);
  const { data: bookings = [], isLoading: bookingsLoading } = useHostBookings(user?.uid);
  const { data: listerEarnings } = useListerEarnings(user?.uid);
  const { data: earningEntries = [], isLoading: earningEntriesLoading } = useListerEarningEntries(user?.uid);
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useListerWithdrawals(user?.uid);
  const initiateWithdrawal = useInitiateWithdrawal();

  const activeProperties = properties.filter(
    (p) => p.is_active && (p.approval_status ?? 'pending') === 'approved',
  );
  const pendingProperties = properties.filter(
    (p) => (p.approval_status ?? 'pending') === 'pending',
  );
  const declinedProperties = properties.filter((p) => p.approval_status === 'declined');
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, booking) => sum + booking.total_price, 0);
  const parsedWithdrawAmount = Number(withdrawAmount) || 0;
  const estimatedLencoFee = calculateLencoFeeUi(parsedWithdrawAmount);
  const totalDeducted = parsedWithdrawAmount + estimatedLencoFee;
  const canSubmitWithdrawal =
    parsedWithdrawAmount > 0 &&
    totalDeducted <= availableBalance &&
    /^\d{9,15}$/.test(withdrawPhone) &&
    !initiateWithdrawal.isPending;

  const handleWithdrawalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmitWithdrawal) return;
    initiateWithdrawal.mutate(
      { amount: parsedWithdrawAmount, msisdn: withdrawPhone, operator: withdrawOperator },
      {
        onSuccess: () => {
          setWithdrawAmount('');
          setWithdrawPhone('');
        },
      },
    );
  };
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please log in to access your property owner dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Owner Dashboard</h1>
          <p className="text-gray-600">Manage your properties, bookings, and earnings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live Listings</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeProperties.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingProperties.length} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingBookings} pending, {confirmedBookings} confirmed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">K{totalEarnings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">From completed bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => navigate('/list-property')} 
                      className="w-full"
                      size="sm"
                    >
                      Add Property
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      New listings stay pending until reviewed by our team.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Listing Review Status</CardTitle>
                <CardDescription>Track pending or declined submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold">{pendingProperties.length}</p>
                    <p className="text-xs text-muted-foreground">We will notify you once approved.</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">{activeProperties.length}</p>
                    <p className="text-xs text-muted-foreground">Live on the marketplace.</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Declined</p>
                    <p className="text-2xl font-bold">{declinedProperties.length}</p>
                    <p className="text-xs text-muted-foreground">See feedback on each listing card.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Summary</CardTitle>
                <CardDescription>Your current payout snapshot.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-semibold">ZMW {availableBalance.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Gross</p>
                  <p className="text-2xl font-semibold">ZMW {totalGross.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Fees</p>
                  <p className="text-2xl font-semibold">ZMW {totalFees.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Earnings</CardTitle>
                <CardDescription>Latest payouts recorded per booking</CardDescription>
              </CardHeader>
              <CardContent>
                {earningEntriesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse h-12 bg-gray-100 rounded" />
                    ))}
                  </div>
                ) : earningEntries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No earnings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {earningEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <p className="font-medium text-sm">Booking #{entry.booking_id}</p>
                          <p className="text-xs text-muted-foreground">
                            Earned{' '}
                            {entry.earned_at ? new Date(entry.earned_at).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">ZMW {entry.net_amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Fees: ZMW {(entry.platform_fee + entry.lenco_fee).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest booking requests and confirmations</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No bookings yet. Your first booking will appear here.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium text-sm">{booking.property?.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.check_in} to {booking.check_out}
                            </p>
                          </div>
                          <Badge variant={
                            booking.status === 'pending' ? 'default' :
                            booking.status === 'confirmed' ? 'secondary' :
                            booking.status === 'completed' ? 'outline' : 'destructive'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Performance</CardTitle>
                  <CardDescription>Top performing properties this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {propertiesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : activeProperties.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No active properties. Add your first property to start earning.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activeProperties.slice(0, 5).map((property) => (
                        <div key={property.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium text-sm">{property.title}</p>
                            <p className="text-xs text-muted-foreground">{property.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">K{property.price_per_night}/night</p>
                            <p className="text-xs text-muted-foreground">
                              {property.max_guests} guests
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <PropertyListings properties={properties} isLoading={propertiesLoading} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <EarningsOverview />

            <Card>
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
                <CardDescription>Available balance: ZMW {availableBalance.toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleWithdrawalSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Amount (ZMW)</label>
                      <Input
                        type="number"
                        min="1"
                        value={withdrawAmount}
                        onChange={(event) => setWithdrawAmount(event.target.value)}
                        placeholder="e.g. 500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Mobile number</label>
                      <Input
                        value={withdrawPhone}
                        onChange={(event) => setWithdrawPhone(event.target.value)}
                        placeholder="0972123456"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Operator</label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={withdrawOperator}
                      onChange={(event) => setWithdrawOperator(event.target.value)}
                    >
                      <option value="airtel">Airtel</option>
                      <option value="mtn">MTN</option>
                      <option value="zamtel">Zamtel</option>
                    </select>
                  </div>

                  <div className="rounded-lg border p-4 bg-gray-50">
                    <p className="text-sm text-gray-600">Summary</p>
                    <div className="flex justify-between text-sm pt-2">
                      <span>You will receive</span>
                      <span className="font-semibold">ZMW {parsedWithdrawAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Lenco fee</span>
                      <span>ZMW {estimatedLencoFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Total deducted</span>
                      <span>ZMW {totalDeducted.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button type="submit" disabled={!canSubmitWithdrawal} className="w-full md:w-auto">
                    {initiateWithdrawal.isPending ? 'Submitting...' : 'Withdraw'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Your recent payout requests.</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse h-12 bg-gray-100 rounded" />
                    ))}
                  </div>
                ) : withdrawals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No withdrawals yet.</p>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="border rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {withdrawal.reference} · ZMW {withdrawal.amount_requested.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {withdrawal.created_at ? new Date(withdrawal.created_at).toLocaleString() : ''}
                          </p>
                        </div>
                        <Badge variant={withdrawal.status === 'failed' ? 'destructive' : withdrawal.status === 'completed' ? 'secondary' : 'outline'}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionTracker />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => navigate('/subscription')} className="w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Users className="h-4 w-4 mr-2" />
                  Account Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyOwnerDashboard;
