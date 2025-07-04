
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  DollarSign,
  TrendingUp,
  Users,
  Plus
} from 'lucide-react';
import PropertyListings from '@/components/PropertyListings';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import GuestInquiries from '@/components/GuestInquiries';
import PayoutTracking from '@/components/PayoutTracking';
import EarningsOverview from '@/components/EarningsOverview';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/contexts/AuthContext';

const PropertyOwnerDashboard = () => {
  const { user } = useAuth();
  const { data: properties = [], isLoading } = useProperties();

  // Filter properties owned by current user
  const userProperties = properties.filter(property => property.host_id === user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Property Owner Dashboard</h1>
        <Button onClick={() => window.location.href = '/list-property'} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Property
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProperties.length}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K15,240</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Inquiries
            <Badge variant="secondary" className="ml-1">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <PropertyListings properties={userProperties} />
        </TabsContent>

        <TabsContent value="calendar">
          <AvailabilityCalendar properties={userProperties} />
        </TabsContent>

        <TabsContent value="inquiries">
          <GuestInquiries />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutTracking />
        </TabsContent>

        <TabsContent value="earnings">
          <EarningsOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyOwnerDashboard;
