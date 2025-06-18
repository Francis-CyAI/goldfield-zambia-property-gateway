
import { useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import PropertySearch from '@/components/PropertySearch';
import PropertyTypeFilter from '@/components/PropertyTypeFilter';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, MapIcon, Filter } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Properties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: properties = [], isLoading, error } = useProperties();
  const { data: wishlistedPropertyIds = [] } = useWishlist(user?.id);
  const toggleWishlistMutation = useToggleWishlist();

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

  const handleSearch = () => {
    console.log('Searching with filters:', filters);
    // Implement search logic
  };

  const handleWishlistToggle = (propertyId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save properties to your wishlist.',
        variant: 'destructive',
      });
      return;
    }

    const isWishlisted = wishlistedPropertyIds.includes(propertyId);
    toggleWishlistMutation.mutate({
      userId: user.id,
      propertyId,
      isWishlisted,
    });
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
    { value: 'newest', label: 'Newest' }
  ];

  const getFilteredProperties = () => {
    let filtered = [...properties];
    
    // Filter by property types
    if (selectedPropertyTypes.length > 0) {
      filtered = filtered.filter(property => 
        selectedPropertyTypes.some(type => 
          property.property_type.toLowerCase().includes(type.toLowerCase())
        )
      );
    }
    
    return filtered;
  };

  const getSortedProperties = () => {
    let sorted = getFilteredProperties();
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price_per_night - b.price_per_night);
      case 'price-high':
        return sorted.sort((a, b) => b.price_per_night - a.price_per_night);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return sorted;
    }
  };

  const filteredProperties = getSortedProperties();

  // Transform Supabase properties to match existing PropertyCard interface
  const transformedProperties = filteredProperties.map(property => ({
    id: property.id,
    title: property.title,
    location: property.location,
    price: property.price_per_night,
    priceType: 'night' as const,
    rating: 4.5, // TODO: Calculate from reviews
    reviewCount: 0, // TODO: Count from reviews
    images: property.images.length > 0 ? property.images : [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop'
    ],
    propertyType: property.property_type,
    guests: property.max_guests,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    amenities: property.amenities,
    isWishlisted: wishlistedPropertyIds.includes(property.id),
    tier: property.price_per_night > 500 ? 'high' as const : 
          property.price_per_night > 200 ? 'middle' as const : 'low' as const
  }));

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error loading properties</h1>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

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
                  {isLoading ? 'Loading...' : `${filteredProperties.length} properties found`}
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
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  transformedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  ))
                )}
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
            {!isLoading && transformedProperties.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load more properties
                </Button>
              </div>
            )}

            {/* No results message */}
            {!isLoading && transformedProperties.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
