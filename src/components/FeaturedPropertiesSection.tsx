
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, DollarSign, Star, Crown, Zap, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedPropertiesSection = () => {
  const featuredProperties = [
    {
      id: 1,
      title: 'Victoria Falls Safari Lodge',
      price: 450,
      location: 'Livingstone',
      type: 'Safari Lodge',
      tier: 'Luxury',
      rating: 4.9,
      reviews: 234,
      guests: 4,
      bedrooms: 2,
      instantBook: true,
      verified: true,
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
      features: ['Pool', 'Game Viewing', 'Restaurant']
    },
    {
      id: 2,
      title: 'Modern Lusaka Apartment',
      price: 85,
      location: 'Lusaka CBD',
      type: 'Apartment',
      tier: 'Standard',
      rating: 4.7,
      reviews: 156,
      guests: 2,
      bedrooms: 1,
      instantBook: true,
      verified: true,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
      features: ['WiFi', 'Kitchen', 'Parking']
    },
    {
      id: 3,
      title: 'Lake Kariba Houseboat',
      price: 280,
      location: 'Lake Kariba',
      type: 'Houseboat',
      tier: 'Premium',
      rating: 4.8,
      reviews: 89,
      guests: 8,
      bedrooms: 4,
      instantBook: false,
      verified: true,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      features: ['Fishing', 'Deck', 'Generator']
    },
    {
      id: 4,
      title: 'Copper Belt Guesthouse',
      price: 60,
      location: 'Ndola',
      type: 'Guesthouse',
      tier: 'Budget',
      rating: 4.5,
      reviews: 92,
      guests: 6,
      bedrooms: 3,
      instantBook: true,
      verified: true,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      features: ['Breakfast', 'Airport Pickup', 'Laundry']
    },
    {
      id: 5,
      title: 'South Luangwa Bush Camp',
      price: 520,
      location: 'South Luangwa',
      type: 'Bush Camp',
      tier: 'Luxury',
      rating: 5.0,
      reviews: 67,
      guests: 2,
      bedrooms: 1,
      instantBook: false,
      verified: true,
      image: 'https://images.unsplash.com/photo-1534567110404-5996d426b9c8?w=400&h=300&fit=crop',
      features: ['Safari Walks', 'All Inclusive', 'Game Viewing']
    },
    {
      id: 6,
      title: 'Kafue River Lodge',
      price: 180,
      location: 'Kafue National Park',
      type: 'River Lodge',
      tier: 'Premium',
      rating: 4.6,
      reviews: 43,
      guests: 4,
      bedrooms: 2,
      instantBook: true,
      verified: true,
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop',
      features: ['Fishing', 'Boat Trips', 'Bird Watching']
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Luxury': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'Premium': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'Standard': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'Budget': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="h-8 w-8 text-orange-500" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Featured Zambian Stays
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Handpicked accommodations that showcase the best of Zambian hospitality, 
            from luxury safari lodges to cozy city apartments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <Card key={property.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-0 rounded-xl">
              <div className="relative h-56 bg-gray-200 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  <Badge className={`${getTierColor(property.tier)} shadow-lg border-0 px-3 py-1 font-semibold`}>
                    {property.tier}
                  </Badge>
                  {property.instantBook && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 py-1">
                      <Zap className="h-3 w-3 mr-1" />
                      Instant Book
                    </Badge>
                  )}
                </div>

                {/* Verification Badge */}
                {property.verified && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Shield className="h-4 w-4 text-green-500" />
                  </div>
                )}

                {/* Rating */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-900">{property.rating}</span>
                  <span className="text-xs text-gray-600">({property.reviews})</span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                    {property.title}
                  </h3>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{property.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{property.type}</span>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{property.guests} guests</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {property.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-200 text-gray-600">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      ZMW {property.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm"> / night</span>
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 font-semibold">
                    {property.instantBook ? 'Book Now' : 'View Details'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/properties">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 px-8 py-3 text-lg font-semibold rounded-xl">
              <Crown className="h-5 w-5 mr-2" />
              Explore All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPropertiesSection;
