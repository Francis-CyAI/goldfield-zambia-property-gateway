
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    priceType: 'night' | 'month' | 'sale';
    rating: number;
    reviewCount: number;
    images: string[];
    propertyType: string;
    guests: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    isWishlisted: boolean;
    tier: 'low' | 'middle' | 'high';
  };
  onWishlistToggle: (id: string) => void;
}

const PropertyCard = ({ property, onWishlistToggle }: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    onWishlistToggle(property.id);
  };

  const tierColors = {
    low: 'bg-green-100 text-green-800',
    middle: 'bg-blue-100 text-blue-800',
    high: 'bg-purple-100 text-purple-800'
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/property/${property.id}`}>
        <div className="relative h-64 bg-gray-200 group">
          {property.images.length > 0 ? (
            <>
              <img 
                src={property.images[currentImageIndex]} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {property.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart 
              className={`h-4 w-4 ${
                property.isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </button>

          <Badge className={`absolute top-3 left-3 ${tierColors[property.tier]}`}>
            {property.tier === 'low' && 'Budget'}
            {property.tier === 'middle' && 'Standard'}
            {property.tier === 'high' && 'Luxury'}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{property.rating}</span>
            <span className="text-sm text-gray-500">({property.reviewCount})</span>
          </div>
          <Badge variant="outline">{property.propertyType}</Badge>
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
        
        <div className="flex items-center space-x-1 text-gray-600 mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{property.guests} guests</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms} bath</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">
              ZMW {property.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">
              {property.priceType === 'night' && ' / night'}
              {property.priceType === 'month' && ' / month'}
              {property.priceType === 'sale' && ''}
            </span>
          </div>
          <Link to={`/property/${property.id}`}>
            <Button size="sm">
              {property.priceType === 'sale' ? 'View Details' : 'Book Now'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
