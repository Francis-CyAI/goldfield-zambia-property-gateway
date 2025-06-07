
import { useState } from 'react';
import BookingManagement from '@/components/BookingManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Bookings = () => {
  const [userType] = useState<'guest' | 'host'>('guest'); // This would come from auth context

  const quickActions = [
    {
      title: 'Find Accommodation',
      description: 'Search for hotels, lodges, and other properties',
      icon: MapPin,
      link: '/properties',
      color: 'bg-blue-500'
    },
    {
      title: 'Check Availability',
      description: 'View calendar and available dates',
      icon: Calendar,
      link: '/properties',
      color: 'bg-green-500'
    },
    {
      title: 'Group Booking',
      description: 'Book for multiple rooms or large groups',
      icon: Users,
      link: '/properties?guests=8',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Booking Management */}
        <BookingManagement />

        {/* Host Section (if user is a host) */}
        {userType === 'host' && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Host Dashboard</span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-600">12</h3>
                    <p className="text-sm text-gray-600">Active Bookings</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-600">K24,500</h3>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-purple-600">4.8</h3>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
