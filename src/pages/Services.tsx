
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
  Phone,
  Search,
  Heart,
  MessageCircle,
  Calendar,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
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

  const platformFeatures = [
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Filter properties by location, price, amenities, and more'
    },
    {
      icon: Heart,
      title: 'Wishlist & Favorites',
      description: 'Save properties you love and track price changes'
    },
    {
      icon: MessageCircle,
      title: 'Direct Messaging',
      description: 'Chat directly with property owners and agents'
    },
    {
      icon: Calendar,
      title: 'Booking System',
      description: 'Book viewings, tours, and rental periods instantly'
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      description: 'Read authentic reviews from previous tenants and buyers'
    },
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'All properties are verified for authenticity and legal compliance'
    }
  ];

  const propertyTiers = [
    {
      id: 'low',
      name: 'Budget Properties',
      description: 'Basic & Affordable',
      priceRange: 'K50,000 - K200,000',
      color: 'bg-green-100 text-green-800',
      features: ['First-time buyer friendly', 'Basic amenities', 'Good value for money']
    },
    {
      id: 'middle',
      name: 'Standard Properties', 
      description: 'Quality & Comfort',
      priceRange: 'K200,000 - K500,000',
      color: 'bg-blue-100 text-blue-800',
      features: ['Modern amenities', 'Prime locations', 'Family-friendly']
    },
    {
      id: 'high',
      name: 'Luxury Properties',
      description: 'Premium & Exclusive',
      priceRange: 'K500,000+',
      color: 'bg-purple-100 text-purple-800',
      features: ['Luxury amenities', 'Exclusive locations', 'Premium finishes']
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
    { name: 'Houses', icon: Home, description: 'Family homes and residential properties' },
    { name: 'Apartments', icon: Building, description: 'Modern apartments and condos' },
    { name: 'Farms', icon: Home, description: 'Agricultural land and commercial farms' },
    { name: 'Plots', icon: MapPin, description: 'Residential and commercial plots' },
    { name: 'Boarding Houses', icon: Users, description: 'Student and worker accommodation' },
    { name: 'Warehouses', icon: Building, description: 'Industrial storage facilities' },
    { name: 'Office Spaces', icon: ShoppingCart, description: 'Commercial business properties' }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Services & Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of real estate with our comprehensive platform featuring 
            all the conveniences of modern property booking and management.
          </p>
        </div>

        {/* Platform Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Service Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Real Estate Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>

        {/* Property Tiers */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Property Categories</CardTitle>
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
                    <ul className="space-y-2 text-sm text-gray-600">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center justify-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browse Properties CTA */}
        <Card className="mb-16 bg-gradient-to-r from-primary to-secondary text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Explore Properties?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Browse our extensive collection of verified properties across Zambia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/properties">
                <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
                  <Search className="h-4 w-4 mr-2" />
                  Browse All Properties
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  <Phone className="h-4 w-4 mr-2" />
                  Talk to an Agent
                </Button>
              </Link>
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
      </div>
    </div>
  );
};

export default Services;
