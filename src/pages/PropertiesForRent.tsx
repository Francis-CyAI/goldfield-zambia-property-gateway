import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProperties } from '@/hooks/useProperties';
import PropertyCard from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Home } from 'lucide-react';

const PropertiesForRent = () => {
  const { data: properties = [], isLoading } = useProperties();
  const rentalProperties = useMemo(
    () => properties.filter((property) => (property.listing_type ?? 'rental') === 'rental'),
    [properties],
  );
  const placeholderCards = useMemo(() => Array.from({ length: 6 }, (_, idx) => idx), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Properties for Rent</h1>
            <p className="text-muted-foreground text-sm">
              Book short-term and long-term stays across Zambia.
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            {rentalProperties.length} available
          </Badge>
        </div>
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rentalProperties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No rental listings available</h3>
            <p className="text-muted-foreground">Check back soon for new rentals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rentalProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesForRent;
