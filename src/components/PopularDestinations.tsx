
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Users, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const PopularDestinations = () => {
  const destinations = [
    {
      id: 1,
      name: 'Livingstone',
      subtitle: 'Victoria Falls Gateway',
      description: 'Experience the thundering Victoria Falls and luxury safari lodges',
      image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
      properties: 120,
      rating: 4.9,
      startingPrice: 250,
      highlights: ['Victoria Falls', 'Safari Lodges', 'Adventure Sports'],
      instantBook: true
    },
    {
      id: 2,
      name: 'Lusaka',
      subtitle: 'Capital City Comfort',
      description: 'Modern apartments and homes in Zambia\'s bustling capital',
      image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800&h=600&fit=crop',
      properties: 200,
      rating: 4.7,
      startingPrice: 80,
      highlights: ['City Center', 'Business District', 'Shopping Malls'],
      instantBook: true
    },
    {
      id: 3,
      name: 'Ndola',
      subtitle: 'Copperbelt Hub',
      description: 'Comfortable stays in the heart of Zambia\'s mining region',
      image: 'https://images.unsplash.com/photo-1573160813927-2de6c2b2c525?w=800&h=600&fit=crop',
      properties: 85,
      rating: 4.6,
      startingPrice: 60,
      highlights: ['Mining Heritage', 'Industrial Hub', 'Local Culture'],
      instantBook: true
    },
    {
      id: 4,
      name: 'South Luangwa',
      subtitle: 'Wildlife Paradise',
      description: 'Exclusive bush camps and lodges in pristine wilderness',
      image: 'https://images.unsplash.com/photo-1534567110404-5996d426b9c8?w=800&h=600&fit=crop',
      properties: 45,
      rating: 4.9,
      startingPrice: 400,
      highlights: ['Wildlife Safari', 'Bush Camps', 'Walking Safaris'],
      instantBook: false
    },
    {
      id: 5,
      name: 'Kafue National Park',
      subtitle: 'Untamed Wilderness',
      description: 'Remote lodges in Africa\'s second-largest national park',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop',
      properties: 25,
      rating: 4.8,
      startingPrice: 350,
      highlights: ['Game Drives', 'River Safari', 'Bird Watching'],
      instantBook: false
    },
    {
      id: 6,
      name: 'Lake Kariba',
      subtitle: 'Waterfront Retreats',
      description: 'Houseboats and lakeside lodges on Africa\'s largest artificial lake',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      properties: 35,
      rating: 4.7,
      startingPrice: 180,
      highlights: ['Houseboats', 'Fishing', 'Sunset Views'],
      instantBook: true
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Popular Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From Victoria Falls to the heart of Lusaka, discover the best places to stay across Zambia
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
                
                {/* Instant Book Badge */}
                {destination.instantBook && (
                  <div className="absolute top-4 left-4">
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
                    <span>Zambia</span>
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      ZMW {destination.startingPrice.toLocaleString()}
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
              View All Destinations
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
