import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookingCard from '@/components/BookingCard';
import QuickBookingCard from '@/components/QuickBookingCard';
import EnhancedReviewCard from '@/components/reviews/EnhancedReviewCard';
import ReviewSubmissionForm from '@/components/reviews/ReviewSubmissionForm';
import SafetyGuidelinesCard from '@/components/reviews/SafetyGuidelinesCard';
import MessagingSystem from '@/components/MessagingSystem';
import { useProperty } from '@/hooks/useProperties';
import { usePropertyReviews, useHostResponse } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
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
  ChevronRight,
  Calendar,
  Zap
} from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: property, isLoading, error } = useProperty(id || '');
  const { data: reviews = [], isLoading: reviewsLoading } = usePropertyReviews(id || '');
  const hostResponse = useHostResponse();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Property not found</h1>
            <p className="text-gray-600">The property you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const images = property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=800&fit=crop'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleShare = () => {
    navigator.share?.({
      title: property.title,
      url: window.location.href
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
    });
  };

  const handleHostResponse = async (reviewId: string, response: string) => {
    await hostResponse.mutateAsync({ reviewId, response });
  };

  // Create amenity objects with icons
  const amenityIcons: { [key: string]: any } = {
    'wifi': Wifi,
    'kitchen': Home,
    'parking': Car,
    'pool': Home,
    'security': Shield,
    'default': Home
  };

  const amenitiesWithIcons = property.amenities.map(amenity => ({
    name: amenity,
    icon: amenityIcons[amenity.toLowerCase()] || amenityIcons.default
  }));

  const transformedProperty = {
    id: property.id,
    title: property.title,
    location: property.location,
    price_per_night: property.price_per_night,
    rating: 4.8,
    reviewCount: reviews.length,
    images: images,
    host: {
      name: 'Property Host',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      joinedDate: new Date('2020-03-15'),
      isSuperhost: true,
      responseRate: 98,
      responseTime: 'within an hour'
    },
    details: {
      guests: property.max_guests,
      bedrooms: property.bedrooms,
      beds: property.bedrooms,
      bathrooms: property.bathrooms,
      propertyType: property.property_type,
    },
    amenities: amenitiesWithIcons,
    description: property.description || 'No description available.',
    max_guests: property.max_guests,
    cleaningFee: 50,
    serviceFee: 0
  };

  // Transform reviews for display
  const transformedReviews = reviews.map(review => ({
    id: review.id,
    user: {
      name: `${review.profiles?.first_name || 'Anonymous'} ${review.profiles?.last_name || 'User'}`,
      avatar: '',
      location: 'Guest'
    },
    rating: review.rating,
    date: new Date(review.created_at),
    comment: review.comment || '',
    isVerifiedStay: review.is_verified_stay || false,
    categories: review.category_ratings,
    hostResponse: review.host_response ? {
      message: review.host_response.message,
      date: new Date(review.host_response.created_at),
      hostName: review.host_response.host_name
    } : undefined
  }));

  const isHost = property.host_id === user?.id;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{transformedProperty.title}</h1>
            <Badge className="bg-green-100 text-green-800 space-x-1">
              <Zap className="h-3 w-3" />
              <span>Instant Book</span>
            </Badge>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{transformedProperty.rating}</span>
                <span className="text-gray-500">({transformedProperty.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span className="underline">{transformedProperty.location}</span>
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
              src={images[currentImageIndex]} 
              alt={transformedProperty.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
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
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Host and Property Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {transformedProperty.details.propertyType} hosted by {transformedProperty.host.name}
                  </h2>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span>{transformedProperty.details.guests} guests</span>
                    <span>{transformedProperty.details.bedrooms} bedrooms</span>
                    <span>{transformedProperty.details.beds} beds</span>
                    <span>{transformedProperty.details.bathrooms} bathrooms</span>
                  </div>
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={transformedProperty.host.avatar} />
                  <AvatarFallback>
                    {transformedProperty.host.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              {transformedProperty.host.isSuperhost && (
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-medium">{transformedProperty.host.name} is a Superhost</span>
                </div>
              )}

              <Separator />
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About this place</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {transformedProperty.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {transformedProperty.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <amenity.icon className="h-5 w-5 text-gray-600" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-semibold">{transformedProperty.rating}</span>
                  <span className="text-gray-500">({transformedProperty.reviewCount} reviews)</span>
                </div>
                
                {user && !isHost && (
                  <Button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    variant="outline"
                  >
                    Write a Review
                  </Button>
                )}
              </div>

              {showReviewForm && user && !isHost && (
                <div className="mb-6">
                  <ReviewSubmissionForm
                    propertyId={property.id}
                    isVerifiedStay={true} // This would be determined by booking status
                    onSuccess={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              <div className="space-y-6">
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : transformedReviews.length > 0 ? (
                  transformedReviews.map((review) => (
                    <EnhancedReviewCard 
                      key={review.id} 
                      review={review} 
                      isHost={isHost}
                      onHostResponse={handleHostResponse}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No reviews yet. Be the first to leave a review!
                  </div>
                )}
              </div>
            </div>

            {/* Safety Guidelines for Hosts */}
            {isHost && (
              <div>
                <SafetyGuidelinesCard />
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <QuickBookingCard property={transformedProperty} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
