
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, DollarSign, Star, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedPropertiesSection = () => {
  const featuredProperties = [
    {
      id: 1,
      title: 'Luxury 4-Bedroom Villa in Kabulonga',
      price: 'ZMW 450,000',
      location: 'Lusaka',
      type: 'House',
      tier: 'Premium',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Elite 50 Hectare Farm in Mumbwa',
      price: 'ZMW 280,000',
      location: 'Mumbwa',
      type: 'Farm',
      tier: 'Executive',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Presidential Office Space in CBD',
      price: 'ZMW 800,000',
      location: 'Lusaka',
      type: 'Office',
      tier: 'Platinum',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'Premium': return 'bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-white';
      case 'Executive': return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
      default: return 'bg-luxury-charcoal text-white';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-luxury-cream to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="h-8 w-8 text-luxury-gold" />
            <h2 className="text-4xl md:text-5xl font-bold text-luxury-charcoal font-playfair">
              Featured Properties
            </h2>
            <Crown className="h-8 w-8 text-luxury-gold" />
          </div>
          <div className="w-24 h-1 luxury-gradient mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-luxury-charcoal/80 max-w-3xl mx-auto leading-relaxed">
            Discover our most exclusive and carefully curated luxury properties, 
            handpicked for the discerning client who demands excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <Card key={property.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-2 border-luxury-gold/20 hover:border-luxury-gold/50">
              <div className="relative h-56 bg-gray-200 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={`${getTierColor(property.tier)} shadow-lg border-0 px-3 py-1 font-semibold`}>
                    {property.tier}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-luxury-gold text-luxury-gold" />
                  <span className="text-sm font-semibold text-luxury-charcoal">{property.rating}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-luxury-charcoal font-playfair group-hover:text-luxury-gold transition-colors duration-300">
                    {property.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-6 text-sm text-luxury-charcoal/70 mb-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-luxury-gold" />
                    <span className="font-medium">{property.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-luxury-gold" />
                    <span className="font-medium">{property.type}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-luxury-gold" />
                    <span className="text-2xl font-bold luxury-text-gradient font-playfair">{property.price}</span>
                  </div>
                  <Button size="sm" className="luxury-gradient text-white hover:shadow-lg transition-all duration-300 font-medium">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/properties">
            <Button className="luxury-gradient text-white hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-lg">
              <Crown className="h-5 w-5 mr-2" />
              Explore All Luxury Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPropertiesSection;
