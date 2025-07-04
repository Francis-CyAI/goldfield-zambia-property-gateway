
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Building, 
  TreePine, 
  Briefcase, 
  Tractor, 
  Hotel,
  Mountain,
  Waves,
  Car,
  Tent,
  Castle,
  Palmtree,
  Building2,
  Bed,
  Coffee,
  Plane,
  GraduationCap,
  Store,
  Factory
} from 'lucide-react';

interface PropertyTypeFilterProps {
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
}

const PropertyTypeFilter = ({ selectedTypes, onTypeToggle }: PropertyTypeFilterProps) => {
  const propertyTypes = [
    // Accommodation Types (Rental)
    { id: 'hotel', label: 'Hotels', icon: Hotel, category: 'accommodation', listingType: 'rental' },
    { id: 'lodge', label: 'Lodges', icon: TreePine, category: 'accommodation', listingType: 'rental' },
    { id: 'resort', label: 'Resorts', icon: Mountain, category: 'accommodation', listingType: 'rental' },
    { id: 'guesthouse', label: 'Guest Houses', icon: Home, category: 'accommodation', listingType: 'rental' },
    { id: 'bnb', label: 'Bed & Breakfast', icon: Coffee, category: 'accommodation', listingType: 'rental' },
    { id: 'hostel', label: 'Hostels', icon: Bed, category: 'accommodation', listingType: 'rental' },
    { id: 'villa', label: 'Villas', icon: Waves, category: 'accommodation', listingType: 'rental' },
    { id: 'chalet', label: 'Chalets', icon: Mountain, category: 'accommodation', listingType: 'rental' },
    { id: 'cottage', label: 'Cottages', icon: Home, category: 'accommodation', listingType: 'rental' },
    { id: 'cabin', label: 'Cabins', icon: TreePine, category: 'accommodation', listingType: 'rental' },
    { id: 'safari', label: 'Safari Camps', icon: Tent, category: 'accommodation', listingType: 'rental' },
    { id: 'castle', label: 'Castles', icon: Castle, category: 'accommodation', listingType: 'rental' },
    { id: 'island', label: 'Private Islands', icon: Palmtree, category: 'accommodation', listingType: 'rental' },
    { id: 'airport', label: 'Airport Hotels', icon: Plane, category: 'accommodation', listingType: 'rental' },
    
    // Residential Types (Both Rental & Sale)
    { id: 'house', label: 'Houses', icon: Home, category: 'residential', listingType: 'both' },
    { id: 'apartment', label: 'Apartments', icon: Building, category: 'residential', listingType: 'both' },
    { id: 'condo', label: 'Condos', icon: Building2, category: 'residential', listingType: 'both' },
    { id: 'student_room', label: 'Student Rooms', icon: GraduationCap, category: 'residential', listingType: 'rental' },
    
    // Commercial Types (Both Rental & Sale)
    { id: 'office', label: 'Offices', icon: Briefcase, category: 'commercial', listingType: 'both' },
    { id: 'warehouse', label: 'Warehouses', icon: Factory, category: 'commercial', listingType: 'both' },
    { id: 'retail', label: 'Retail Space', icon: Store, category: 'commercial', listingType: 'both' },
    { id: 'restaurant', label: 'Restaurants', icon: Coffee, category: 'commercial', listingType: 'both' },
    { id: 'shopping_center', label: 'Shopping Centers', icon: Building2, category: 'commercial', listingType: 'both' },
    { id: 'industrial', label: 'Industrial Space', icon: Factory, category: 'commercial', listingType: 'both' },
    
    // Agricultural & Other Types (Sale Only)
    { id: 'farm', label: 'Farms', icon: Tractor, category: 'agricultural', listingType: 'sale' },
    { id: 'farmland', label: 'Farmland', icon: TreePine, category: 'agricultural', listingType: 'sale' },
    { id: 'ranch', label: 'Ranches', icon: Tractor, category: 'agricultural', listingType: 'sale' },
    { id: 'parking', label: 'Parking Spaces', icon: Car, category: 'other', listingType: 'both' },
    { id: 'event', label: 'Event Venues', icon: Building2, category: 'other', listingType: 'both' },
    { id: 'storage', label: 'Storage Units', icon: Building, category: 'other', listingType: 'both' }
  ];

  const categories = [
    { id: 'accommodation', label: 'Accommodation & Tourism', color: 'bg-blue-50 border-blue-200' },
    { id: 'residential', label: 'Residential Properties', color: 'bg-green-50 border-green-200' },
    { id: 'commercial', label: 'Commercial Properties', color: 'bg-purple-50 border-purple-200' },
    { id: 'agricultural', label: 'Agricultural Properties', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'other', label: 'Other Properties', color: 'bg-gray-50 border-gray-200' }
  ];

  const getListingTypeBadge = (listingType: string) => {
    switch (listingType) {
      case 'rental':
        return <Badge variant="outline" className="text-xs ml-1 bg-blue-50 text-blue-700">Rental</Badge>;
      case 'sale':
        return <Badge variant="outline" className="text-xs ml-1 bg-green-50 text-green-700">Sale</Badge>;
      case 'both':
        return <Badge variant="outline" className="text-xs ml-1 bg-purple-50 text-purple-700">Both</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Property Types</h3>
      
      {categories.map((category) => {
        const categoryTypes = propertyTypes.filter(type => type.category === category.id);
        
        return (
          <div key={category.id} className={`p-4 rounded-lg border ${category.color}`}>
            <h4 className="font-medium text-base mb-3">{category.label}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedTypes.includes(type.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTypeToggle(type.id)}
                  className="flex items-center justify-between h-auto p-3"
                >
                  <div className="flex items-center space-x-2">
                    <type.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{type.label}</span>
                  </div>
                  {getListingTypeBadge(type.listingType)}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
      
      {selectedTypes.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Selected Types:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map((typeId) => {
              const type = propertyTypes.find(t => t.id === typeId);
              return type ? (
                <Badge key={typeId} variant="secondary" className="text-xs">
                  {type.label}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyTypeFilter;
