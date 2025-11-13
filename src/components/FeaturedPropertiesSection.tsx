
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PropertyCard from './PropertyCard';
import { Zap, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties } from '@/hooks/useProperties';

const FeaturedPropertiesSection = () => {
  const { data: properties = [], isLoading } = useProperties();
  const [wishlistedProperties, setWishlistedProperties] = useState<string[]>([]);

  const featuredProperties = useMemo(() => properties.slice(0, 4), [properties]);

  const handleWishlistToggle = (propertyId: string) => {
    setWishlistedProperties((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId],
    );
  };

  const renderSkeletonCards = () =>
    Array.from({ length: 4 }, (_, index) => (
      <Card key={index} className="overflow-hidden">
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
    ));

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover handpicked listings added by property owners across Zambia. New uploads appear here
            automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading && renderSkeletonCards()}

          {!isLoading && featuredProperties.length > 0 && (
            <>
              {featuredProperties.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard
                    property={{
                      ...property,
                      listing_type: property.listing_type ?? (property.sale_price ? 'sale' : 'rental'),
                      isWishlisted: wishlistedProperties.includes(property.id),
                    }}
                    onWishlistToggle={handleWishlistToggle}
                  />
                  {(property.rating ?? 0) >= 4.8 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>Popular</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {!isLoading && featuredProperties.length === 0 && (
            <Card className="p-8 text-center col-span-full">
              <div className="flex flex-col items-center space-y-4">
                <Zap className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="text-xl font-semibold">No featured listings yet</h3>
                  <p className="text-gray-600 max-w-lg">
                    Once hosts start uploading properties, they will automatically appear here for renters and
                    buyers.
                  </p>
                </div>
                <Button onClick={() => (window.location.href = '/list-property')}>
                  List your first property
                </Button>
              </div>
            </Card>
          )}
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
