
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Bed, Bath, X } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  guests: number;
  bedrooms: number;
  bathrooms: number;
  latitude?: number;
  longitude?: number;
}

interface PropertyMapViewProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
}

const PropertyMapView = ({ properties, onPropertySelect }: PropertyMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Mock coordinates for Zambian cities
  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'Lusaka': { lat: -15.3875, lng: 28.3228 },
    'Ndola': { lat: -12.9585, lng: 28.6362 },
    'Kitwe': { lat: -12.8024, lng: 28.2132 },
    'Livingstone': { lat: -17.8419, lng: 25.8532 },
    'Kabwe': { lat: -14.4467, lng: 28.4463 },
    'Mumbwa': { lat: -14.9833, lng: 27.0667 },
    'Kafue': { lat: -15.7691, lng: 28.1811 },
    'Chongwe': { lat: -15.3297, lng: 28.6820 },
    'Solwezi': { lat: -12.1844, lng: 26.8932 },
    'Kasama': { lat: -10.2129, lng: 31.1308 },
    'Chipata': { lat: -13.6304, lng: 32.6464 },
    'Mongu': { lat: -15.2545, lng: 23.1307 },
    'Choma': { lat: -16.8088, lng: 26.9871 }
  };

  // Add mock coordinates to properties
  const propertiesWithCoords = properties.map(property => {
    const cityCoord = cityCoordinates[property.location];
    return {
      ...property,
      latitude: cityCoord ? cityCoord.lat + (Math.random() - 0.5) * 0.1 : -15.3875,
      longitude: cityCoord ? cityCoord.lng + (Math.random() - 0.5) * 0.1 : 28.3228
    };
  });

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect?.(property);
  };

  return (
    <div className="relative h-full min-h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0">
        {!mapLoaded ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full bg-gradient-to-br from-green-50 to-blue-50">
            {/* Zambian Map Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin className="h-16 w-16 mx-auto mb-2" />
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">Properties across Zambia</p>
              </div>
            </div>

            {/* Property Markers */}
            {propertiesWithCoords.map((property, index) => (
              <div
                key={property.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${20 + (index % 5) * 15}%`,
                  top: `${20 + Math.floor(index / 5) * 15}%`
                }}
                onClick={() => handlePropertyClick(property)}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-transform hover:scale-110 ${
                    selectedProperty?.id === property.id ? 'bg-red-500' : 'bg-primary'
                  }`}>
                    <span className="text-sm">K{property.price}</span>
                  </div>
                  {selectedProperty?.id === property.id && (
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50">
                      <div className="bg-white rounded-lg shadow-xl p-4 min-w-[280px] border">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <div className="mb-3">
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-semibold text-sm line-clamp-2">
                              {property.title}
                            </h3>
                            <p className="text-xs text-gray-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {property.location}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="flex items-center">
                                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                  {property.rating}
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {property.guests}
                                </span>
                                <span className="flex items-center">
                                  <Bed className="h-3 w-3 mr-1" />
                                  {property.bedrooms}
                                </span>
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t">
                              <p className="font-bold text-sm">
                                K{property.price} <span className="text-xs font-normal text-gray-600">/ night</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-40">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                {properties.length} properties
              </Badge>
              <p className="text-xs text-gray-600">
                Click markers to view details
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-40">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded-full mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span>Selected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyMapView;
