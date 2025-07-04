
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PropertyCard from './PropertyCard';
import { Zap, TrendingUp } from 'lucide-react';

// Mock data - this would come from your API
const featuredProperties = [
  {
    id: '1',
    title: 'Luxury Villa in Lusaka',
    location: 'Kabulonga, Lusaka',
    price_per_night: 450,
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'],
    rating: 4.9,
    reviewCount: 47,
    cleaningFee: 50,
    serviceFee: 25
  },
  {
    id: '2',
    title: 'Modern Apartment Downtown',
    location: 'Cairo Road, Lusaka',
    price_per_night: 180,
    max_guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
    rating: 4.7,
    reviewCount: 32,
    cleaningFee: 30,
    serviceFee: 15
  },
  {
    id: '3',
    title: 'Safari Lodge Experience',
    location: 'South Luangwa National Park',
    price_per_night: 650,
    max_guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'],
    rating: 5.0,
    reviewCount: 89,
    cleaningFee: 75,
    serviceFee: 35
  },
  {
    id: '4',
    title: 'Lakeside Cottage',
    location: 'Lake Kariba',
    price_per_night: 320,
    max_guests: 5,
    bedrooms: 2,
    bathrooms: 1,
    images: ['https://images.unsplash.com/photo-1544077960-604201fe74bc?w=800&h=600&fit=crop'],
    rating: 4.8,
    reviewCount: 23,
    cleaningFee: 40,
    serviceFee: 20
  }
];

const FeaturedPropertiesSection = () => {
  const [wishlistedProperties, setWishlistedProperties] = useState<string[]>([]);

  const handleWishlistToggle = (propertyId: string) => {
    setWishlistedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover handpicked accommodations across Zambia with instant booking and secure payments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard 
                property={{
                  ...property,
                  isWishlisted: wishlistedProperties.includes(property.id)
                }}
                onWishlistToggle={handleWishlistToggle}
              />
              {property.rating >= 4.8 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>Popular</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="inline-block">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Instant Booking Available</h3>
                  <p className="text-gray-600 text-sm">
                    Book instantly with secure payments via mobile money or card
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPropertiesSection;
