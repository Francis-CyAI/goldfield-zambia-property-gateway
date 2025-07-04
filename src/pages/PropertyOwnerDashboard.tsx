
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import PropertyListings from '@/components/PropertyListings';
import GuestInquiries from '@/components/GuestInquiries';
import PayoutTracking from '@/components/PayoutTracking';
import EarningsOverview from '@/components/EarningsOverview';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  BarChart3,
  Plus,
  Users,
  TrendingUp
} from 'lucide-react';

const PropertyOwnerDashboard = () => {
  const { user } = useAuth();
  const { data: properties = [], isLoading } = useProperties({ host_id: user?.id });
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your properties and track your earnings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">K45,200</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="properties" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Properties</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Inquiries</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Payouts</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <PropertyListings properties={properties} />
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Property Calendar</CardTitle>
                <CardDescription>
                  Manage availability and pricing for your properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Property</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                      >
                        <option value="">Choose a property</option>
                        {properties.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedPropertyId && (
                      <AvailabilityCalendar propertyId={selectedPropertyId} />
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No properties available for calendar management.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <GuestInquiries />
          </TabsContent>

          <TabsContent value="payouts">
            <PayoutTracking />
          </TabsContent>

          <TabsContent value="analytics">
            <EarningsOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyOwnerDashboard;
