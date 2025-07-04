
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
    // Accommodation Types
    { id: 'hotel', label: 'Hotels', icon: Hotel, category: 'accommodation' },
    { id: 'lodge', label: 'Lodges', icon: TreePine, category: 'accommodation' },
    { id: 'resort', label: 'Resorts', icon: Mountain, category: 'accommodation' },
    { id: 'guesthouse', label: 'Guest Houses', icon: Home, category: 'accommodation' },
    { id: 'bnb', label: 'Bed & Breakfast', icon: Coffee, category: 'accommodation' },
    { id: 'hostel', label: 'Hostels', icon: Bed, category: 'accommodation' },
    { id: 'villa', label: 'Villas', icon: Waves, category: 'accommodation' },
    { id: 'chalet', label: 'Chalets', icon: Mountain, category: 'accommodation' },
    { id: 'cottage', label: 'Cottages', icon: Home, category: 'accommodation' },
    { id: 'cabin', label: 'Cabins', icon: TreePine, category: 'accommodation' },
    { id: 'safari', label: 'Safari Camps', icon: Tent, category: 'accommodation' },
    { id: 'castle', label: 'Castles', icon: Castle, category: 'accommodation' },
    { id: 'island', label: 'Private Islands', icon: Palmtree, category: 'accommodation' },
    { id: 'airport', label: 'Airport Hotels', icon: Plane, category: 'accommodation' },
    
    // Residential Types
    { id: 'house', label: 'Houses', icon: Home, category: 'residential' },
    { id: 'apartment', label: 'Apartments', icon: Building, category: 'residential' },
    { id: 'condo', label: 'Condos', icon: Building2, category: 'residential' },
    { id: 'student_room', label: 'Student Rooms', icon: GraduationCap, category: 'residential' },
    
    // Commercial Types
    { id: 'office', label: 'Offices', icon: Briefcase, category: 'commercial' },
    { id: 'warehouse', label: 'Warehouses', icon: Factory, category: 'commercial' },
    { id: 'retail', label: 'Retail Space', icon: Store, category: 'commercial' },
    { id: 'restaurant', label: 'Restaurants', icon: Coffee, category: 'commercial' },
    { id: 'shopping_center', label: 'Shopping Centers', icon: Building2, category: 'commercial' },
    { id: 'industrial', label: 'Industrial Space', icon: Factory, category: 'commercial' },
    
    // Agricultural & Other Types
    { id: 'farm', label: 'Farms', icon: Tractor, category: 'agricultural' },
    { id: 'farmland', label: 'Farmland', icon: TreePine, category: 'agricultural' },
    { id: 'ranch', label: 'Ranches', icon: Tractor, category: 'agricultural' },
    { id: 'parking', label: 'Parking Spaces', icon: Car, category: 'other' },
    { id: 'event', label: 'Event Venues', icon: Building2, category: 'other' },
    { id: 'storage', label: 'Storage Units', icon: Building, category: 'other' }
  ];

  const categories = [
    { id: 'accommodation', label: 'Accommodation & Tourism', color: 'bg-blue-50 border-blue-200' },
    { id: 'residential', label: 'Residential Properties', color: 'bg-green-50 border-green-200' },
    { id: 'commercial', label: 'Commercial Properties', color: 'bg-purple-50 border-purple-200' },
    { id: 'agricultural', label: 'Agricultural Properties', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'other', label: 'Other Properties', color: 'bg-gray-50 border-gray-200' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Property Types</h3>
      
      {categories.map((category) => {
        const categoryTypes = propertyTypes.filter(type => type.category === category.id);
        
        return (
          <div key={category.id} className={`p-4 rounded-lg border ${category.color}`}>
            <h4 className="font-medium text-base mb-3">{category.label}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoryTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedTypes.includes(type.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTypeToggle(type.id)}
                  className="flex items-center space-x-2 justify-start h-10"
                >
                  <type.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{type.label}</span>
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
