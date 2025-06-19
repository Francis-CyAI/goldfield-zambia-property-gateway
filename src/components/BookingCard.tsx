
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, CreditCard, Star } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  maxGuests: number;
  cleaningFee?: number;
  serviceFee?: number;
}

interface BookingCardProps {
  property: Property;
  onBooking?: (bookingData: any) => void;
}

const BookingCard = ({ property, onBooking }: BookingCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const basePrice = nights * property.price;
  const cleaningFee = property.cleaningFee || 50;
  const serviceFee = property.serviceFee || 0;
  const totalPrice = basePrice + cleaningFee + serviceFee;

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to make a booking.',
        variant: 'destructive',
      });
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: 'Please select dates',
        description: 'Check-in and check-out dates are required.',
        variant: 'destructive',
      });
      return;
    }

    if (guests > property.maxGuests) {
      toast({
        title: 'Too many guests',
        description: `This property can accommodate up to ${property.maxGuests} guests.`,
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);

    try {
      await createBooking.mutateAsync({
        property_id: property.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guests,
        total_price: totalPrice,
      });

      // Call the callback if provided
      if (onBooking) {
        onBooking({
          property_id: property.id,
          check_in: checkIn,
          check_out: checkOut,
          guest_count: guests,
          total_price: totalPrice,
        });
      }

      // Reset form
      setCheckIn('');
      setCheckOut('');
      setGuests(1);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold">ZMW {property.price.toLocaleString()}</span>
            <span className="text-gray-600 text-base font-normal"> per night</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{property.rating}</span>
            <span className="text-gray-500">({property.reviewCount})</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="checkin">Check-in</Label>
            <Input
              id="checkin"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={today}
            />
          </div>
          <div>
            <Label htmlFor="checkout">Check-out</Label>
            <Input
              id="checkout"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || tomorrow}
            />
          </div>
        </div>

        {/* Guest Selection */}
        <div>
          <Label htmlFor="guests">Guests</Label>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <Input
              id="guests"
              type="number"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              min={1}
              max={property.maxGuests}
              className="flex-1"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Maximum {property.maxGuests} guests
          </p>
        </div>

        {/* Price Breakdown */}
        {nights > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ZMW {property.price.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span>ZMW {basePrice.toLocaleString()}</span>
              </div>
              {cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>ZMW {cleaningFee.toLocaleString()}</span>
                </div>
              )}
              {serviceFee > 0 && (
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>ZMW {serviceFee.toLocaleString()}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>ZMW {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Booking Button */}
        <Button 
          onClick={handleBooking}
          disabled={!checkIn || !checkOut || nights <= 0 || isBooking || createBooking.isPending}
          className="w-full"
          size="lg"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {isBooking || createBooking.isPending ? 'Processing...' : 'Reserve'}
        </Button>

        <p className="text-sm text-gray-500 text-center">
          You won't be charged yet
        </p>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
