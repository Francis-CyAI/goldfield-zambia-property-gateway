
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Zap, CreditCard } from 'lucide-react';
import { format, addDays } from 'date-fns';
import BookingFlow from './BookingFlow';

interface Property {
  id: string;
  title: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  cleaningFee?: number;
  serviceFee?: number;
}

interface QuickBookingCardProps {
  property: Property;
}

const QuickBookingCard = ({ property }: QuickBookingCardProps) => {
  const [checkIn, setCheckIn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(1);
  const [showBookingFlow, setShowBookingFlow] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <>
      <Card className="sticky top-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Quick Booking</span>
            <Badge variant="secondary" className="text-xs">
              Instant Confirmation
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <span className="text-3xl font-bold text-primary">
              ZMW {property.price_per_night.toLocaleString()}
            </span>
            <span className="text-gray-600"> per night</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="quick-checkin" className="text-xs">Check-in</Label>
              <Input
                id="quick-checkin"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={today}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="quick-checkout" className="text-xs">Check-out</Label>
              <Input
                id="quick-checkout"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quick-guests" className="text-xs">Guests</Label>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <Input
                id="quick-guests"
                type="number"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                min={1}
                max={property.max_guests}
                className="text-sm"
              />
            </div>
          </div>

          <Button 
            onClick={() => setShowBookingFlow(true)}
            className="w-full"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Reserve Now
          </Button>

          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Free cancellation</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              <span>Instant booking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {showBookingFlow && (
        <BookingFlow 
          property={property} 
          onClose={() => setShowBookingFlow(false)} 
        />
      )}
    </>
  );
};

export default QuickBookingCard;
