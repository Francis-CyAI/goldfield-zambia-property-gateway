import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProperties } from '@/hooks/useProperties';
import PropertyCard from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, Wallet } from 'lucide-react';

const PropertiesForSale = () => {
  const { data: properties = [], isLoading } = useProperties();
  const saleProperties = useMemo(
    () => properties.filter((property) => (property.listing_type ?? (property.sale_price ? 'sale' : 'rental')) === 'sale'),
    [properties],
  );
  const placeholderCards = useMemo(() => Array.from({ length: 6 }, (_, idx) => idx), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Properties for Sale</h1>
              <p className="text-muted-foreground text-sm">
                Submit a purchase request to the admin. No card or mobile money payment is collected on the site.
              </p>
            </div>
            <Badge variant="secondary">{saleProperties.length} available</Badge>
          </div>
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                <ShieldCheck className="h-4 w-4" />
                Safe, offline purchase flow
              </CardTitle>
              <Badge className="bg-blue-600 text-white">
                <Wallet className="h-3 w-3 mr-1" />
                5% buyer markup · 10% admin fee to seller
              </Badge>
            </CardHeader>
            <CardContent className="text-sm text-blue-900">
              Buyers upload their ID (front and back) and share contact details. Admin receives a notification and
              finalizes the sale offline. Sellers see the 10% admin fee and can delete their uploaded data after payment.
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : saleProperties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No sale listings available</h3>
            <p className="text-muted-foreground">Check back soon for new properties for sale.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {saleProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesForSale;
