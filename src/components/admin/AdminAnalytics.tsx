
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      console.log('Fetching admin analytics data');
      
      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get property count
      const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Get active property count
      const { count: activePropertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get booking count
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Get total commission revenue
      const { data: commissionData } = await supabase
        .from('platform_commissions')
        .select('commission_amount');

      const totalCommissionRevenue = commissionData?.reduce((sum, item) => 
        sum + parseFloat(item.commission_amount.toString()), 0
      ) || 0;

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: recentProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: recentBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      return {
        totalUsers: userCount || 0,
        totalProperties: propertyCount || 0,
        activeProperties: activePropertyCount || 0,
        totalBookings: bookingCount || 0,
        totalCommissionRevenue,
        recentActivity: {
          newUsers: recentUsers || 0,
          newProperties: recentProperties || 0,
          newBookings: recentBookings || 0,
        }
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

  const stats = [
    {
      title: "Total Users",
      value: analytics?.totalUsers || 0,
      change: `+${analytics?.recentActivity.newUsers || 0} this week`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Properties",
      value: analytics?.totalProperties || 0,
      change: `+${analytics?.recentActivity.newProperties || 0} this week`,
      icon: Building2,
      color: "text-green-600"
    },
    {
      title: "Active Properties",
      value: analytics?.activeProperties || 0,
      change: `${((analytics?.activeProperties || 0) / (analytics?.totalProperties || 1) * 100).toFixed(1)}% of total`,
      icon: MapPin,
      color: "text-purple-600"
    },
    {
      title: "Total Bookings",
      value: analytics?.totalBookings || 0,
      change: `+${analytics?.recentActivity.newBookings || 0} this week`,
      icon: Calendar,
      color: "text-orange-600"
    },
    {
      title: "Commission Revenue",
      value: `K${(analytics?.totalCommissionRevenue || 0).toFixed(2)}`,
      change: "Platform earnings",
      icon: DollarSign,
      color: "text-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
          <p className="text-gray-600">Overview of platform performance and metrics</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Weekly Growth</span>
            </CardTitle>
            <CardDescription>New registrations and activity in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>New Users</span>
                </div>
                <span className="font-semibold">{analytics?.recentActivity.newUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <span>New Properties</span>
                </div>
                <span className="font-semibold">{analytics?.recentActivity.newProperties || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span>New Bookings</span>
                </div>
                <span className="font-semibold">{analytics?.recentActivity.newBookings || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Platform Health</span>
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Property Activation Rate</span>
                <span className="font-semibold">
                  {((analytics?.activeProperties || 0) / (analytics?.totalProperties || 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg Revenue per Property</span>
                <span className="font-semibold">
                  K{((analytics?.totalCommissionRevenue || 0) / (analytics?.activeProperties || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bookings per Property</span>
                <span className="font-semibold">
                  {((analytics?.totalBookings || 0) / (analytics?.activeProperties || 1)).toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
