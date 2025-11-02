
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, Calendar, Users } from 'lucide-react';
import { usePropertyAnalytics } from '@/hooks/usePropertyViews';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyAnalyticsDashboardProps {
  propertyId: string;
}

const PropertyAnalyticsDashboard = ({ propertyId }: PropertyAnalyticsDashboardProps) => {
  const { user } = useAuth();
  const { data: analytics, isLoading: analyticsLoading } = usePropertyAnalytics(propertyId);
  const { data: bookingRequests = [], isLoading: requestsLoading } = useBookingRequests(user?.uid || '', 'host');

  const propertyRequests = bookingRequests.filter((req: any) => req.property_id === propertyId);
  const pendingRequests = propertyRequests.filter((req: any) => req.status === 'pending');

  if (analyticsLoading || requestsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Views',
      value: analytics?.totalViews || 0,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Views Today',
      value: analytics?.viewsToday || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Views This Week',
      value: analytics?.viewsThisWeek || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.slice(0, 5).map((request: any) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {request.guest_count} guest{request.guest_count > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(request.check_in).toLocaleDateString()} - {new Date(request.check_out).toLocaleDateString()}
                    </p>
                    {request.message && (
                      <p className="text-sm text-gray-500 mt-1">"{request.message}"</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-orange-600">
                      Pending
                    </Badge>
                    {request.total_price && (
                      <Badge variant="secondary">
                        ZMW {request.total_price.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyAnalyticsDashboard;
