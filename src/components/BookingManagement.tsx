
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings, useHostBookings, useUpdateBookingStatus } from '@/hooks/useBookings';
import { format } from 'date-fns';

const BookingManagement = () => {
  const { user } = useAuth();
  const { data: guestBookings = [], isLoading: loadingGuestBookings } = useBookings(user?.id);
  const { data: hostBookings = [], isLoading: loadingHostBookings } = useHostBookings(user?.id);
  const updateBookingStatus = useUpdateBookingStatus();

  const handleStatusUpdate = (bookingId: string, status: string) => {
    updateBookingStatus.mutate({ bookingId, status });
  };

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
      default: return <Eye className="h-4 w-4" />;
    }
  };

  if (loadingGuestBookings || loadingHostBookings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="guest" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guest">My Bookings ({guestBookings.length})</TabsTrigger>
          <TabsTrigger value="host">Host Bookings ({hostBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="guest" className="space-y-4">
          {guestBookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600">Start exploring properties to make your first booking!</p>
              </CardContent>
            </Card>
          ) : (
            guestBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {booking.property?.title || 'Property Booking'}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{booking.property?.location || 'Location not available'}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {format(new Date(booking.check_in), 'MMM dd, yyyy')} - {format(new Date(booking.check_out), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`mb-2 ${getStatusColor(booking.status)}`}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </span>
                      </Badge>
                      <p className="text-2xl font-bold text-green-600">
                        K{booking.total_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {booking.status === 'pending' && (
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        disabled={updateBookingStatus.isPending}
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="host" className="space-y-4">
          {hostBookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings received</h3>
                <p className="text-gray-600">Your properties haven't received any bookings yet.</p>
              </CardContent>
            </Card>
          ) : (
            hostBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {booking.property?.title || 'Property Booking'}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{booking.property?.location || 'Location not available'}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {format(new Date(booking.check_in), 'MMM dd, yyyy')} - {format(new Date(booking.check_out), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`mb-2 ${getStatusColor(booking.status)}`}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </span>
                      </Badge>
                      <p className="text-2xl font-bold text-green-600">
                        K{booking.total_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {booking.status === 'pending' && (
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        disabled={updateBookingStatus.isPending}
                      >
                        Confirm Booking
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        disabled={updateBookingStatus.isPending}
                      >
                        Decline
                      </Button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        disabled={updateBookingStatus.isPending}
                      >
                        Mark as Completed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingManagement;
