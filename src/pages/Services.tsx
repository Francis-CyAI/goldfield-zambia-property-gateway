
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  DollarSign, 
  Building, 
  Users, 
  Globe, 
  ShoppingCart, 
  MapPin, 
  Star,
  CheckCircle,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const [selectedTier, setSelectedTier] = useState('all');

  const serviceCategories = [
    {
      id: 'buy',
      title: 'Buy a Property',
      icon: ShoppingCart,
      description: 'Find your perfect property from our extensive listings',
      features: [
        'Company-owned properties',
        'Agent-assisted listings', 
        'Legal title verification',
        'Diaspora-friendly payment options',
        'Virtual tours available',
        'Professional property inspection'
      ]
    },
    {
      id: 'sell',
      title: 'Sell Your Property',
      icon: DollarSign,
      description: 'Get the best value for your property with our expert services',
      features: [
        'Direct purchase by our company',
        'Agent-assisted sales',
        'Free property valuation',
        'Professional photography',
        'Marketing across all channels',
        'Legal documentation support'
      ]
    },
    {
      id: 'rent',
      title: 'List for Rent',
      icon: Building,
      description: 'Maximize your rental income with our management services',
      features: [
        'Tenant sourcing and screening',
        'Rental agreement preparation',
        'Property management services',
        'Rent collection assistance',
        'Maintenance coordination',
        'Market rate optimization'
      ]
    },
    {
      id: 'diaspora',
      title: 'Diaspora Services',
      icon: Globe,
      description: 'Specialized services for Zambians living abroad',
      features: [
        'Virtual property tours',
        'Remote transaction processing',
        'Foreign currency payments',
        'Property management while abroad',
        'Investment consultation',
        'Zoom/WhatsApp consultations'
      ]
    }
  ];

  const propertyTiers = [
    {
      id: 'low',
      name: 'Low Class',
      description: 'Basic & Affordable',
      priceRange: 'K50,000 - K200,000',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'middle',
      name: 'Middle Class', 
      description: 'Standard Quality',
      priceRange: 'K200,000 - K500,000',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'high',
      name: 'High Class',
      description: 'Premium & Luxury',
      priceRange: 'K500,000+',
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const locations = {
    cities: [
      'Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe'
    ],
    farming: [
      'Mumbwa', 'Kafue', 'Chongwe', 'Chibombo', 'Mazabuka', 'Mpongwe', 'Mkushi'
    ]
  };

  const propertyTypes = [
    { name: 'Farms', icon: Home, description: 'Agricultural land and commercial farms' },
    { name: 'Plots', icon: MapPin, description: 'Residential and commercial plots' },
    { name: 'Houses', icon: Building, description: 'Family homes and residential properties' },
    { name: 'Boarding House', icon: Users, description: 'Student and worker accommodation' },
    { name: 'Furnished Apartment', icon: Star, description: 'Ready-to-move rental units' },
    { name: 'Warehouses', icon: Building, description: 'Industrial storage facilities' },
    { name: 'Office Space / Shops', icon: ShoppingCart, description: 'Commercial business properties' }
  ];

  const sampleProperties = [
    {
      id: 1,
      title: '4-Bedroom House in Kabulonga',
      price: 'K450,000',
      location: 'Lusaka',
      type: 'House',
      tier: 'middle',
      description: 'Modern family home with garden and parking'
    },
    {
      id: 2,
      title: '50 Hectare Farm in Mumbwa',
      price: 'K280,000',
      location: 'Mumbwa',
      type: 'Farm',
      tier: 'low',
      description: 'Fertile agricultural land with water access'
    },
    {
      id: 3,
      title: 'Luxury Office Complex CBD',
      price: 'K800,000',
      location: 'Lusaka',
      type: 'Office',
      tier: 'high',
      description: 'Premium office space in central business district'
    },
    {
      id: 4,
      title: 'Student Boarding House',
      price: 'K320,000',
      location: 'Lusaka',
      type: 'Boarding',
      tier: 'middle',
      description: '20-room boarding facility near universities'
    },
    {
      id: 5,
      title: 'Industrial Warehouse',
      price: 'K180,000',
      location: 'Kitwe',
      type: 'Warehouse',
      tier: 'low',
      description: 'Large storage facility with loading docks'
    },
    {
      id: 6,
      title: 'Furnished Penthouse',
      price: 'K650,000',
      location: 'Lusaka',
      type: 'Apartment',
      tier: 'high',
      description: 'Luxury furnished apartment with city views'
    }
  ];

  const filteredProperties = selectedTier === 'all' 
    ? sampleProperties 
    : sampleProperties.filter(property => property.tier === selectedTier);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive real estate services tailored to meet your needs, whether you're buying, 
            selling, renting, or investing from abroad.
          </p>
        </div>

        {/* Service Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {serviceCategories.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="block mt-4">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Property Tiers */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Property Tiers</CardTitle>
            <CardDescription className="text-center text-lg">
              Choose from our three quality levels to match your budget and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {propertyTiers.map((tier) => (
                <Card key={tier.id} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <Badge className={`${tier.color} mb-4 px-4 py-2`}>
                      {tier.name}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-2">{tier.description}</h3>
                    <p className="text-2xl font-bold text-primary mb-4">{tier.priceRange}</p>
                    <p className="text-gray-600 text-sm">
                      {tier.id === 'low' && 'Perfect for first-time buyers and investors looking for affordable options'}
                      {tier.id === 'middle' && 'Ideal for families seeking quality properties with modern amenities'}
                      {tier.id === 'high' && 'Luxury properties with premium features and prime locations'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-primary" />
                <span>Major Cities</span>
              </CardTitle>
              <CardDescription>
                Urban properties including houses, apartments, shops, and offices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {locations.cities.map((city) => (
                  <Badge key={city} variant="outline" className="justify-center py-2">
                    {city}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-secondary" />
                <span>Farming & Plot Areas</span>
              </CardTitle>
              <CardDescription>
                Agricultural land, farms, and development plots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {locations.farming.map((area) => (
                  <Badge key={area} variant="outline" className="justify-center py-2">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Types */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Property Types</CardTitle>
            <CardDescription className="text-center text-lg">
              We specialize in all types of properties to meet diverse investment needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertyTypes.map((type, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <type.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{type.name}</h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sample Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Featured Properties</CardTitle>
            <CardDescription className="text-center text-lg">
              Browse some of our current listings across different tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" onClick={() => setSelectedTier('all')}>All Properties</TabsTrigger>
                <TabsTrigger value="low" onClick={() => setSelectedTier('low')}>Low Class</TabsTrigger>
                <TabsTrigger value="middle" onClick={() => setSelectedTier('middle')}>Middle Class</TabsTrigger>
                <TabsTrigger value="high" onClick={() => setSelectedTier('high')}>High Class</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <Card key={property.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">{property.title}</h3>
                          <Badge 
                            className={propertyTiers.find(t => t.id === property.tier)?.color}
                          >
                            {propertyTiers.find(t => t.id === property.tier)?.name}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{property.description}</p>
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
                          <span className="text-2xl font-bold text-primary">{property.price}</span>
                          <Button size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-primary to-secondary text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Find Your Perfect Property?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Contact our expert team today and let us help you achieve your real estate goals
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact an Agent
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                    Client Portal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;
