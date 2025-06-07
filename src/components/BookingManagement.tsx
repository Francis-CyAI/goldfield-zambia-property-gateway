
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Phone,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyImage: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  total: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  hostName: string;
  hostPhone: string;
  hostEmail: string;
}

const BookingManagement = () => {
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      propertyTitle: 'Beautiful Lodge in Kafue National Park',
      propertyLocation: 'Kafue National Park',
      propertyImage: '/placeholder.svg',
      checkIn: new Date('2024-07-15'),
      checkOut: new Date('2024-07-18'),
      guests: 4,
      total: 1350,
      status: 'confirmed',
      hostName: 'Sarah Mwanza',
      hostPhone: '+260 977 123456',
      hostEmail: 'sarah@kafuelodge.com'
    },
    {
      id: '2',
      propertyTitle: 'Luxury Hotel Suite in Lusaka',
      propertyLocation: 'CBD, Lusaka',
      propertyImage: '/placeholder.svg',
      checkIn: new Date('2024-08-01'),
      checkOut: new Date('2024-08-03'),
      guests: 2,
      total: 560,
      status: 'pending',
      hostName: 'InterContinental Lusaka',
      hostPhone: '+260 211 250000',
      hostEmail: 'reservations@intercontinental.com'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filterBookings = (status?: string) => {
    if (!status) return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <img 
            src={booking.propertyImage} 
            alt={booking.propertyTitle}
            className="w-full md:w-32 h-32 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{booking.propertyTitle}</h3>
              <Badge className={getStatusColor(booking.status)}>
                {getStatusIcon(booking.status)}
                <span className="ml-1 capitalize">{booking.status}</span>
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1 text-gray-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{booking.propertyLocation}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(booking.checkIn, 'MMM dd')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(booking.checkOut, 'MMM dd')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{booking.guests} guests</span>
              </div>
              <div className="font-semibold text-primary">
                K{booking.total.toLocaleString()}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <p className="font-medium">{booking.hostName}</p>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{booking.hostPhone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{booking.hostEmail}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Contact Host
                </Button>
                {booking.status === 'confirmed' && (
                  <Button variant="outline" size="sm">
                    Modify Booking
                  </Button>
                )}
                {booking.status === 'pending' && (
                  <Button variant="destructive" size="sm">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your accommodation reservations</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({filterBookings('confirmed').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterBookings('pending').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filterBookings('completed').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({filterBookings('cancelled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {filterBookings('confirmed').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterBookings('pending').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterBookings('completed').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filterBookings('cancelled').map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingManagement;
