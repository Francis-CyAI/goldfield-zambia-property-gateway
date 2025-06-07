
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BookingCard from '@/components/BookingCard';
import ReviewCard from '@/components/ReviewCard';
import { 
  Share, 
  Heart, 
  Star, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Home,
  Shield,
  Award,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock data - in real app, fetch based on id
  const property = {
    id: id || '1',
    title: 'Beautiful 4-Bedroom House in Kabulonga',
    location: 'Kabulonga, Lusaka, Zambia',
    price: 450,
    priceType: 'night' as const,
    rating: 4.8,
    reviewCount: 127,
    images: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    host: {
      name: 'John Mwamba',
      avatar: '/placeholder.svg',
      joinedDate: new Date('2020-03-15'),
      isSuperhost: true,
      responseRate: 98,
      responseTime: 'within an hour'
    },
    details: {
      guests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3,
      propertyType: 'Entire house',
      tier: 'middle' as const
    },
    amenities: [
      { name: 'WiFi', icon: Wifi },
      { name: 'Kitchen', icon: Home },
      { name: 'Parking', icon: Car },
      { name: 'Pool', icon: Home },
      { name: 'Garden', icon: Home },
      { name: 'Security', icon: Shield },
      { name: 'Generator', icon: Home },
      { name: 'Air Conditioning', icon: Home }
    ],
    description: `Welcome to this stunning 4-bedroom house in the prestigious Kabulonga area of Lusaka. This beautifully furnished property offers modern amenities and comfortable living spaces perfect for families or groups visiting Zambia.

    The house features a spacious living area, fully equipped kitchen, and a beautiful garden where you can relax. Located in one of Lusaka's most sought-after neighborhoods, you'll be close to shopping centers, restaurants, and business districts.

    Perfect for business travelers, families, or anyone looking for a luxurious stay in Lusaka.`,
    maxGuests: 8,
    cleaningFee: 150,
    serviceFee: 0,
    houseRules: [
      'Check-in: 3:00 PM - 10:00 PM',
      'Check-out: 11:00 AM',
      'No smoking',
      'No pets',
      'No parties or events',
      'Quiet hours: 10:00 PM - 7:00 AM'
    ],
    cancellationPolicy: 'Free cancellation for 48 hours',
    safetyFeatures: [
      'Smoke alarm',
      'Carbon monoxide alarm',
      'Security cameras on property',
      '24/7 security guard',
      'First aid kit'
    ]
  };

  const reviews = [
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        avatar: '/placeholder.svg',
        location: 'United Kingdom'
      },
      rating: 5,
      date: new Date('2024-02-15'),
      comment: 'Amazing property with excellent amenities. The host was very responsive and helpful. The location is perfect for exploring Lusaka. Highly recommended!',
      categories: {
        cleanliness: 5.0,
        accuracy: 4.8,
        checkin: 5.0,
        communication: 5.0,
        location: 4.9,
        value: 4.7
      }
    },
    {
      id: '2',
      user: {
        name: 'Michael Chen',
        avatar: '/placeholder.svg',
        location: 'South Africa'
      },
      rating: 4,
      date: new Date('2024-01-28'),
      comment: 'Great house for a business trip. Very clean and comfortable. The kitchen was well-equipped and the WiFi was excellent for remote work.',
      categories: {
        cleanliness: 4.8,
        accuracy: 4.5,
        checkin: 4.2,
        communication: 4.0,
        location: 4.5,
        value: 4.3
      }
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleBooking = (bookingData: any) => {
    console.log('Booking:', bookingData);
    // Handle booking logic
  };

  const handleShare = () => {
    navigator.share?.({
      title: property.title,
      url: window.location.href
    }).catch(() => {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{property.title}</h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{property.rating}</span>
                <span className="text-gray-500">({property.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span className="underline">{property.location}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-96 md:h-[500px] bg-gray-200 rounded-lg overflow-hidden">
            <img 
              src={property.images[currentImageIndex]} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Host and Property Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {property.details.propertyType} hosted by {property.host.name}
                  </h2>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span>{property.details.guests} guests</span>
                    <span>{property.details.bedrooms} bedrooms</span>
                    <span>{property.details.beds} beds</span>
                    <span>{property.details.bathrooms} bathrooms</span>
                  </div>
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={property.host.avatar} />
                  <AvatarFallback>
                    {property.host.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              {property.host.isSuperhost && (
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-medium">{property.host.name} is a Superhost</span>
                </div>
              )}

              <Separator />
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About this place</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <amenity.icon className="h-5 w-5 text-gray-600" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-semibold">{property.rating}</span>
                <span className="text-gray-500">({property.reviewCount} reviews)</span>
              </div>

              <div className="space-y-6 mb-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              <Button variant="outline" className="w-full">
                Show all {property.reviewCount} reviews
              </Button>
            </div>

            {/* Host Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={property.host.avatar} />
                    <AvatarFallback>
                      {property.host.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">Hosted by {property.host.name}</h3>
                    <p className="text-gray-600">
                      Joined {property.host.joinedDate.getFullYear()}
                    </p>
                    {property.host.isSuperhost && (
                      <Badge className="mt-1">Superhost</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">Response rate:</span>
                    <span className="ml-1">{property.host.responseRate}%</span>
                  </div>
                  <div>
                    <span className="font-medium">Response time:</span>
                    <span className="ml-1">{property.host.responseTime}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Host
                </Button>
              </CardContent>
            </Card>

            {/* House Rules */}
            <div>
              <h3 className="text-lg font-semibold mb-4">House rules</h3>
              <div className="space-y-2">
                {property.houseRules.map((rule, index) => (
                  <p key={index} className="text-gray-700">{rule}</p>
                ))}
              </div>
            </div>

            {/* Safety */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Safety & property</h3>
              <div className="space-y-2">
                {property.safetyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation Policy */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Cancellation policy</h3>
              <p className="text-gray-700">{property.cancellationPolicy}</p>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <BookingCard property={property} onBooking={handleBooking} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
