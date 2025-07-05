
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Users, Camera, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalization } from '@/contexts/LocalizationContext';

const PopularDestinations = () => {
  const { formatCurrency, currentCountry } = useLocalization();

  const destinations = [
    {
      id: 1,
      name: 'Livingstone',
      country: 'Zambia',
      countryCode: 'ZM',
      subtitle: 'Victoria Falls Gateway',
      description: 'Experience the thundering Victoria Falls and luxury safari lodges',
      image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
      properties: 120,
      rating: 4.9,
      startingPrice: 250,
      highlights: ['Victoria Falls', 'Safari Lodges', 'Adventure Sports'],
      instantBook: true,
      region: 'Southern Africa'
    },
    {
      id: 2,
      name: 'Cape Town',
      country: 'South Africa',
      countryCode: 'ZA',
      subtitle: 'Mother City Magic',
      description: 'Stunning mountain views, wine estates, and vibrant city life',
      image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop',
      properties: 450,
      rating: 4.8,
      startingPrice: 180,
      highlights: ['Table Mountain', 'Wine Tours', 'Ocean Views'],
      instantBook: true,
      region: 'Southern Africa'
    },
    {
      id: 3,
      name: 'Serengeti',
      country: 'Tanzania',
      countryCode: 'TZ',
      subtitle: 'Safari Paradise',
      description: 'Witness the Great Migration and incredible wildlife',
      image: 'https://images.unsplash.com/photo-1534567110404-5996d426b9c8?w=800&h=600&fit=crop',
      properties: 85,
      rating: 4.9,
      startingPrice: 420,
      highlights: ['Wildlife Safari', 'Great Migration', 'Luxury Camps'],
      instantBook: false,
      region: 'East Africa'
    },
    {
      id: 4,
      name: 'Maasai Mara',
      country: 'Kenya',
      countryCode: 'KE',
      subtitle: 'Wildlife Kingdom',
      description: 'World-famous game reserve with incredible biodiversity',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop',
      properties: 75,
      rating: 4.8,
      startingPrice: 380,
      highlights: ['Big Five', 'Maasai Culture', 'Hot Air Balloons'],
      instantBook: true,
      region: 'East Africa'
    },
    {
      id: 5,
      name: 'Accra',
      country: 'Ghana',
      countryCode: 'GH',
      subtitle: 'Gateway to West Africa',
      description: 'Rich history, vibrant culture, and beautiful beaches',
      image: 'https://images.unsplash.com/photo-1544306094-57c5b1e6c3b8?w=800&h=600&fit=crop',
      properties: 95,
      rating: 4.6,
      startingPrice: 120,
      highlights: ['Historic Sites', 'Cultural Tours', 'Atlantic Beaches'],
      instantBook: true,
      region: 'West Africa'
    },
    {
      id: 6,
      name: 'Marrakech',
      country: 'Morocco',
      countryCode: 'MA',
      subtitle: 'Imperial City',
      description: 'Ancient medinas, stunning riads, and Atlas Mountains',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop',
      properties: 280,
      rating: 4.7,
      startingPrice: 90,
      highlights: ['Medina Tours', 'Atlas Mountains', 'Traditional Riads'],
      instantBook: true,
      region: 'North Africa'
    }
  ];

  const getCountryFlag = (countryCode: string) => {
    const country = currentCountry.code === countryCode ? currentCountry : 
      destinations.find(d => d.countryCode === countryCode);
    
    const flagMap: Record<string, string> = {
      'ZM': '🇿🇲', 'ZA': '🇿🇦', 'TZ': '🇹🇿', 'KE': '🇰🇪', 'GH': '🇬🇭', 'MA': '🇲🇦'
    };
    
    return flagMap[countryCode] || '🌍';
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 flex items-center justify-center space-x-3">
            <Globe2 className="h-12 w-12 text-orange-500" />
            <span>African Destinations</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From Victoria Falls to the Serengeti, discover the best places to stay across our beautiful continent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Card key={destination.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-0 rounded-xl">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Country Flag Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-gray-800 border-0 px-3 py-1 backdrop-blur-sm">
                    <span className="mr-1">{getCountryFlag(destination.countryCode)}</span>
                    {destination.country}
                  </Badge>
                </div>

                {/* Instant Book Badge */}
                {destination.instantBook && (
                  <div className="absolute top-4 right-16">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 py-1">
                      <Camera className="h-3 w-3 mr-1" />
                      Book Instantly
                    </Badge>
                  </div>
                )}

                {/* Rating */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-900">{destination.rating}</span>
                </div>

                {/* Destination Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{destination.name}</h3>
                  <p className="text-orange-200 font-medium">{destination.subtitle}</p>
                </div>
              </div>

              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 leading-relaxed">{destination.description}</p>

                {/* Region Badge */}
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                    {destination.region}
                  </Badge>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {destination.highlights.map((highlight, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-orange-200 text-orange-700">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{destination.properties} properties</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{destination.country}</span>
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(destination.startingPrice)}
                    </span>
                    <span className="text-gray-500 text-sm"> / night</span>
                  </div>
                  <Link to={`/properties?location=${destination.name.toLowerCase()}`}>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
                      Explore
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/properties">
            <Button variant="outline" size="lg" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300 px-8 py-3">
              <Globe2 className="h-5 w-5 mr-2" />
              Explore All African Destinations
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
