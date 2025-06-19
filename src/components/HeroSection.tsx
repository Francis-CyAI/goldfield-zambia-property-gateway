import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [purpose, setPurpose] = useState('');
  const [propertyTier, setPropertyTier] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const purposes = [
    { value: 'buy', label: 'Buy a Property' },
    { value: 'sell', label: 'Sell Your Property' },
    { value: 'rent', label: 'List for Rent' },
    { value: 'book', label: 'Book Short-term Stay' },
    { value: 'rent-long', label: 'Rent Long-term Property' },
    { value: 'rent-room', label: 'Rent a Room' }
  ];

  const tiers = [
    { value: 'low', label: 'Low Class - Basic & Affordable' },
    { value: 'middle', label: 'Middle Class - Standard Quality' },
    { value: 'high', label: 'High Class - Premium & Luxury' }
  ];

  const majorCities = [
    { value: 'lusaka', label: 'Lusaka' },
    { value: 'ndola', label: 'Ndola' },
    { value: 'kitwe', label: 'Kitwe' },
    { value: 'livingstone', label: 'Livingstone' },
    { value: 'kabwe', label: 'Kabwe' },
    { value: 'solwezi', label: 'Solwezi' }
  ];

  const farmingAreas = [
    { value: 'mumbwa', label: 'Mumbwa' },
    { value: 'kafue', label: 'Kafue' },
    { value: 'chongwe', label: 'Chongwe' },
    { value: 'chibombo', label: 'Chibombo' },
    { value: 'mazabuka', label: 'Mazabuka' },
    { value: 'mpongwe', label: 'Mpongwe' },
    { value: 'mkushi', label: 'Mkushi' },
    { value: 'kasama', label: 'Kasama' },
    { value: 'chipata', label: 'Chipata' },
    { value: 'mongu', label: 'Mongu' },
    { value: 'choma', label: 'Choma' }
  ];

  const propertyTypes = [
    { value: 'farms', label: 'Farms' },
    { value: 'plots', label: 'Plots' },
    { value: 'houses', label: 'Houses' },
    { value: 'boarding', label: 'Boarding House' },
    { value: 'furnished', label: 'Furnished Apartment' },
    { value: 'warehouses', label: 'Warehouses' },
    { value: 'offices', label: 'Office Space / Shops' },
    { value: 'rooms', label: 'Single Rooms' },
    { value: 'vacation-rentals', label: 'Vacation Rentals' }
  ];

  return (
    <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Invest in Zambia with Confidence
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Buy, Sell, Rent, or Book Properties Across Major Cities
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
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              Short & Long-term Rentals
            </Badge>
          </div>
        </div>

        {/* Property Search Filter */}
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-gray-900">Find Your Perfect Property</CardTitle>
            <CardDescription className="text-center">
              Buy, rent, or book properties in Lusaka, Ndola, Kitwe, Livingstone and beyond
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
                  {majorCities.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="farming" disabled className="font-semibold">
                    Farming & Development Areas
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
                  {purpose === 'book' ? 'Search Accommodations' : 
                   purpose === 'rent-long' || purpose === 'rent-room' ? 'Search Rentals' : 
                   'Search Properties'}
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
  );
};

export default HeroSection;
