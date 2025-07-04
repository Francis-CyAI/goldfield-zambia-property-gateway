
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Eye, 
  Calendar, 
  DollarSign,
  Users,
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Property {
  id: string;
  title: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  is_active: boolean;
  property_type: string;
}

interface PropertyListingsProps {
  properties: Property[];
}

const PropertyListings = ({ properties }: PropertyListingsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Properties</h2>
        <Button onClick={() => window.location.href = '/list-property'}>
          Add New Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={property.images[0] || '/placeholder.svg'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={property.is_active ? "default" : "secondary"}>
                  {property.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Property
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Calendar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {property.location}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {property.max_guests} guests
                  </span>
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                </div>
                <span className="capitalize text-muted-foreground">
                  {property.property_type}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-semibold">K{property.price_per_night}</span>
                  <span className="text-sm text-muted-foreground ml-1">/ night</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Calendar
                  </Button>
                  <Button size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Home className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No properties yet</h3>
              <p className="text-muted-foreground">
                Start by adding your first property to begin earning
              </p>
            </div>
            <Button onClick={() => window.location.href = '/list-property'}>
              Add Your First Property
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PropertyListings;
