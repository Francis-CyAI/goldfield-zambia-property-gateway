
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
import useMobileMoneyPayment from '@/hooks/useMobileMoneyPayment';

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

  // Payment-related state (local inputs)
  const [localMsisdn, setLocalMsisdn] = useState('');
  const [localOperator, setLocalOperator] = useState('airtel');

  // Hook that encapsulates mobile money calls + polling
  const {
    status: paymentStatus,
    reference: paymentReference,
    isInitiating: isInitiatingPayment,
    error: paymentError,
    initiate: initiatePaymentHook,
    poll: pollPaymentHook,
    check: checkPaymentHook,
    reset: resetPaymentHook,
  } = useMobileMoneyPayment();

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

    // If payment has not yet succeeded, initiate or wait for mobile money payment first.
    if (paymentStatus !== 'success') {
      // Start a new payment flow if idle/failed; otherwise just inform user we're waiting.
      if (paymentStatus === 'idle' || paymentStatus === 'failed') {
        try {
          await handleInitiatePayment();
          toast({
            title: 'Payment initiated',
            description: 'Please confirm the mobile money payment on your phone. Once confirmed, click "Reserve" again to complete your booking.',
          });
        } catch (err: any) {
          toast({
            title: 'Payment initiation failed',
            description: err?.message ?? 'Unable to start mobile money payment. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Awaiting payment confirmation',
          description: 'We are waiting for your mobile money payment to be confirmed. Please complete it on your phone before proceeding.',
        });
      }
      return;
    }

    // At this point paymentStatus === 'success' – proceed with booking.
    setIsBooking(true);

    try {
      const payload: any = {
        property_id: property.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guests,
        total_price: totalPrice,
        payment_reference: paymentReference,
        payment_method: 'mobile_money',
      };

      await createBooking.mutateAsync(payload);

      if (onBooking) {
        onBooking(payload);
      }

      // Reset form
      setCheckIn('');
      setCheckOut('');
      setGuests(1);
      resetPaymentHook();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: error?.message ?? 'Failed to create booking after payment.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  // Wrapper handlers that use the hook
  const handleInitiatePayment = async () => {
    try {
      const msisdn = localMsisdn;
      const operator = localOperator;
      const res: any = await initiatePaymentHook({ msisdn, operator, amount: totalPrice });
      const ref = res?.reference ?? null;
      if (ref) {
        // start polling in background
        void pollPaymentHook(ref);
      }
    } catch (err: any) {
      console.error('initiate payment failed', err);
    }
  };

  const handleManualVerify = async () => {
    try {
      if (!paymentReference) {
        // nothing to verify
        return;
      }
      const result: any = await checkPaymentHook({ reference: paymentReference });
      if (result?.success) {
        // hook will reflect state as well; show toast
        toast({ title: 'Payment confirmed', description: 'Payment was successful.' });
      } else {
        toast({ title: 'Payment pending', description: 'Payment not completed yet.' });
      }
    } catch (err: any) {
      console.error('manual verify failed', err);
    }
  };

  const handleCancelPayment = () => {
    // allow user to cancel/clear pending payment state locally
    resetPaymentHook();
    toast({ title: 'Payment cancelled', description: 'Payment attempt cancelled.' });
  };

  const handleRetryPayment = async () => {
    // Clear previous reference and restart
    resetPaymentHook();
    await handleInitiatePayment();
  };

  // Payment actions are provided by `useMobileMoneyPayment` hook; UI uses the hook state/functions below

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

        {/* Payment controls */}
        <div className="space-y-2">
          {/* MSISDN / Operator inputs (if not provided elsewhere) */}
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label htmlFor="msisdn">Phone number</Label>
              <Input id="msisdn" value={localMsisdn} onChange={(e) => setLocalMsisdn(e.target.value)} placeholder="0972123456" />
            </div>
            <div>
              <Label htmlFor="operator">Operator</Label>
              <select id="operator" className="input" value={localOperator} onChange={(e) => setLocalOperator(e.target.value)}>
                <option value="airtel">Airtel</option>
                <option value="mtc">MTC</option>
                <option value="zatel">Zamtel</option>
              </select>
            </div>
          </div>
          {paymentError && <p className="text-sm text-red-600">{paymentError}</p>}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">Payment status</div>
              <div className="text-gray-600">{paymentStatus}</div>
            </div>
            <div className="flex space-x-2">
              {paymentStatus === 'idle' || paymentStatus === 'failed' ? (
                <Button onClick={handleInitiatePayment} disabled={isInitiatingPayment || nights <= 0}>
                  {isInitiatingPayment ? 'Initiating...' : 'Pay with Mobile Money'}
                </Button>
              ) : null}

              {paymentStatus === 'pending' && (
                <>
                  <Button onClick={handleManualVerify} disabled={isInitiatingPayment} variant="secondary">
                    Verify Payment
                  </Button>
                  <Button onClick={handleRetryPayment} disabled={isInitiatingPayment} variant="ghost">
                    Retry
                  </Button>
                  <Button onClick={handleCancelPayment} disabled={isInitiatingPayment} variant="destructive">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Booking Button */}
        <Button 
          onClick={handleBooking}
          disabled={!checkIn || !checkOut || nights <= 0 || isBooking || createBooking.isPending || isInitiatingPayment}
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
