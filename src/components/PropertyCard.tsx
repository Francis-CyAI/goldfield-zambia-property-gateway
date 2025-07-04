
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin, Users, Bed, Bath, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookingFlow from './BookingFlow';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property & { isWishlisted?: boolean };
  onWishlistToggle?: (propertyId: string) => void;
}

const PropertyCard = ({ property, onWishlistToggle }: PropertyCardProps) => {
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(property.isWishlisted || false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle?.(property.id);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (property.listing_type === 'rental') {
      setShowBookingFlow(true);
    }
  };

  const handleInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    // Handle inquiry for sale properties
    console.log('Inquiry for property:', property.id);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={property.images[0] || '/placeholder.svg'}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart 
              className={`h-4 w-4 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </button>

          {property.rating && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-white/90 text-gray-800 space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{property.rating}</span>
              </Badge>
            </div>
          )}

          {/* Listing Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={property.listing_type === 'sale' ? 'default' : 'secondary'}>
              {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <Link to={`/property/${property.id}`}>
                <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                  {property.title}
                </h3>
              </Link>
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                {property.listing_type === 'rental' && property.max_guests && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{property.max_guests} guests</span>
                  </div>
                )}
                {property.bedrooms > 0 && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{property.bedrooms} bed</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{property.bathrooms} bath</span>
                  </div>
                )}
                {property.size_acres && (
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    <span>{property.size_acres} acres</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {property.listing_type === 'sale' ? (
                  <>
                    <span className="text-xl font-bold">ZMW {property.sale_price?.toLocaleString()}</span>
                    <span className="text-gray-600 text-sm block">Sale Price</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl font-bold">ZMW {property.price_per_night?.toLocaleString()}</span>
                    <span className="text-gray-600 text-sm"> / night</span>
                  </>
                )}
              </div>
              
              {property.listing_type === 'sale' ? (
                <Button 
                  onClick={handleInquiry}
                  size="sm"
                  variant="outline"
                  className="hover:bg-primary hover:text-white"
                >
                  Inquire
                </Button>
              ) : (
                <Button 
                  onClick={handleBookNow}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  Book Now
                </Button>
              )}
            </div>

            {property.reviewCount && (
              <div className="text-sm text-gray-500">
                {property.reviewCount} review{property.reviewCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showBookingFlow && property.listing_type === 'rental' && (
        <BookingFlow 
          property={property} 
          onClose={() => setShowBookingFlow(false)} 
        />
      )}
    </>
  );
};

export default PropertyCard;
