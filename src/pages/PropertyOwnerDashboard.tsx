
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import PropertyListings from '@/components/PropertyListings';
import BookingManagement from '@/components/BookingManagement';
import EarningsOverview from '@/components/EarningsOverview';
import CommissionTracker from '@/components/CommissionTracker';
import { useNavigate } from 'react-router-dom';

const PropertyOwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: properties = [], isLoading: propertiesLoading } = useUserProperties(user?.uid);
  const { data: bookings = [], isLoading: bookingsLoading } = useHostBookings(user?.uid);

  const activeProperties = properties.filter(p => p.is_active);
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, booking) => sum + booking.total_price, 0);

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
                  <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeProperties.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {properties.length - activeProperties.length} inactive
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
                  <Button 
                    onClick={() => navigate('/list-property')} 
                    className="w-full"
                    size="sm"
                  >
                    Add Property
                  </Button>
                </CardContent>
              </Card>
            </div>

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

          <TabsContent value="earnings">
            <EarningsOverview />
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
