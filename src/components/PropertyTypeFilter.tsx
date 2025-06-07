
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
  Car
} from 'lucide-react';

interface PropertyTypeFilterProps {
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
}

const PropertyTypeFilter = ({ selectedTypes, onTypeToggle }: PropertyTypeFilterProps) => {
  const propertyTypes = [
    { id: 'house', label: 'Houses', icon: Home },
    { id: 'apartment', label: 'Apartments', icon: Building },
    { id: 'lodge', label: 'Lodges', icon: TreePine },
    { id: 'hotel', label: 'Hotels', icon: Hotel },
    { id: 'resort', label: 'Resorts', icon: Mountain },
    { id: 'guesthouse', label: 'Guest Houses', icon: Home },
    { id: 'villa', label: 'Villas', icon: Waves },
    { id: 'office', label: 'Offices', icon: Briefcase },
    { id: 'farm', label: 'Farms', icon: Tractor },
    { id: 'warehouse', label: 'Warehouses', icon: Building },
    { id: 'parking', label: 'Parking', icon: Car }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Property Types</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {propertyTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedTypes.includes(type.id) ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeToggle(type.id)}
            className="flex items-center space-x-2 justify-start"
          >
            <type.icon className="h-4 w-4" />
            <span className="text-sm">{type.label}</span>
          </Button>
        ))}
      </div>
      {selectedTypes.length > 0 && (
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
      )}
    </div>
  );
};

export default PropertyTypeFilter;
