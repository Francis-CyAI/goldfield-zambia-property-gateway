
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import PropertyTypeFilter from '@/components/PropertyTypeFilter';
import { useProperties } from '@/hooks/useProperties';
import { Skeleton } from '@/components/ui/skeleton';


const Properties = () => {
  const { data: properties = [], isLoading } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedProperties, setWishlistedProperties] = useState<string[]>([]);

  const normalizedProperties = useMemo(
    () =>
      properties.map((property) => ({
        ...property,
        listing_type: property.listing_type ?? (property.sale_price ? 'sale' : 'rental'),
      })),
    [properties],
  );

  const filteredProperties = useMemo(() => {
    return normalizedProperties.filter((property) => {
      const searchRegex = new RegExp(searchTerm, 'i');
      const locationMatch =
        selectedLocation === 'all' ||
        property.location.toLowerCase().includes(selectedLocation.toLowerCase());
      const propertyType = property.property_type ?? '';
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(propertyType);
      const listingType = property.listing_type ?? 'rental';
      const listingTypeMatch = listingTypeFilter === 'all' || listingType === listingTypeFilter;

      let priceMatch = true;
      if (priceRange !== 'all') {
        const price =
          listingType === 'sale'
            ? property.sale_price ?? 0
            : property.price_per_night ?? 0;

        if (listingType === 'sale') {
          priceMatch =
            (priceRange === '0-1000000' && price <= 1_000_000) ||
            (priceRange === '1000000-3000000' && price > 1_000_000 && price <= 3_000_000) ||
            (priceRange === '3000000+' && price > 3_000_000);
        } else {
          priceMatch =
            (priceRange === '0-200' && price <= 200) ||
            (priceRange === '200-400' && price > 200 && price <= 400) ||
            (priceRange === '400+' && price > 400);
        }
      }

      return (
        searchRegex.test(property.title) &&
        locationMatch &&
        typeMatch &&
        priceMatch &&
        listingTypeMatch
      );
    });
  }, [normalizedProperties, searchTerm, selectedLocation, selectedTypes, priceRange, listingTypeFilter]);

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

  const placeholderCards = useMemo(() => Array.from({ length: 6 }, (_, index) => index), []);

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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {placeholderCards.map((card) => (
              <Card key={card} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="space-y-3 pt-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
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
                  images: property.images && property.images.length > 0 ? property.images : ['/placeholder.svg'],
                  isWishlisted: wishlistedProperties.includes(property.id),
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
