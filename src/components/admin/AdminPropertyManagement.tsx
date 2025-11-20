import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Home, Users, DollarSign, RefreshCw, Check, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { listDocuments, setDocument, logAdminActivity } from '@/lib/utils/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/constants/firebase';
import type { Property } from '@/lib/models';

const AdminPropertyManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');
  const approveListingFn = useMemo(() => httpsCallable(functions, 'approveListing'), []);
  const declineListingFn = useMemo(() => httpsCallable(functions, 'declineListing'), []);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await listDocuments('properties', [orderBy('created_at', 'desc')]);
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ propertyId, isActive }: { propertyId: string; isActive: boolean }) => {
      await setDocument('properties', propertyId, {
        is_active: isActive,
        updated_at: serverTimestamp(),
      });

      await logAdminActivity({
        actorId: user?.uid ?? 'system',
        actorEmail: user?.email ?? undefined,
        action: isActive ? 'Activated property' : 'Deactivated property',
        entityType: 'property',
        entityId: propertyId,
        metadata: { is_active: isActive },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({
        title: 'Property visibility updated',
        description: 'The property visibility has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating property:', error);
      toast({
        title: 'Error',
        description: 'Failed to update property status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ propertyId, notes }: { propertyId: string; notes?: string }) => {
      await approveListingFn({ propertyId, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({ title: 'Listing approved', description: 'The property is now active.' });
    },
    onError: (error) => {
      console.error('Error approving property:', error);
      toast({
        title: 'Approval failed',
        description: error instanceof Error ? error.message : 'Could not approve the property. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async ({ propertyId, reason }: { propertyId: string; reason?: string }) => {
      await declineListingFn({ propertyId, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({ title: 'Listing declined', description: 'The lister will be notified.' });
    },
    onError: (error) => {
      console.error('Error declining property:', error);
      toast({
        title: 'Decline failed',
        description: error instanceof Error ? error.message : 'Could not decline the property. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const filteredProperties = properties.filter((property) => {
    if (!searchTerm) return true;
    const normalisedSearch = searchTerm.toLowerCase();
    return (
      property.title?.toLowerCase().includes(normalisedSearch) ||
      property.location?.toLowerCase().includes(normalisedSearch) ||
      property.property_type?.toLowerCase().includes(normalisedSearch)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Property Management
        </CardTitle>
        <CardDescription>Review listed properties and manage their visibility.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Properties</p>
              <p className="text-xl font-semibold">{properties.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Listings</p>
              <p className="text-xl font-semibold">
                {properties.filter((property) => property.is_active).length}
              </p>
            </div>
          </div>

          <Input
            placeholder="Search by title, location, or type"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full md:w-64"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Loading properties...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredProperties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No properties match your filters.
                  </TableCell>
                </TableRow>
              )}
              {filteredProperties.map((property: Property) => {
                const approvalStatus = property.approval_status ?? 'pending';
                return (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="font-medium">{property.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {property.property_type || 'Unspecified'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3" />
                      {property.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {property.bedrooms ?? '—'} bd
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {property.price_per_night ?? '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {property.is_active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {approvalStatus === 'approved' && (
                      <Badge className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
                    )}
                    {approvalStatus === 'pending' && (
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pending
                      </Badge>
                    )}
                    {approvalStatus === 'declined' && (
                      <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                        Declined
                      </Badge>
                    )}
                    {property.approval_notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {property.approval_notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {approvalStatus !== 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate({ propertyId: property.id })}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    )}
                    {approvalStatus !== 'declined' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const reason = window.prompt('Provide a reason for declining (optional):') || undefined;
                          declineMutation.mutate({ propertyId: property.id, reason });
                        }}
                        disabled={declineMutation.isPending}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleMutation.mutate({ propertyId: property.id, isActive: !property.is_active })
                      }
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {property.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPropertyManagement;
