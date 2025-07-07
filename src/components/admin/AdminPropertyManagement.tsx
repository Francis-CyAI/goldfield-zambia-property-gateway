
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Home, Search, MapPin, Users, DollarSign, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  description: string | null;
  location: string;
  property_type: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  host_id: string;
  host?: {
    email: string;
    first_name: string;
    last_name: string;
  };
  booking_count?: number;
  total_revenue?: number;
}

const AdminPropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    inactiveProperties: 0,
    totalHosts: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          host:profiles!properties_host_id_fkey(
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get booking statistics for each property
      const propertiesWithStats = await Promise.all(
        (data || []).map(async (property) => {
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', property.id);

          const { data: revenueData } = await supabase
            .from('bookings')
            .select('total_price')
            .eq('property_id', property.id)
            .eq('status', 'completed');

          const totalRevenue = (revenueData || []).reduce((sum, booking) => sum + booking.total_price, 0);

          return {
            ...property,
            host: Array.isArray(property.host) ? property.host[0] : property.host,
            booking_count: count || 0,
            total_revenue: totalRevenue
          };
        })
      );

      setProperties(propertiesWithStats);
      calculateStats(propertiesWithStats);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (properties: Property[]) => {
    const uniqueHosts = new Set(properties.map(p => p.host_id));
    const stats = {
      totalProperties: properties.length,
      activeProperties: properties.filter(p => p.is_active).length,
      inactiveProperties: properties.filter(p => !p.is_active).length,
      totalHosts: uniqueHosts.size
    };
    setStats(stats);
  };

  const togglePropertyStatus = async (property: Property) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !property.is_active })
        .eq('id', property.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Property ${property.is_active ? 'deactivated' : 'activated'} successfully`,
      });

      fetchProperties();
    } catch (error) {
      console.error('Error toggling property status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update property status',
        variant: 'destructive',
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });

      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        variant: 'destructive',
      });
    }
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsViewDialogOpen(true);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.host?.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && property.is_active) ||
      (statusFilter === 'inactive' && !property.is_active);
    
    const matchesType = typeFilter === 'all' || property.property_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getPropertyTypes = () => {
    const types = [...new Set(properties.map(p => p.property_type))];
    return types;
  };

  return (
    <div className="space-y-3 p-1 sm:p-3 lg:p-6 max-w-full overflow-hidden">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Property Management</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Monitor and manage all properties on the platform
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total Properties</CardTitle>
            <Home className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-lg sm:text-xl font-bold">{stats.totalProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Active Properties</CardTitle>
            <Home className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-lg sm:text-xl font-bold">{stats.activeProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Inactive Properties</CardTitle>
            <Home className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-lg sm:text-xl font-bold">{stats.inactiveProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total Hosts</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-lg sm:text-xl font-bold">{stats.totalHosts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <Search className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Search</label>
              <Input
                placeholder="Search properties, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Property Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getPropertyTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base lg:text-lg">Properties ({filteredProperties.length})</CardTitle>
          <CardDescription className="text-xs">
            All properties registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-xs text-muted-foreground">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-xs">No properties found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Property</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Host</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Type</TableHead>
                      <TableHead className="text-xs">Price</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Capacity</TableHead>
                      <TableHead className="text-xs hidden xl:table-cell">Bookings</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="py-1">
                          <div>
                            <div className="font-medium text-xs truncate max-w-[120px]">{property.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-2 w-2" />
                              <span className="truncate max-w-[100px]">{property.location}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-1 hidden sm:table-cell">
                          {property.host ? (
                            <div>
                              <div className="font-medium text-xs">
                                {property.host.first_name} {property.host.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                                {property.host.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unknown Host</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 hidden md:table-cell">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {property.property_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1">
                          <div className="font-medium text-xs">
                            ${property.price_per_night}/night
                          </div>
                        </TableCell>
                        <TableCell className="py-1 hidden lg:table-cell">
                          <div className="text-xs">
                            <div>{property.max_guests} guests</div>
                            <div className="text-muted-foreground">
                              {property.bedrooms}bd • {property.bathrooms}ba
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-1 hidden xl:table-cell">
                          <div>
                            <div className="font-medium text-xs">{property.booking_count || 0}</div>
                            <div className="text-xs text-muted-foreground">
                              ${(property.total_revenue || 0).toFixed(0)} revenue
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-1">
                          <Badge variant={property.is_active ? 'default' : 'secondary'} className="text-xs px-1 py-0">
                            {property.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProperty(property)}
                              className="h-6 px-2 text-xs"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePropertyStatus(property)}
                              className={`h-6 px-2 text-xs ${property.is_active ? 'text-red-600' : 'text-green-600'}`}
                            >
                              {property.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">Property Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Detailed information about {selectedProperty?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="grid gap-3 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-medium mb-2 text-xs">Basic Information</h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>Title:</strong> {selectedProperty.title}</div>
                    <div><strong>Type:</strong> {selectedProperty.property_type}</div>
                    <div><strong>Location:</strong> {selectedProperty.location}</div>
                    <div><strong>Price:</strong> ${selectedProperty.price_per_night}/night</div>
                    <div><strong>Status:</strong> {selectedProperty.is_active ? 'Active' : 'Inactive'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-xs">Capacity & Features</h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>Max Guests:</strong> {selectedProperty.max_guests}</div>
                    <div><strong>Bedrooms:</strong> {selectedProperty.bedrooms}</div>
                    <div><strong>Bathrooms:</strong> {selectedProperty.bathrooms}</div>
                    <div><strong>Bookings:</strong> {selectedProperty.booking_count}</div>
                    <div><strong>Revenue:</strong> ${(selectedProperty.total_revenue || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
              {selectedProperty.description && (
                <div>
                  <h4 className="font-medium mb-2 text-xs">Description</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedProperty.description}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-medium mb-2 text-xs">Host Information</h4>
                {selectedProperty.host ? (
                  <div className="text-xs">
                    <div><strong>Name:</strong> {selectedProperty.host.first_name} {selectedProperty.host.last_name}</div>
                    <div><strong>Email:</strong> {selectedProperty.host.email}</div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Host information not available</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <strong>Created:</strong> {new Date(selectedProperty.created_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(selectedProperty.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)} className="h-7 text-xs px-3">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPropertyManagement;
