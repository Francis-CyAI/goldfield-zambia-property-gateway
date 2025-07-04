
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, MapPin, Calendar as CalendarIcon, Users, Shield, Zap, Star, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const HeroSection = () => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const navigate = useNavigate();

  const zambianCities = [
    { value: 'lusaka', label: 'Lusaka - Capital City' },
    { value: 'livingstone', label: 'Livingstone - Victoria Falls' },
    { value: 'ndola', label: 'Ndola - Copperbelt' },
    { value: 'kitwe', label: 'Kitwe - Mining Hub' },
    { value: 'kabwe', label: 'Kabwe - Central Province' },
    { value: 'solwezi', label: 'Solwezi - North Western' },
    { value: 'kasama', label: 'Kasama - Northern Province' },
    { value: 'chipata', label: 'Chipata - Eastern Province' },
    { value: 'mongu', label: 'Mongu - Western Province' },
    { value: 'choma', label: 'Choma - Southern Province' }
  ];

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (location) searchParams.set('location', location);
    if (checkIn) searchParams.set('checkin', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) searchParams.set('checkout', format(checkOut, 'yyyy-MM-dd'));
    searchParams.set('guests', guests.toString());
    
    navigate(`/properties?${searchParams.toString()}`);
  };

  const isSearchEnabled = location && checkIn && checkOut;

  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-yellow-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-600">Proudly Zambian</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Amazing
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Zambian Stays
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            From luxury lodges near Victoria Falls to cozy homes in Lusaka. 
            Experience authentic Zambian hospitality with verified hosts and instant booking.
          </p>

          {/* Key Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-6 py-3 text-base bg-white/80 backdrop-blur-sm border border-orange-200 hover:bg-orange-50 transition-colors">
              <Zap className="h-5 w-5 mr-2 text-orange-600" />
              Book Instantly
            </Badge>
            <Badge variant="secondary" className="px-6 py-3 text-base bg-white/80 backdrop-blur-sm border border-green-200 hover:bg-green-50 transition-colors">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Verified Hosts
            </Badge>
            <Badge variant="secondary" className="px-6 py-3 text-base bg-white/80 backdrop-blur-sm border border-blue-200 hover:bg-blue-50 transition-colors">
              <Star className="h-5 w-5 mr-2 text-blue-600" />
              Local Experiences
            </Badge>
            <Badge variant="secondary" className="px-6 py-3 text-base bg-white/80 backdrop-blur-sm border border-purple-200 hover:bg-purple-50 transition-colors">
              <Heart className="h-5 w-5 mr-2 text-purple-600" />
              Trusted Community
            </Badge>
          </div>
        </div>

        {/* Search Card */}
        <Card className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8">
            <CardTitle className="text-2xl font-bold text-center">Find Your Perfect Zambian Getaway</CardTitle>
            <CardDescription className="text-center text-orange-100 text-lg">
              Discover unique stays from Livingstone to Lusaka
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                  Where to?
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-14 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors">
                    <SelectValue placeholder="Choose destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {zambianCities.map((city) => (
                      <SelectItem key={city.value} value={city.value} className="py-3">
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Check-in */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-orange-500" />
                  Check in
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-14 w-full justify-start border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors">
                      {checkIn ? format(checkIn, 'MMM dd, yyyy') : 'Add dates'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-orange-500" />
                  Check out
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-14 w-full justify-start border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors">
                      {checkOut ? format(checkOut, 'MMM dd, yyyy') : 'Add dates'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => date < new Date() || (checkIn && date <= checkIn)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-orange-500" />
                  Guests
                </label>
                <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                  <SelectTrigger className="h-14 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} guest{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleSearch}
                disabled={!isSearchEnabled}
                className={`flex-1 h-16 text-lg font-semibold rounded-xl transition-all duration-300 ${
                  isSearchEnabled 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Search className="h-6 w-6 mr-3" />
                Search Amazing Stays
              </Button>
              
              <Link to="/contact">
                <Button variant="outline" className="h-16 px-8 text-lg font-semibold border-2 border-gray-300 hover:border-orange-500 hover:text-orange-600 rounded-xl transition-colors">
                  Need Help?
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">500+</div>
                <div className="text-sm text-gray-600">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-600">Verified Hosts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4.8★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HeroSection;
