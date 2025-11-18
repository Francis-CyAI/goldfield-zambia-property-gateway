
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Smartphone, 
  Shield, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Star
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/constants/firebase';

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

interface BookingFlowProps {
  property: Property;
  onClose?: () => void;
}

type BookingStep = 'dates' | 'guests' | 'details' | 'payment' | 'confirmation';
type MobileMoneyProvider = 'airtel' | 'mtn';
type PaymentPhase = 'idle' | 'initiating' | 'polling' | 'success' | 'failed' | 'timeout';

interface InitiateBookingPaymentRequest {
  bookingId: string;
  amount: number;
  msisdn: string;
  operator: MobileMoneyProvider | 'zamtel';
  metadata?: Record<string, unknown>;
}

interface InitiateBookingPaymentResponse {
  success: boolean;
  reference: string;
  status: string;
  lencoCollectionId?: string;
  lencoReference?: string;
  checkWindowMs: number;
  expiresAt?: string;
  amount: number;
  currency: string;
}

interface BookingPaymentStatusRequest {
  reference?: string;
  bookingId?: string;
  forceCheck?: boolean;
}

interface BookingPaymentStatusResponse {
  success: boolean;
  reference: string;
  status: string;
  inCheckWindow: boolean;
  manualCheck?: boolean;
  expiresAt?: string;
  initiatedAt?: string | null;
  completedAt?: string | null;
  lencoCollectionId?: string;
  lencoReference?: string;
  checkWindowMs?: number;
}

interface PendingPaymentSession {
  bookingId: string;
  reference: string;
  lencoCollectionId?: string;
  lencoReference?: string;
  checkWindowMs: number;
  expiresAt?: string;
  bookingPayload: {
    check_in: string;
    check_out: string;
    guest_count: number;
    total_price: number;
  };
}

interface PaymentProgressState {
  phase: PaymentPhase;
  message?: string;
  reference?: string;
  attempts: number;
  status?: string;
  expiresAt?: string;
  inCheckWindow?: boolean;
  manualCheckAllowed: boolean;
  error?: string;
}

const sanitizePhoneNumber = (value: string) => value.replace(/[^0-9]/g, '');
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isFailureStatus = (status?: string) => {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return normalized === 'failed' || normalized === 'cancelled' || normalized === 'canceled';
};

const BookingFlow = ({ property, onClose }: BookingFlowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();

  // console.log("User object is: ", user)
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('dates');
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    guestDetails: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      specialRequests: ''
    },
    paymentMethod: 'mobile_money' as 'card' | 'mobile_money',
    mobileMoneyProvider: 'airtel' as MobileMoneyProvider,
    phoneNumber: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState<PaymentProgressState>({
    phase: 'idle',
    attempts: 0,
    manualCheckAllowed: false,
  });
  const [pendingPayment, setPendingPayment] = useState<PendingPaymentSession | null>(null);
  const [manualCheckLoading, setManualCheckLoading] = useState(false);

  const finalizeBooking = async (session: PendingPaymentSession) => {
    const bookingPayload = {
      property_id: property.id,
      ...session.bookingPayload,
      total_price: session.bookingPayload.total_price,
      payment_reference: session.reference,
      payment_status: 'successful',
      payment_method: 'mobile_money',
      payment_metadata: {
        lenco_collection_id: session.lencoCollectionId ?? null,
        lenco_reference: session.lencoReference ?? null,
        booking_session_id: session.bookingId,
        expires_at: session.expiresAt ?? null,
      },
    };
    // console.log('[BookingFlow] booking payload:', bookingPayload);
    await createBooking.mutateAsync(bookingPayload);

    setBookingConfirmed(true);
    setCurrentStep('confirmation');
    setPaymentProgress((prev) => ({
      ...prev,
      phase: 'success',
      message: 'Payment confirmed!',
      manualCheckAllowed: false,
    }));
    setPendingPayment(null);
  };

  const pollPaymentStatus = async (reference: string, checkWindowMs: number) => {
    const endTime = Date.now() + checkWindowMs;
    const delayMs = Math.min(5000, Math.max(2000, Math.floor(checkWindowMs / 20)));
    let attempt = 0;
    let lastResponse: BookingPaymentStatusResponse | null = null;

    while (Date.now() < endTime) {
      attempt += 1;
      const response = await checkPaymentCallable({ reference });
      const data = response.data;
      lastResponse = data;
      const status = data.status?.toLowerCase() ?? 'pending';

      setPaymentProgress((prev) => ({
        ...prev,
        attempts: attempt,
        status,
        reference: data.reference ?? prev.reference,
        inCheckWindow: data.inCheckWindow ?? prev.inCheckWindow,
        expiresAt: data.expiresAt ?? prev.expiresAt,
        message: status === 'successful' ? 'Payment confirmed!' : 'Awaiting payment confirmation...',
      }));

      if (status === 'successful') {
        return { success: true, data };
      }

      if (isFailureStatus(status)) {
        return { success: false, data };
      }

      await wait(delayMs);
    }

    return { success: false, data: lastResponse, timedOut: true as const };
  };

  const handleManualVerification = async () => {
    if (!pendingPayment?.reference) {
      toast({
        title: 'No payment to verify',
        description: 'Please initiate a payment first.',
        variant: 'destructive',
      });
      return;
    }

    setManualCheckLoading(true);
    try {
      const response = await checkPaymentCallable({
        reference: pendingPayment.reference,
        forceCheck: true,
      });
      const data = response.data;
      const status = data.status?.toLowerCase() ?? 'pending';

      setPaymentProgress((prev) => ({
        ...prev,
        attempts: prev.attempts + 1,
        status,
        phase: status === 'successful' ? 'success' : prev.phase,
        manualCheckAllowed: status !== 'successful',
        message:
          status === 'successful'
            ? 'Payment confirmed!'
            : 'Still waiting for payment confirmation. Please try again shortly.',
      }));

      if (status === 'successful') {
        await finalizeBooking(pendingPayment);
        toast({
          title: 'Payment verified',
          description: 'We confirmed your payment. Finalizing reservation...',
        });
      } else if (isFailureStatus(status)) {
        setPendingPayment(null);
        setPaymentProgress((prev) => ({
          ...prev,
          phase: 'failed',
          manualCheckAllowed: false,
          message: 'Payment failed. Please try again.',
        }));
        toast({
          title: 'Payment failed',
          description: 'We could not confirm your payment. Please try again.',
          variant: 'destructive',
        });
      } else {
        setPaymentProgress((prev) => ({
          ...prev,
          phase: 'polling',
        }));
        toast({
          title: 'Still pending',
          description: 'Your payment is still being processed. Please try again in a moment.',
        });
      }
    } catch (error) {
      console.error('Manual verification error:', error);
      toast({
        title: 'Verification failed',
        description: 'Unable to verify payment at this time. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setManualCheckLoading(false);
    }
  };

  const initiatePaymentCallable = useMemo(
    () =>
      httpsCallable<InitiateBookingPaymentRequest, InitiateBookingPaymentResponse>(
        functions,
        'initiateBookingMobileMoneyPayment',
      ),
    [],
  );

  const checkPaymentCallable = useMemo(
    () =>
      httpsCallable<BookingPaymentStatusRequest, BookingPaymentStatusResponse>(
        functions,
        'checkBookingMobileMoneyPaymentStatus',
      ),
    [],
  );

  const nights = bookingData.checkIn && bookingData.checkOut 
    ? differenceInDays(new Date(bookingData.checkOut), new Date(bookingData.checkIn)) 
    : 0;
  
  const basePrice = nights * property.price_per_night;
  const cleaningFee = property.cleaningFee || 50;
  const serviceFee = property.serviceFee || Math.round(basePrice * 0.05);
  const totalPrice = basePrice + cleaningFee + serviceFee;

  const steps = [
    { id: 'dates', title: 'Select Dates', icon: Calendar },
    { id: 'guests', title: 'Guest Count', icon: Users },
    { id: 'details', title: 'Your Details', icon: Shield },
    { id: 'payment', title: 'Payment', icon: CreditCard },
    { id: 'confirmation', title: 'Confirmation', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as BookingStep);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as BookingStep);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'dates':
        return bookingData.checkIn && bookingData.checkOut && nights > 0;
      case 'guests':
        return bookingData.guests >= 1 && bookingData.guests <= property.max_guests;
      case 'details':
        return bookingData.guestDetails.firstName && 
               bookingData.guestDetails.lastName && 
               bookingData.guestDetails.email;
      case 'payment':
        if (bookingData.paymentMethod === 'mobile_money') {
          return sanitizePhoneNumber(bookingData.phoneNumber).length >= 9;
        }
        return false;
      default:
        return true;
    }
  };

  const handlePayment = async () => {
    if (!validateCurrentStep()) return;

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to complete your booking.',
        variant: 'destructive',
      });
      return;
    }

    if (bookingData.paymentMethod !== 'mobile_money') {
      toast({
        title: 'Payment method unavailable',
        description: 'Only mobile money payments are supported at this time.',
        variant: 'destructive',
      });
      return;
    }

    const msisdn = sanitizePhoneNumber(bookingData.phoneNumber);
    if (msisdn.length < 9) {
      toast({
        title: 'Invalid phone number',
        description: 'Enter the mobile money number you plan to use for this payment.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setPaymentProgress({
      phase: 'initiating',
      message: 'Initiating mobile money payment...',
      attempts: 0,
      reference: undefined,
      status: 'pending',
      manualCheckAllowed: false,
    });

    try {
      const bookingSessionId = `booking_${property.id}_${Date.now()}`;
      const paymentAmount = Math.round(totalPrice * 100) / 100;

      const initiatePayload = {
        bookingId: bookingSessionId,
        amount: paymentAmount,
        msisdn,
        operator: bookingData.mobileMoneyProvider,
        metadata: {
          propertyId: property.id,
          guestId: user.uid,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
        },
      };
      // console.log('[BookingFlow] initiate payment payload:', initiatePayload);

      const response = await initiatePaymentCallable(initiatePayload);

      const data = response.data;
      if (!data?.success || !data.reference) {
        throw new Error('Failed to initiate payment.');
      }

      const session: PendingPaymentSession = {
        bookingId: bookingSessionId,
        reference: data.reference,
        lencoCollectionId: data.lencoCollectionId,
        lencoReference: data.lencoReference,
        checkWindowMs: data.checkWindowMs ?? 180000,
        expiresAt: data.expiresAt,
        bookingPayload: {
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          guest_count: bookingData.guests,
          total_price: totalPrice,
        },
      };

      setPendingPayment(session);
      setPaymentProgress((prev) => ({
        ...prev,
        phase: 'polling',
        reference: data.reference,
        status: data.status ?? 'pending',
        message: 'Awaiting payment confirmation...',
        expiresAt: data.expiresAt ?? prev.expiresAt,
        inCheckWindow: true,
      }));

      const pollResult = await pollPaymentStatus(session.reference, session.checkWindowMs);
      if (pollResult.success) {
        await finalizeBooking(session);
        toast({
          title: 'Booking confirmed!',
          description: 'Your reservation has been successfully processed.',
        });
      } else if (pollResult.timedOut) {
        setPaymentProgress((prev) => ({
          ...prev,
          phase: 'timeout',
          manualCheckAllowed: true,
          inCheckWindow: false,
          message:
            'We could not confirm payment automatically. Approve the prompt on your phone then confirm below.',
        }));
        toast({
          title: 'Awaiting payment confirmation',
          description: 'Click "I have paid" once you approve the mobile money prompt.',
        });
      } else {
        setPendingPayment(null);
        setPaymentProgress((prev) => ({
          ...prev,
          phase: 'failed',
          manualCheckAllowed: false,
          message: 'Payment failed. Please try again.',
        }));
        toast({
          title: 'Payment failed',
          description: 'We could not confirm your payment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Booking payment error:', error);
      setPendingPayment(null);
      setPaymentProgress({
        phase: 'failed',
        attempts: 0,
        manualCheckAllowed: false,
        message: 'Unable to initiate payment. Please try again.',
        error: error instanceof Error ? error.message : 'Payment error',
      });
      toast({
        title: 'Payment error',
        description: 'We were unable to start the payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
};

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Book Your Stay</h2>
              <div className="flex items-center space-x-2 text-gray-600 mt-1">
                <MapPin className="h-4 w-4" />
                <span>{property.location}</span>
                {property.rating && (
                  <>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{property.rating} ({property.reviewCount} reviews)</span>
                  </>
                )}
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = getCurrentStepIndex() > index;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isActive ? 'bg-primary text-white' : 
                    isCompleted ? 'bg-green-500 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 text-sm ${
                    isActive ? 'font-semibold' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-px bg-gray-300 mx-4" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 'dates' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select your dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="checkin">Check-in</Label>
                        <Input
                          id="checkin"
                          type="date"
                          value={bookingData.checkIn}
                          onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                          min={today}
                        />
                      </div>
                      <div>
                        <Label htmlFor="checkout">Check-out</Label>
                        <Input
                          id="checkout"
                          type="date"
                          value={bookingData.checkOut}
                          onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                          min={bookingData.checkIn || today}
                        />
                      </div>
                    </div>
                    {nights > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          You've selected {nights} night{nights > 1 ? 's' : ''} 
                          from {format(new Date(bookingData.checkIn), 'MMM dd')} to {format(new Date(bookingData.checkOut), 'MMM dd')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentStep === 'guests' && (
                <Card>
                  <CardHeader>
                    <CardTitle>How many guests?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Users className="h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        value={bookingData.guests}
                        onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value) || 1})}
                        min={1}
                        max={property.max_guests}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">
                        Maximum {property.max_guests} guests
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 'details' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={bookingData.guestDetails.firstName}
                          onChange={(e) => setBookingData({
                            ...bookingData, 
                            guestDetails: {...bookingData.guestDetails, firstName: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={bookingData.guestDetails.lastName}
                          onChange={(e) => setBookingData({
                            ...bookingData, 
                            guestDetails: {...bookingData.guestDetails, lastName: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={bookingData.guestDetails.email}
                        onChange={(e) => setBookingData({
                          ...bookingData, 
                          guestDetails: {...bookingData.guestDetails, email: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={bookingData.guestDetails.phone}
                        onChange={(e) => setBookingData({
                          ...bookingData, 
                          guestDetails: {...bookingData.guestDetails, phone: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="requests">Special Requests (Optional)</Label>
                      <Input
                        id="requests"
                        value={bookingData.guestDetails.specialRequests}
                        onChange={(e) => setBookingData({
                          ...bookingData, 
                          guestDetails: {...bookingData.guestDetails, specialRequests: e.target.value}
                        })}
                        placeholder="Any special requests for your stay..."
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs 
                      value={bookingData.paymentMethod} 
                      onValueChange={(value) => setBookingData({...bookingData, paymentMethod: value as 'card' | 'mobile_money'})}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="card" className="flex items-center space-x-2" disabled>
                          <CreditCard className="h-4 w-4" />
                          <span>Card (coming soon)</span>
                        </TabsTrigger>
                        <TabsTrigger value="mobile_money" className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span>Mobile Money</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="card" className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            Card payments are not available yet. Please use mobile money to confirm your reservation.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="mobile_money" className="space-y-4">
                        <div>
                          <Label>Mobile Money Provider</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <Button
                              type="button"
                              variant={bookingData.mobileMoneyProvider === 'airtel' ? 'default' : 'outline'}
                              onClick={() => setBookingData({...bookingData, mobileMoneyProvider: 'airtel'})}
                              className="h-12"
                            >
                              Airtel Money
                            </Button>
                            <Button
                              type="button"
                              variant={bookingData.mobileMoneyProvider === 'mtn' ? 'default' : 'outline'}
                              onClick={() => setBookingData({...bookingData, mobileMoneyProvider: 'mtn'})}
                              className="h-12"
                            >
                              MTN Mobile Money
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phoneNumber">Mobile Money Number</Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            value={bookingData.phoneNumber}
                            onChange={(e) => setBookingData({...bookingData, phoneNumber: e.target.value})}
                            placeholder="Enter the number registered for mobile money"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            We'll send a payment prompt to this number. Standard carrier charges may apply.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {paymentProgress.phase !== 'idle' && (
                      <div className="mt-6 rounded-lg border p-4 space-y-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Payment status</p>
                            <p className="text-base font-semibold capitalize">{paymentProgress.status ?? paymentProgress.phase}</p>
                          </div>
                          {paymentProgress.reference && (
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Reference</p>
                              <p className="text-sm font-mono">{paymentProgress.reference}</p>
                            </div>
                          )}
                        </div>
                        {paymentProgress.message && (
                          <p className="text-sm text-gray-600">{paymentProgress.message}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Attempts: {paymentProgress.attempts}</span>
                          {paymentProgress.expiresAt && (
                            <span>Check window ends: {format(new Date(paymentProgress.expiresAt), 'MMM dd, HH:mm')}</span>
                          )}
                        </div>
                        {paymentProgress.manualCheckAllowed && (
                          <div className="pt-2 border-t border-dashed">
                            <p className="text-sm text-gray-600 mb-2">
                              Approved the payment on your phone? Let us know and we'll re-check instantly.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={manualCheckLoading}
                              onClick={handleManualVerification}
                            >
                              {manualCheckLoading ? 'Verifying...' : "I've paid – verify now"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentStep === 'confirmation' && bookingConfirmed && (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-600 mb-4">
                      Your reservation at {property.title} has been confirmed.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <h4 className="font-semibold mb-2">Booking Details:</h4>
                      <p><strong>Check-in:</strong> {format(new Date(bookingData.checkIn), 'MMM dd, yyyy')}</p>
                      <p><strong>Check-out:</strong> {format(new Date(bookingData.checkOut), 'MMM dd, yyyy')}</p>
                      <p><strong>Guests:</strong> {bookingData.guests}</p>
                      <p><strong>Total:</strong> ZMW {totalPrice.toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      A confirmation email has been sent to {bookingData.guestDetails.email}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={property.images[0] || '/placeholder.svg'} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-sm text-gray-600">{property.location}</p>
                  </div>

                  {nights > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>ZMW {property.price_per_night.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                          <span>ZMW {basePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cleaning fee</span>
                          <span>ZMW {cleaningFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service fee</span>
                          <span>ZMW {serviceFee.toLocaleString()}</span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>ZMW {totalPrice.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={getCurrentStepIndex() === 0 || bookingConfirmed}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === 'payment' ? (
              <Button
                onClick={handlePayment}
                disabled={!validateCurrentStep() || isProcessing}
                className="min-w-[120px]"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Pay ZMW ${totalPrice.toLocaleString()}`
                )}
              </Button>
            ) : bookingConfirmed ? (
              <Button onClick={onClose}>
                Close
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!validateCurrentStep()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
