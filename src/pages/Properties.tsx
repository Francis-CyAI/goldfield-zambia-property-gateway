import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Users, Bed, Bath, Star, Heart, Filter, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../types/property';

// Mock data - in a real app this would come from your API
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa in Kabulonga',
    location: 'Kabulonga, Lusaka',
    price_per_night: 450,
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'],
    rating: 4.9,
    reviewCount: 47,
    cleaningFee: 50,
    serviceFee: 25,
    property_type: 'villa',
    amenities: ['WiFi', 'Pool', 'Garden', 'Parking']
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
    serviceFee: 15,
    property_type: 'apartment',
    amenities: ['WiFi', 'Kitchen', 'Balcony']
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
    serviceFee: 35,
    property_type: 'lodge',
    amenities: ['Full Board', 'Game Drives', 'Pool']
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
    serviceFee: 20,
    property_type: 'cottage',
    amenities: ['Private Beach', 'Braai Area', 'Fishing']
  },
  {
    id: '5',
    title: 'Farmhouse Retreat',
    location: 'Mkushi Farming Block',
    price_per_night: 280,
    max_guests: 10,
    bedrooms: 5,
    bathrooms: 3,
    images: ['https://images.unsplash.com/photo-1519377389980-915c6942c9f0?w=800&h=600&fit=crop'],
    rating: 4.6,
    reviewCount: 15,
    cleaningFee: 60,
    serviceFee: 30,
    property_type: 'farmhouse',
    amenities: ['Large Garden', 'Farm Animals', 'Hiking Trails']
  }
];

const Properties = () => {
  const [properties] = useState<Property[]>(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedProperties, setWishlistedProperties] = useState<string[]>([]);

  const handleWishlistToggle = (propertyId: string) => {
    setWishlistedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const filteredProperties = properties.filter(property => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const locationMatch = selectedLocation === 'all' || property.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const typeMatch = selectedType === 'all' || property.property_type === selectedType;
    const priceMatch = priceRange === 'all' ||
      (priceRange === '0-200' && property.price_per_night <= 200) ||
      (priceRange === '200-400' && property.price_per_night > 200 && property.price_per_night <= 400) ||
      (priceRange === '400+' && property.price_per_night > 400);

    return searchRegex.test(property.title) && locationMatch && typeMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Explore Properties</h1>
            <Badge variant="secondary">
              {filteredProperties.length} Results
            </Badge>
          </div>

          <Button onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {showFilters && (
              <>
                <div className="md:col-span-1">
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Location</SelectItem>
                      <SelectItem value="Lusaka">Lusaka</SelectItem>
                      <SelectItem value="Lake Kariba">Lake Kariba</SelectItem>
                      <SelectItem value="Mkushi">Mkushi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Type</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="cottage">Cottage</SelectItem>
                      <SelectItem value="lodge">Lodge</SelectItem>
                      <SelectItem value="farmhouse">Farmhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="0-200">ZMW 0 - 200</SelectItem>
                      <SelectItem value="200-400">ZMW 200 - 400</SelectItem>
                      <SelectItem value="400+">ZMW 400+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard 
              key={property.id}
              property={{
                ...property,
                isWishlisted: wishlistedProperties.includes(property.id)
              }}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Properties;
