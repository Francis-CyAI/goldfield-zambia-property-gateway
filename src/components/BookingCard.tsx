
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Users, 
  Star, 
  Shield,
  CreditCard
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface BookingCardProps {
  property: {
    id: string;
    price: number;
    priceType: 'night' | 'month' | 'sale';
    rating: number;
    reviewCount: number;
    maxGuests: number;
    cleaningFee?: number;
    serviceFee?: number;
  };
  onBooking: (bookingData: any) => void;
}

const BookingCard = ({ property, onBooking }: BookingCardProps) => {
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState<'checkin' | 'checkout' | null>(null);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * property.price;
  const cleaningFee = property.cleaningFee || 0;
  const serviceFee = property.serviceFee || Math.round(subtotal * 0.14);
  const total = subtotal + cleaningFee + serviceFee;

  const handleBooking = () => {
    if (!checkIn || !checkOut) return;
    
    const bookingData = {
      propertyId: property.id,
      checkIn,
      checkOut,
      guests,
      nights,
      subtotal,
      cleaningFee,
      serviceFee,
      total
    };
    
    onBooking(bookingData);
  };

  const canBook = checkIn && checkOut && nights > 0;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">K{property.price.toLocaleString()}</span>
            <span className="text-gray-600">
              {property.priceType === 'night' && '/ night'}
              {property.priceType === 'month' && '/ month'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{property.rating}</span>
            <span className="text-gray-500">({property.reviewCount})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {property.priceType !== 'sale' && (
          <>
            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">CHECK-IN</label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => setShowCalendar('checkin')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {checkIn ? format(checkIn, 'MM/dd/yyyy') : 'Add date'}
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CHECK-OUT</label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => setShowCalendar('checkout')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {checkOut ? format(checkOut, 'MM/dd/yyyy') : 'Add date'}
                </Button>
              </div>
            </div>

            {/* Calendar Popup */}
            {showCalendar && (
              <div className="border rounded-lg p-4 bg-white shadow-lg">
                <Calendar
                  mode="single"
                  selected={showCalendar === 'checkin' ? checkIn : checkOut}
                  onSelect={(date) => {
                    if (showCalendar === 'checkin') {
                      setCheckIn(date);
                      if (date && checkOut && date >= checkOut) {
                        setCheckOut(undefined);
                      }
                    } else {
                      setCheckOut(date);
                    }
                    setShowCalendar(null);
                  }}
                  disabled={(date) => {
                    if (date < new Date()) return true;
                    if (showCalendar === 'checkout' && checkIn) {
                      return date <= checkIn;
                    }
                    return false;
                  }}
                />
              </div>
            )}

            {/* Guests Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">GUESTS</label>
              <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                <SelectTrigger>
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} guest{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Breakdown */}
            {canBook && (
              <div className="space-y-3">
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>K{property.price.toLocaleString()} x {nights} nights</span>
                    <span>K{subtotal.toLocaleString()}</span>
                  </div>
                  {cleaningFee > 0 && (
                    <div className="flex justify-between">
                      <span>Cleaning fee</span>
                      <span>K{cleaningFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>K{serviceFee.toLocaleString()}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>K{total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Booking Button */}
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          size="lg"
          disabled={property.priceType !== 'sale' && !canBook}
          onClick={handleBooking}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {property.priceType === 'sale' ? 'Make Offer' : 'Reserve'}
        </Button>

        {property.priceType !== 'sale' && (
          <p className="text-center text-sm text-gray-600">
            You won't be charged yet
          </p>
        )}

        {/* Trust Badges */}
        <div className="flex items-center justify-center space-x-4 pt-4">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Secure booking</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Instant confirmation
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
