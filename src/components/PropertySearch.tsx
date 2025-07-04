
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  Filter,
  X,
  Star,
  Bed,
  DollarSign,
  Wifi,
  Heart
} from 'lucide-react';
import { format } from 'date-fns';

interface SearchFilters {
  location: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  propertyType: string;
  tier: string;
  priceRange: [number, number];
  bedrooms: string;
  amenities: string[];
  hostRating: string;
  petFriendly: boolean;
  wifiRequired: boolean;
}

interface PropertySearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const PropertySearch = ({ filters, onFiltersChange, onSearch }: PropertySearchProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const propertyTypes = [
    'House', 'Apartment', 'Farm', 'Office', 'Warehouse', 'Boarding House', 'Plot'
  ];

  const amenities = [
    'WiFi', 'Kitchen', 'Washing Machine', 'Air Conditioning', 'Pool', 
    'Parking', 'Garden', 'Security', 'Generator', 'Solar Power'
  ];

  const locations = [
    'Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe',
    'Mumbwa', 'Kafue', 'Chongwe', 'Chibombo', 'Mazabuka',
    'Solwezi', 'Kasama', 'Chipata', 'Mongu', 'Choma'
  ];

  const bedroomOptions = ['Any', '1+', '2+', '3+', '4+', '5+'];
  const ratingOptions = ['Any', '4.0+', '4.5+', '4.8+'];

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    updateFilters('amenities', newAmenities);
  };

  const clearFilters = () => {
    onFiltersChange({
      location: '',
      checkIn: undefined,
      checkOut: undefined,
      guests: 1,
      propertyType: '',
      tier: '',
      priceRange: [0, 1000000],
      bedrooms: 'Any',
      amenities: [],
      hostRating: 'Any',
      petFriendly: false,
      wifiRequired: false
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Where</label>
            <Select value={filters.location} onValueChange={(value) => updateFilters('location', value)}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Choose location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Check in</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {filters.checkIn ? format(filters.checkIn, 'MMM dd') : 'Add dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.checkIn}
                  onSelect={(date) => updateFilters('checkIn', date)}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Check out</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {filters.checkOut ? format(filters.checkOut, 'MMM dd') : 'Add dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.checkOut}
                  onSelect={(date) => updateFilters('checkOut', date)}
                  disabled={(date) => date < new Date() || (filters.checkIn && date <= filters.checkIn)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Guests</label>
            <Select value={filters.guests.toString()} onValueChange={(value) => updateFilters('guests', parseInt(value))}>
              <SelectTrigger>
                <Users className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} guest{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-primary"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} advanced filters
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear all
            </Button>
            <Button onClick={onSearch} className="bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
            {/* First Row - Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Property Type</label>
                <Select value={filters.propertyType} onValueChange={(value) => updateFilters('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bedrooms</label>
                <Select value={filters.bedrooms} onValueChange={(value) => updateFilters('bedrooms', value)}>
                  <SelectTrigger>
                    <Bed className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === 'Any' ? 'Any bedrooms' : `${option} bedrooms`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Host Rating</label>
                <Select value={filters.hostRating} onValueChange={(value) => updateFilters('hostRating', value)}>
                  <SelectTrigger>
                    <Star className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === 'Any' ? 'Any rating' : `${option} stars`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tier</label>
                <Select value={filters.tier} onValueChange={(value) => updateFilters('tier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Budget</SelectItem>
                    <SelectItem value="middle">Standard</SelectItem>
                    <SelectItem value="high">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Price Range (per night)
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min (K)"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilters('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max (K)"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilters('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 1000000])}
                  className="w-24"
                />
                <span className="text-sm text-gray-500 ml-2">
                  K{filters.priceRange[0]} - K{filters.priceRange[1]}
                </span>
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium mb-3">Quick Filters</label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wifi"
                    checked={filters.wifiRequired}
                    onCheckedChange={(checked) => updateFilters('wifiRequired', checked)}
                  />
                  <Label htmlFor="wifi" className="flex items-center cursor-pointer">
                    <Wifi className="h-4 w-4 mr-1" />
                    WiFi Required
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pets"
                    checked={filters.petFriendly}
                    onCheckedChange={(checked) => updateFilters('petFriendly', checked)}
                  />
                  <Label htmlFor="pets" className="flex items-center cursor-pointer">
                    <Heart className="h-4 w-4 mr-1" />
                    Pet Friendly
                  </Label>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                    {filters.amenities.includes(amenity) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {(filters.wifiRequired || filters.petFriendly || filters.bedrooms !== 'Any' || filters.hostRating !== 'Any') && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2">Active Filters</label>
                <div className="flex flex-wrap gap-2">
                  {filters.wifiRequired && (
                    <Badge variant="secondary">
                      <Wifi className="h-3 w-3 mr-1" />
                      WiFi Required
                    </Badge>
                  )}
                  {filters.petFriendly && (
                    <Badge variant="secondary">
                      <Heart className="h-3 w-3 mr-1" />
                      Pet Friendly
                    </Badge>
                  )}
                  {filters.bedrooms !== 'Any' && (
                    <Badge variant="secondary">
                      <Bed className="h-3 w-3 mr-1" />
                      {filters.bedrooms} bedrooms
                    </Badge>
                  )}
                  {filters.hostRating !== 'Any' && (
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      {filters.hostRating} rating
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertySearch;
