
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  TrendingUp, 
  MessageSquare,
  Settings,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import PropertyListings from '../components/PropertyListings';
import BookingManagement from '../components/BookingManagement';
import EarningsOverview from '../components/EarningsOverview';
import PropertyAnalyticsDashboard from '../components/PropertyAnalyticsDashboard';
import GuestInquiries from '../components/GuestInquiries';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import SafetyGuidelinesCard from '../components/reviews/SafetyGuidelinesCard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProperties } from '@/hooks/useProperties';

const PropertyOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const { data: properties = [], isLoading } = useUserProperties(user?.id);

  console.log('User properties:', properties);

  // Calculate stats from actual data
  const stats = {
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.is_active).length,
    activeBookings: 0, // This would come from bookings data
    monthlyEarnings: 0, // This would come from earnings data
    occupancyRate: 0, // This would be calculated from bookings
    averageRating: 0, // This would come from reviews data
    totalViews: 0 // This would come from analytics data
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Owner Dashboard</h1>
          <p className="text-gray-600">Manage your properties, bookings, and earnings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">ZMW {stats.monthlyEarnings.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EarningsOverview />
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" 
                          onClick={() => window.location.href = '/list-property'}>
                      <div className="flex items-center space-x-3">
                        <Plus className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-medium">Add Property</h3>
                          <p className="text-sm text-gray-600">List a new property</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setActiveTab('properties')}>
                      <div className="flex items-center space-x-3">
                        <Edit className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">Manage Properties</h3>
                          <p className="text-sm text-gray-600">Edit your listings</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6 mt-6">
            <PropertyListings properties={properties} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6 mt-6">
            <BookingManagement />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6 mt-6">
            <EarningsOverview />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <PropertyAnalyticsDashboard propertyId="sample-property-id" />
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6 mt-6">
            <GuestInquiries />
          </TabsContent>

          <TabsContent value="safety" className="space-y-6 mt-6">
            <SafetyGuidelinesCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyOwnerDashboard;
