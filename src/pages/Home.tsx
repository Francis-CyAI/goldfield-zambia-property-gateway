
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Home as HomeIcon, 
  Building, 
  MapPin, 
  DollarSign,
  Users,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [purpose, setPurpose] = useState('');
  const [propertyTier, setPropertyTier] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const purposes = [
    { value: 'buy', label: 'Buy a Property' },
    { value: 'sell', label: 'Sell Your Property' },
    { value: 'rent', label: 'List for Rent' }
  ];

  const tiers = [
    { value: 'low', label: 'Low Class - Basic & Affordable' },
    { value: 'middle', label: 'Middle Class - Standard Quality' },
    { value: 'high', label: 'High Class - Premium & Luxury' }
  ];

  const cities = [
    { value: 'lusaka', label: 'Lusaka' },
    { value: 'ndola', label: 'Ndola' },
    { value: 'kitwe', label: 'Kitwe' },
    { value: 'livingstone', label: 'Livingstone' },
    { value: 'kabwe', label: 'Kabwe' }
  ];

  const farmingAreas = [
    { value: 'mumbwa', label: 'Mumbwa' },
    { value: 'kafue', label: 'Kafue' },
    { value: 'chongwe', label: 'Chongwe' },
    { value: 'chibombo', label: 'Chibombo' },
    { value: 'mazabuka', label: 'Mazabuka' },
    { value: 'mpongwe', label: 'Mpongwe' },
    { value: 'mkushi', label: 'Mkushi' }
  ];

  const propertyTypes = [
    { value: 'farms', label: 'Farms' },
    { value: 'plots', label: 'Plots' },
    { value: 'houses', label: 'Houses' },
    { value: 'boarding', label: 'Boarding House' },
    { value: 'furnished', label: 'Furnished Apartment' },
    { value: 'warehouses', label: 'Warehouses' },
    { value: 'offices', label: 'Office Space / Shops' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Legal Compliance',
      description: 'PACRA & ZRA registered with full legal documentation support'
    },
    {
      icon: Users,
      title: 'Diaspora Friendly',
      description: 'Special services for Zambians abroad with virtual tours and remote transactions'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Quick property transfers and efficient documentation handling'
    },
    {
      icon: Star,
      title: 'Trusted Partner',
      description: 'Years of experience serving local and international clients'
    }
  ];

  const featuredProperties = [
    {
      id: 1,
      title: '4-Bedroom House in Kabulonga',
      price: 'K450,000',
      location: 'Lusaka',
      type: 'House',
      tier: 'Middle Class',
      image: '/placeholder.svg'
    },
    {
      id: 2,
      title: '50 Hectare Farm in Mumbwa',
      price: 'K280,000',
      location: 'Mumbwa',
      type: 'Farm',
      tier: 'Low Class',
      image: '/placeholder.svg'
    },
    {
      id: 3,
      title: 'Luxury Office Space in CBD',
      price: 'K800,000',
      location: 'Lusaka',
      type: 'Office',
      tier: 'High Class',
      image: '/placeholder.svg'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Invest in Zambia with Confidence
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Land, Homes, and Commercial Property Available
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                For Local Buyers
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                Diaspora Investors
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                Foreign Investors
              </Badge>
            </div>
          </div>

          {/* Property Search Filter */}
          <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-gray-900">Find Your Perfect Property</CardTitle>
              <CardDescription className="text-center">
                Use our advanced filters to discover properties that match your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="What would you like to do?" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={propertyTier} onValueChange={setPropertyTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cities" disabled className="font-semibold">
                      Major Cities
                    </SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="farming" disabled className="font-semibold">
                      Farming & Plot Areas
                    </SelectItem>
                    {farmingAreas.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/properties" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <Search className="h-4 w-4 mr-2" />
                    Search Properties
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white">
                    Talk to an Agent
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ABS Real Estate?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional service and expertise in the Zambian property market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
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
      </section>

      {/* Featured Properties */}
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
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <HomeIcon className="h-12 w-12 text-gray-400" />
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

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-secondary to-primary text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Property Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you're buying, selling, or renting, we're here to help every step of the way
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
                Get Started Today
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Client Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
