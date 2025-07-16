import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Users, Home, Building, Star, Shield, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HeroSection = () => {
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '1'
  });
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23f1f5f9%22%20fill-opacity=%220.3%22%3E%3Ccircle%20cx=%227%22%20cy=%227%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 animate-fade-in">
          <Badge className="bg-green-50 text-green-700 border-green-200 px-3 sm:px-4 py-2 text-sm font-medium">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Verified Properties</span>
            <span className="sm:hidden">Verified</span>
          </Badge>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 sm:px-4 py-2 text-sm font-medium">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Instant Booking</span>
            <span className="sm:hidden">Instant</span>
          </Badge>
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 sm:px-4 py-2 text-sm font-medium">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">5-Star Hosts</span>
            <span className="sm:hidden">5-Star</span>
          </Badge>
        </div>

        {/* Main Hero Content */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            <span className="block">Zambia's #1</span>
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Property Marketplace
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            <strong>For Travelers:</strong> Discover unique stays from Victoria Falls to Lusaka<br className="hidden sm:block" />
            <strong>For Hosts:</strong> Turn your property into a thriving business
          </p>

          {/* Two-Sided Marketplace CTA - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 px-4">
            <Link to="/properties" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 sm:px-8 py-4 text-base sm:text-lg font-bold min-h-[56px] border-2 border-primary"
              >
                <Search className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Find Places to Stay</span>
                <span className="sm:hidden">Find Stays</span>
              </Button>
            </Link>
            
            <Link to={user ? "/list-property" : "/auth"} className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto border-3 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 sm:px-8 py-4 text-base sm:text-lg font-bold min-h-[56px] bg-white"
              >
                <Home className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Become a Host</span>
                <span className="sm:hidden">List Property</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Card - Responsive */}
        <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-scale-in">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  Location
                </label>
                <Input
                  placeholder="Where are you going?"
                  value={searchData.location}
                  onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                  className="border-2 border-border focus:border-primary transition-colors h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                  Check-in
                </label>
                <Input
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkIn: e.target.value }))}
                  className="border-2 border-border focus:border-primary transition-colors h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                  Check-out
                </label>
                <Input
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkOut: e.target.value }))}
                  className="border-2 border-border focus:border-primary transition-colors h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Users className="h-4 w-4 mr-1 text-primary" />
                  Guests
                </label>
                <Select value={searchData.guests} onValueChange={(value) => setSearchData(prev => ({ ...prev, guests: value }))}>
                  <SelectTrigger className="border-2 border-border focus:border-primary transition-colors h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Link to="/properties">
              <Button 
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-14 text-base sm:text-lg font-bold border-2 border-secondary"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Properties
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Two-Sided Value Proposition - Mobile Optimized */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mt-12 sm:mt-16 animate-fade-in px-4 sm:px-0">
          {/* For Guests */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">For Travelers & Guests</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base">
                Book unique accommodations instantly. From luxury safari lodges to city apartments - 
                all with verified hosts across Zambia.
              </p>
              <Link to="/properties">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold h-12 border-2 border-primary">
                  <Search className="h-4 w-4 mr-2" />
                  Start Exploring
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* For Hosts */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">For Property Owners & Hosts</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base">
                Turn your property into income. Join our marketplace platform, 
                set your rates, and start earning with instant bookings.
              </p>
              <Link to={user ? "/list-property" : "/auth"}>
                <Button 
                  variant="outline" 
                  className="w-full border-3 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold h-12 bg-white"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Start Earning
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Stats */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 rounded-lg p-4 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Properties Listed</div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">98%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Host Approval</div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">4.8★</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;