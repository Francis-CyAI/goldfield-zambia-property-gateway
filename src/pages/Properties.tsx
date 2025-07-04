
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Users, Bed, Bath, Star, Heart, Filter, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import PropertyTypeFilter from '../components/PropertyTypeFilter';
import { Property } from '../types/property';

// Enhanced mock data with diverse property types
const mockProperties: Property[] = [
  // Residential Properties
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
    amenities: ['WiFi', 'Pool', 'Garden', 'Parking'],
    listing_type: 'rental'
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
    amenities: ['WiFi', 'Kitchen', 'Balcony'],
    listing_type: 'rental'
  },
  // Student Accommodation
  {
    id: '3',
    title: 'Student Room near University of Zambia',
    location: 'Great East Road, Lusaka (Near UNZA)',
    price_per_night: 25,
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop'],
    rating: 4.3,
    reviewCount: 18,
    cleaningFee: 10,
    serviceFee: 5,
    property_type: 'student_room',
    amenities: ['WiFi', 'Study Desk', 'Shared Kitchen', 'Security'],
    listing_type: 'rental'
  },
  {
    id: '4',
    title: 'Student Accommodation near Copperbelt University',
    location: 'Riverside, Kitwe (Near CBU)',
    price_per_night: 30,
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'],
    rating: 4.5,
    reviewCount: 12,
    cleaningFee: 10,
    serviceFee: 5,
    property_type: 'student_room',
    amenities: ['WiFi', 'Study Area', 'Laundry', 'Transport Links'],
    listing_type: 'rental'
  },
  // Commercial Properties
  {
    id: '5',
    title: 'Modern Office Space - Cairo Road',
    location: 'Cairo Road Business District, Lusaka',
    price_per_night: 200,
    max_guests: 20,
    bedrooms: 0,
    bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
    rating: 4.8,
    reviewCount: 15,
    cleaningFee: 50,
    serviceFee: 30,
    property_type: 'office',
    amenities: ['High-Speed Internet', 'Meeting Rooms', 'Parking', 'Security', 'AC'],
    listing_type: 'rental'
  },
  {
    id: '6',
    title: 'Large Warehouse - Industrial Area',
    location: 'Heavy Industrial Area, Lusaka',
    price_per_night: 500,
    max_guests: 0,
    bedrooms: 0,
    bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop'],
    rating: 4.6,
    reviewCount: 8,
    cleaningFee: 100,
    serviceFee: 50,
    property_type: 'warehouse',
    amenities: ['Loading Bay', 'Forklift Access', 'Security', '24/7 Access', 'Office Space'],
    listing_type: 'rental'
  },
  // Agricultural Properties (Sale Only)
  {
    id: '7',
    title: 'Productive Farm - Mkushi',
    location: 'Mkushi Farming Block',
    sale_price: 2500000, // ZMW 2.5M
    size_acres: 150,
    bedrooms: 3,
    bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'],
    rating: 4.9,
    reviewCount: 6,
    property_type: 'farm',
    amenities: ['Irrigation System', 'Farm Equipment', 'Storage Facilities', 'Worker Housing'],
    listing_type: 'sale'
  },
  {
    id: '8',
    title: 'Prime Farmland - Chisamba',
    location: 'Chisamba District',
    sale_price: 1800000, // ZMW 1.8M
    size_acres: 200,
    bedrooms: 0,
    bathrooms: 0,
    images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop'],
    rating: 4.7,
    reviewCount: 4,
    property_type: 'farmland',
    amenities: ['Fertile Soil', 'Water Access', 'Road Access', 'Title Deed'],
    listing_type: 'sale'
  },
  // Mixed Properties
  {
    id: '9',
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
    amenities: ['Full Board', 'Game Drives', 'Pool', 'Spa'],
    listing_type: 'rental'
  },
  {
    id: '10',
    title: 'Retail Space - Shopping Mall',
    location: 'Manda Hill Shopping Centre, Lusaka',
    price_per_night: 300,
    max_guests: 0,
    bedrooms: 0,
    bathrooms: 1,
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'],
    rating: 4.4,
    reviewCount: 11,
    cleaningFee: 40,
    serviceFee: 20,
    property_type: 'retail',
    amenities: ['High Foot Traffic', 'Parking', 'Security', 'Display Windows'],
    listing_type: 'rental'
  },
  // Additional Sale Properties
  {
    id: '11',
    title: 'Commercial Ranch - Southern Province',
    location: 'Mazabuka District',
    sale_price: 3200000, // ZMW 3.2M
    size_acres: 300,
    bedrooms: 2,
    bathrooms: 1,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'],
    rating: 4.8,
    reviewCount: 3,
    property_type: 'ranch',
    amenities: ['Cattle Facilities', 'Water Boreholes', 'Fencing', 'Staff Quarters'],
    listing_type: 'sale'
  }
];

const Properties = () => {
  const [properties] = useState<Property[]>(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedProperties, setWishlistedProperties] = useState<string[]>([]);

  const handleWishlistToggle = (propertyId: string) => {
    setWishlistedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const filteredProperties = properties.filter(property => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const locationMatch = selectedLocation === 'all' || property.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(property.property_type || '');
    const listingTypeMatch = listingTypeFilter === 'all' || property.listing_type === listingTypeFilter;
    
    let priceMatch = true;
    if (priceRange !== 'all') {
      const price = property.listing_type === 'sale' ? property.sale_price : property.price_per_night;
      if (property.listing_type === 'sale') {
        priceMatch = (priceRange === '0-1000000' && price <= 1000000) ||
                    (priceRange === '1000000-3000000' && price > 1000000 && price <= 3000000) ||
                    (priceRange === '3000000+' && price > 3000000);
      } else {
        priceMatch = (priceRange === '0-200' && price <= 200) ||
                    (priceRange === '200-400' && price > 200 && price <= 400) ||
                    (priceRange === '400+' && price > 400);
      }
    }

    return searchRegex.test(property.title) && locationMatch && typeMatch && priceMatch && listingTypeMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">All Properties</h1>
            <Badge variant="secondary">
              {filteredProperties.length} Results
            </Badge>
          </div>

          <Button onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Search and Basic Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
                      <SelectItem value="Kitwe">Kitwe</SelectItem>
                      <SelectItem value="Ndola">Ndola</SelectItem>
                      <SelectItem value="Mkushi">Mkushi</SelectItem>
                      <SelectItem value="Chisamba">Chisamba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Listing Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="rental">For Rent</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      {listingTypeFilter === 'sale' || listingTypeFilter === 'all' ? (
                        <>
                          <SelectItem value="0-1000000">ZMW 0 - 1M (Sale)</SelectItem>
                          <SelectItem value="1000000-3000000">ZMW 1M - 3M (Sale)</SelectItem>
                          <SelectItem value="3000000+">ZMW 3M+ (Sale)</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="0-200">ZMW 0 - 200 per night</SelectItem>
                          <SelectItem value="200-400">ZMW 200 - 400 per night</SelectItem>
                          <SelectItem value="400+">ZMW 400+ per night</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Advanced Property Type Filters */}
        {showFilters && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <PropertyTypeFilter 
              selectedTypes={selectedTypes}
              onTypeToggle={handleTypeToggle}
            />
          </div>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Properties;
