
import { useState } from 'react';
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

const BookingFlow = ({ property, onClose }: BookingFlowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();

  console.log(
    "User object is: ", user
  )
  
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
    paymentMethod: 'card' as 'card' | 'mobile_money',
    mobileMoneyProvider: 'airtel' as 'airtel' | 'mtn',
    phoneNumber: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

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
          return bookingData.phoneNumber.length >= 10;
        }
        return true;
      default:
        return true;
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to complete your booking.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      await createBooking.mutateAsync({
        property_id: property.id,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guest_count: bookingData.guests,
        total_price: totalPrice,
      });

      setBookingConfirmed(true);
      setCurrentStep('confirmation');
      
      toast({
        title: 'Booking confirmed!',
        description: 'Your reservation has been successfully processed.',
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: 'There was an error processing your booking. Please try again.',
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
                        <TabsTrigger value="card" className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Card Payment</span>
                        </TabsTrigger>
                        <TabsTrigger value="mobile_money" className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span>Mobile Money</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="card" className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Secure payment with Visa, Mastercard, or Verve
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          You'll be redirected to a secure payment page to complete your transaction.
                        </p>
                      </TabsContent>

                      <TabsContent value="mobile_money" className="space-y-4">
                        <div>
                          <Label>Mobile Money Provider</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <Button
                              variant={bookingData.mobileMoneyProvider === 'airtel' ? 'default' : 'outline'}
                              onClick={() => setBookingData({...bookingData, mobileMoneyProvider: 'airtel'})}
                              className="h-12"
                            >
                              Airtel Money
                            </Button>
                            <Button
                              variant={bookingData.mobileMoneyProvider === 'mtn' ? 'default' : 'outline'}
                              onClick={() => setBookingData({...bookingData, mobileMoneyProvider: 'mtn'})}
                              className="h-12"
                            >
                              MTN Mobile Money
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="mobilePhone">Mobile Number</Label>
                          <Input
                            id="mobilePhone"
                            placeholder="0977123456"
                            value={bookingData.phoneNumber}
                            onChange={(e) => setBookingData({...bookingData, phoneNumber: e.target.value})}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Enter your {bookingData.mobileMoneyProvider === 'airtel' ? 'Airtel' : 'MTN'} mobile money number
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
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
