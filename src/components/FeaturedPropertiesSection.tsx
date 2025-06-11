
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedPropertiesSection = () => {
  const featuredProperties = [
    {
      id: 1,
      title: '4-Bedroom House in Kabulonga',
      price: 'K450,000',
      location: 'Lusaka',
      type: 'House',
      tier: 'Middle Class',
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: '50 Hectare Farm in Mumbwa',
      price: 'K280,000',
      location: 'Mumbwa',
      type: 'Farm',
      tier: 'Low Class',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Luxury Office Space in CBD',
      price: 'K800,000',
      location: 'Lusaka',
      type: 'Office',
      tier: 'High Class',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600">
            Discover some of our most popular listings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{property.title}</h3>
                  <Badge variant="outline">{property.tier}</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{property.type}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xl font-bold text-primary">{property.price}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/properties">
            <Button className="bg-primary hover:bg-primary/90">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPropertiesSection;
