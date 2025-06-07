
import { useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import PropertySearch from '@/components/PropertySearch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, MapIcon } from 'lucide-react';

const Properties = () => {
  const [filters, setFilters] = useState({
    location: '',
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    guests: 1,
    propertyType: '',
    tier: '',
    priceRange: [0, 1000000] as [number, number],
    amenities: [] as string[]
  });

  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [wishlistedProperties, setWishlistedProperties] = useState<string[]>([]);

  // Mock properties data
  const properties = [
    {
      id: '1',
      title: 'Beautiful 4-Bedroom House in Kabulonga',
      location: 'Kabulonga, Lusaka',
      price: 450,
      priceType: 'night' as const,
      rating: 4.8,
      reviewCount: 127,
      images: ['/placeholder.svg', '/placeholder.svg'],
      propertyType: 'House',
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['WiFi', 'Kitchen', 'Parking', 'Pool'],
      isWishlisted: wishlistedProperties.includes('1'),
      tier: 'middle' as const
    },
    {
      id: '2',
      title: 'Modern Apartment in CBD',
      location: 'CBD, Lusaka',
      price: 280,
      priceType: 'night' as const,
      rating: 4.6,
      reviewCount: 89,
      images: ['/placeholder.svg'],
      propertyType: 'Apartment',
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['WiFi', 'Kitchen', 'Security'],
      isWishlisted: wishlistedProperties.includes('2'),
      tier: 'middle' as const
    },
    {
      id: '3',
      title: 'Luxury Villa with Pool',
      location: 'Roma, Lusaka',
      price: 850,
      priceType: 'night' as const,
      rating: 4.9,
      reviewCount: 203,
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      propertyType: 'Villa',
      guests: 12,
      bedrooms: 6,
      bathrooms: 5,
      amenities: ['WiFi', 'Kitchen', 'Pool', 'Garden', 'Security'],
      isWishlisted: wishlistedProperties.includes('3'),
      tier: 'high' as const
    },
    {
      id: '4',
      title: 'Cozy Guest House',
      location: 'Chilenje, Lusaka',
      price: 120,
      priceType: 'night' as const,
      rating: 4.3,
      reviewCount: 45,
      images: ['/placeholder.svg'],
      propertyType: 'Guest House',
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['WiFi', 'Parking'],
      isWishlisted: wishlistedProperties.includes('4'),
      tier: 'low' as const
    },
    {
      id: '5',
      title: '50 Hectare Farm in Mumbwa',
      location: 'Mumbwa',
      price: 280000,
      priceType: 'sale' as const,
      rating: 4.5,
      reviewCount: 12,
      images: ['/placeholder.svg', '/placeholder.svg'],
      propertyType: 'Farm',
      guests: 0,
      bedrooms: 0,
      bathrooms: 0,
      amenities: ['Water Access', 'Fertile Soil'],
      isWishlisted: wishlistedProperties.includes('5'),
      tier: 'low' as const
    },
    {
      id: '6',
      title: 'Commercial Office Space',
      location: 'CBD, Lusaka',
      price: 1200,
      priceType: 'month' as const,
      rating: 4.4,
      reviewCount: 23,
      images: ['/placeholder.svg'],
      propertyType: 'Office',
      guests: 0,
      bedrooms: 0,
      bathrooms: 2,
      amenities: ['WiFi', 'Parking', 'Security', 'Generator'],
      isWishlisted: wishlistedProperties.includes('6'),
      tier: 'middle' as const
    }
  ];

  const handleSearch = () => {
    console.log('Searching with filters:', filters);
    // Implement search logic
  };

  const handleWishlistToggle = (propertyId: string) => {
    setWishlistedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' }
  ];

  const getSortedProperties = () => {
    let sorted = [...properties];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <PropertySearch
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {properties.length} properties found
            </h1>
            <p className="text-gray-600">
              {filters.location && `in ${filters.location}`}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              {viewMode === 'list' ? 'Show map' : 'Show list'}
            </Button>
          </div>
        </div>

        {/* Properties Grid */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getSortedProperties().map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        ) : (
          <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Map view coming soon</p>
            </div>
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load more properties
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Properties;
