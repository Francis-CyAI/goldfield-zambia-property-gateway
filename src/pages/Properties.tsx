import { useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import PropertySearch from '@/components/PropertySearch';
import PropertyTypeFilter from '@/components/PropertyTypeFilter';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, MapIcon, Filter } from 'lucide-react';

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

  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedProperties, setWishlistedProperties] = useState<string[]>([]);

  // Enhanced properties data with more types
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
      id: '7',
      title: 'Luxury Safari Lodge - Kafue National Park',
      location: 'Kafue National Park',
      price: 850,
      priceType: 'night' as const,
      rating: 4.9,
      reviewCount: 156,
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      propertyType: 'Lodge',
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['WiFi', 'Restaurant', 'Game Drives', 'Pool', 'Spa'],
      isWishlisted: wishlistedProperties.includes('7'),
      tier: 'high' as const
    },
    {
      id: '8',
      title: 'InterContinental Lusaka Hotel',
      location: 'CBD, Lusaka',
      price: 320,
      priceType: 'night' as const,
      rating: 4.7,
      reviewCount: 892,
      images: ['/placeholder.svg', '/placeholder.svg'],
      propertyType: 'Hotel',
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['WiFi', 'Restaurant', 'Gym', 'Business Center', 'Pool'],
      isWishlisted: wishlistedProperties.includes('8'),
      tier: 'high' as const
    },
    {
      id: '9',
      title: 'Lake Kariba Resort & Spa',
      location: 'Siavonga, Lake Kariba',
      price: 680,
      priceType: 'night' as const,
      rating: 4.8,
      reviewCount: 234,
      images: ['/placeholder.svg', '/placeholder.svg'],
      propertyType: 'Resort',
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['WiFi', 'Restaurant', 'Spa', 'Water Sports', 'Pool'],
      isWishlisted: wishlistedProperties.includes('9'),
      tier: 'high' as const
    },
    {
      id: '10',
      title: 'Cozy Guest House - Chilenje',
      location: 'Chilenje, Lusaka',
      price: 120,
      priceType: 'night' as const,
      rating: 4.3,
      reviewCount: 67,
      images: ['/placeholder.svg'],
      propertyType: 'Guest House',
      guests: 3,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['WiFi', 'Kitchen', 'Parking'],
      isWishlisted: wishlistedProperties.includes('10'),
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

  const handlePropertyTypeToggle = (type: string) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' }
  ];

  const getFilteredProperties = () => {
    let filtered = [...properties];
    
    // Filter by property types
    if (selectedPropertyTypes.length > 0) {
      filtered = filtered.filter(property => 
        selectedPropertyTypes.some(type => 
          property.propertyType.toLowerCase().includes(type.toLowerCase())
        )
      );
    }
    
    return filtered;
  };

  const getSortedProperties = () => {
    let sorted = getFilteredProperties();
    
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

  const filteredProperties = getSortedProperties();

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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="lg:hidden mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
            
            <div className={`space-y-6 ${showFilters || 'hidden lg:block'}`}>
              <PropertyTypeFilter
                selectedTypes={selectedPropertyTypes}
                onTypeToggle={handlePropertyTypeToggle}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {filteredProperties.length} properties found
                </h1>
                <p className="text-gray-600">
                  {filters.location && `in ${filters.location}`}
                  {selectedPropertyTypes.length > 0 && ` • ${selectedPropertyTypes.join(', ')}`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
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
      </div>
    </div>
  );
};

export default Properties;
