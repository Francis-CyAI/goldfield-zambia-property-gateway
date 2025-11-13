import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Plus, 
  MapPin, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Crown,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserProperties } from '@/hooks/useProperties';
import { useUserSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';

const UserDashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.uid);
  const { data: properties = [], isLoading } = useUserProperties(user?.uid);
  const { data: userSubscription } = useUserSubscription();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = user?.displayName
    || (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : undefined)
    || user?.email?.split('@')[0] || 'User';

  // Get subscription limits
  const currentTier = userSubscription?.subscription_tier;
  const maxProperties = currentTier?.max_properties || 0;
  const maxBookings = currentTier?.max_bookings || 0;
  const isTrialActive = userSubscription?.trial_ends_at && new Date(userSubscription.trial_ends_at) > new Date();
  const trialDaysLeft = isTrialActive 
    ? Math.ceil((new Date(userSubscription.trial_ends_at!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Check if user can add more properties
  const canAddProperty = maxProperties === -1 || properties.length < maxProperties;

  // Mock data for demonstration
  const dashboardStats = {
    totalProperties: properties.length,
    activeBookings: 5,
    totalRevenue: 2850,
    averageRating: 4.6,
    reviewCount: 23,
    occupancyRate: 78
  };

  const recentActivities = [
    {
      id: 1,
      type: 'booking',
      message: 'New booking received for Obama Luxury Apartment',
      time: '2 hours ago',
      status: 'new'
    },
    {
      id: 2,
      type: 'review',
      message: 'You received a 5-star review from John M.',
      time: '5 hours ago',
      status: 'positive'
    },
    {
      id: 3,
      type: 'payment',
      message: 'Payment of K450 received from booking #OBA-2024-001',
      time: '1 day ago',
      status: 'completed'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold luxury-text-gradient">
                {getGreeting()}, {displayName}!
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome to your property management dashboard - Lusaka, Obama
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                <MapPin className="h-3 w-3 mr-1" />
                Obama, Lusaka
              </Badge>
              {canAddProperty ? (
                <Link to="/list-property">
                  <Button className="luxury-gradient text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    List New Property
                  </Button>
                </Link>
              ) : (
                <Link to="/subscription">
                  <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Status Alert */}
        {isTrialActive && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Free Trial Active - {trialDaysLeft} days remaining
                    </p>
                    <p className="text-sm text-amber-600">
                      Trial expires on {format(new Date(userSubscription.trial_ends_at!), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Link to="/subscription">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    View Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Property Limit Warning */}
        {!canAddProperty && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      Property Limit Reached
                    </p>
                    <p className="text-sm text-red-600">
                      You've reached your limit of {maxProperties} properties. Upgrade to add more.
                    </p>
                  </div>
                </div>
                <Link to="/subscription">
                  <Button size="sm" variant="destructive">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                {maxProperties === -1 ? 'Unlimited' : `${dashboardStats.totalProperties} of ${maxProperties} used`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeBookings}</div>
              <p className="text-xs text-muted-foreground">
                {maxBookings === -1 ? 'Unlimited' : `${dashboardStats.activeBookings} of ${maxBookings} monthly limit`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">K{dashboardStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                From {dashboardStats.reviewCount} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">My Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest property and booking updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg border">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'new' ? 'bg-blue-500' :
                          activity.status === 'positive' ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        {activity.status === 'new' && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">New</Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary & Quick Actions */}
              <div className="space-y-6">
                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      {currentTier?.name === 'Pro' ? <Crown className="h-4 w-4 mr-2 text-purple-600" /> : 
                       currentTier?.name === 'Standard' ? <Zap className="h-4 w-4 mr-2 text-blue-600" /> : 
                       <Crown className="h-4 w-4 mr-2 text-gray-600" />}
                      Current Plan: {currentTier?.name || 'Free Trial'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold">
                      {currentTier?.price === 0 ? 'Free' : `$${currentTier?.price}/month`}
                    </div>
                    {isTrialActive && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Trial Progress</span>
                          <span>{30 - trialDaysLeft} of 30 days</span>
                        </div>
                        <Progress value={((30 - trialDaysLeft) / 30) * 100} className="h-2" />
                      </div>
                    )}
                    <Link to="/subscription" className="block">
                      <Button variant="outline" className="w-full">
                        {isTrialActive ? 'Choose Plan' : 'Manage Subscription'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Occupancy Rate</span>
                        <span className="font-medium">{dashboardStats.occupancyRate}%</span>
                      </div>
                      <Progress value={dashboardStats.occupancyRate} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Guest Satisfaction</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Response Rate</span>
                        <span className="font-medium">96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {canAddProperty ? (
                      <Link to="/list-property" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          List New Property
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/subscription" className="block">
                        <Button variant="outline" className="w-full justify-start border-amber-500 text-amber-600 hover:bg-amber-50">
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to Add More
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Messages
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Calendar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            {properties.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Listed</h3>
                  <p className="text-gray-600 mb-6">
                    Start earning by listing your first property in Obama, Lusaka
                  </p>
                  <Link to="/list-property">
                    <Button className="luxury-gradient text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      List Your First Property
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {properties.map((property) => (
                  <Card key={property.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                          <p className="text-gray-600 mb-4">{property.location}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {property.max_guests} guests
                            </span>
                            <span className="flex items-center">
                              <Home className="h-4 w-4 mr-1" />
                              {property.bedrooms} bed, {property.bathrooms} bath
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            K{property.price_per_night}
                          </p>
                          <p className="text-sm text-gray-500">per night</p>
                          <Badge className={`mt-2 ${
                            property.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {property.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Management</h3>
                <p className="text-gray-600">
                  Booking management features will be available here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  Manage your subscription plan and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-luxury-gold mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Subscription Settings</h3>
                  <p className="text-gray-600 mb-6">
                    View and manage your subscription plan
                  </p>
                  <Link to="/subscription">
                    <Button className="luxury-gradient text-white">
                      Manage Subscription
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="text-center py-12">
                {currentTier?.analytics_access ? (
                  <>
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-600">
                      Detailed analytics and insights will be available here
                    </p>
                  </>
                ) : (
                  <>
                    <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Available with Premium Plans</h3>
                    <p className="text-gray-600 mb-6">
                      Upgrade your plan to access detailed analytics and insights
                    </p>
                    <Link to="/subscription">
                      <Button className="luxury-gradient text-white">
                        Upgrade Plan
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
