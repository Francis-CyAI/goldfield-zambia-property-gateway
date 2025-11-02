import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  collection,
  getCountFromServer,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDocs } from '@/lib/utils/firestore-serialize';

const AdminAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const profilesRef = collection(db, COLLECTIONS.profiles);
      const propertiesRef = collection(db, COLLECTIONS.properties);
      const bookingsRef = collection(db, COLLECTIONS.bookings);
      const commissionsRef = collection(db, COLLECTIONS.platformCommissions);

      const [userCountSnap, propertyCountSnap, activePropertyCountSnap, bookingCountSnap] = await Promise.all([
        getCountFromServer(profilesRef),
        getCountFromServer(propertiesRef),
        getCountFromServer(query(propertiesRef, where('is_active', '==', true))),
        getCountFromServer(bookingsRef),
      ]);

      const commissionDocs = await getDocs(commissionsRef);
      const commissionData = serializeDocs<{ commission_amount?: number }>(commissionDocs);
      const totalCommissionRevenue = commissionData.reduce(
        (sum, item) => sum + Number(item.commission_amount || 0),
        0,
      );

      const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

      const [recentUsersSnap, recentPropertiesSnap, recentBookingsSnap] = await Promise.all([
        getCountFromServer(query(profilesRef, where('created_at', '>=', sevenDaysAgo))),
        getCountFromServer(query(propertiesRef, where('created_at', '>=', sevenDaysAgo))),
        getCountFromServer(query(bookingsRef, where('created_at', '>=', sevenDaysAgo))),
      ]);

      return {
        totalUsers: userCountSnap.data().count,
        totalProperties: propertyCountSnap.data().count,
        activeProperties: activePropertyCountSnap.data().count,
        totalBookings: bookingCountSnap.data().count,
        totalCommissionRevenue,
        recentActivity: {
          newUsers: recentUsersSnap.data().count,
          newProperties: recentPropertiesSnap.data().count,
          newBookings: recentBookingsSnap.data().count,
        },
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
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      change: `+${analytics?.recentActivity.newUsers || 0} this week`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Total Properties',
      value: analytics?.totalProperties || 0,
      change: `+${analytics?.recentActivity.newProperties || 0} this week`,
      icon: Building2,
      color: 'text-green-600',
    },
    {
      title: 'Active Properties',
      value: analytics?.activeProperties || 0,
      change: `${(
        (analytics?.activeProperties || 0) /
        ((analytics?.totalProperties || 0) || 1) *
        100
      ).toFixed(1)}% of total`,
      icon: MapPin,
      color: 'text-purple-600',
    },
    {
      title: 'Total Bookings',
      value: analytics?.totalBookings || 0,
      change: `+${analytics?.recentActivity.newBookings || 0} this week`,
      icon: Calendar,
      color: 'text-orange-600',
    },
    {
      title: 'Commission Revenue',
      value: `K${(analytics?.totalCommissionRevenue || 0).toFixed(2)}`,
      change: 'Platform earnings',
      icon: DollarSign,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
          <p className="text-gray-600">Overview of platform performance and metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
                  {(
                    ((analytics?.activeProperties || 0) / ((analytics?.totalProperties || 0) || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg Revenue per Property</span>
                <span className="font-semibold">
                  K{(
                    (analytics?.totalCommissionRevenue || 0) /
                    ((analytics?.activeProperties || 0) || 1)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bookings per Property</span>
                <span className="font-semibold">
                  {((analytics?.totalBookings || 0) / ((analytics?.activeProperties || 0) || 1)).toFixed(1)}
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

