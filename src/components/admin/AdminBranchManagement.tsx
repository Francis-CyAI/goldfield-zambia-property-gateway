
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MapPin, Plus, Edit, Globe2, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/contexts/LocalizationContext';

interface Branch {
  id: string;
  name: string;
  location: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  manager: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const AdminBranchManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { countries, getCountriesByRegion } = useLocalization();

  const regions = ['Southern Africa', 'East Africa', 'West Africa', 'North Africa', 'Central Africa'];

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      console.log('Fetching branches for admin');
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          profiles!branches_manager_id_fkey (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching branches:', error);
        throw error;
      }

      return data.map(branch => ({
        ...branch,
        manager: branch.profiles
      }));
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: async (branchData: typeof formData) => {
      const { error } = await supabase
        .from('branches')
        .insert([branchData]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Branch created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: "Failed to create branch",
        variant: "destructive",
      });
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, ...branchData }: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from('branches')
        .update(branchData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      setIsDialogOpen(false);
      setEditingBranch(null);
      resetForm();
      toast({
        title: "Success",
        description: "Branch updated successfully",
      });
    },
  });

  const toggleBranchStatusMutation = useMutation({
    mutationFn: async ({ branchId, isActive }: { branchId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('branches')
        .update({ is_active: !isActive })
        .eq('id', branchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      toast({
        title: "Success",
        description: "Branch status updated successfully",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      address: '',
      phone: '',
      email: ''
    });
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      location: branch.location,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateBranchMutation.mutate({ ...formData, id: editingBranch.id });
    } else {
      createBranchMutation.mutate(formData);
    }
  };

  const getCountryByName = (location: string) => {
    return countries.find(country => 
      location.toLowerCase().includes(country.name.toLowerCase()) ||
      location.toLowerCase().includes(country.code.toLowerCase())
    );
  };

  const filteredBranches = selectedRegion === 'all' 
    ? branches 
    : branches.filter(branch => {
        const country = getCountryByName(branch.location);
        return country && getCountriesByRegion(selectedRegion).some(c => c.code === country.code);
      });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Globe2 className="h-5 w-5" />
                <span>African Branch Network</span>
              </CardTitle>
              <CardDescription>
                Manage branch locations across Africa - from neighboring countries to major African markets
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingBranch(null); resetForm(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Branch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingBranch ? 'Edit Branch' : 'Add New African Branch'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingBranch ? 'Update branch information' : 'Expand our network across Africa by adding a new branch location'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Branch Name *</Label>
                          <Input
                            id="name"
                            placeholder="e.g., Lusaka Central, Cape Town City"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Country/City *</Label>
                          <Select 
                            value={formData.location} 
                            onValueChange={(value) => setFormData({ ...formData, location: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {regions.map((region) => {
                                const regionCountries = getCountriesByRegion(region);
                                if (regionCountries.length === 0) return null;
                                
                                return (
                                  <div key={region}>
                                    <div className="px-2 py-1 text-sm font-semibold text-gray-600 bg-gray-50">
                                      {region}
                                    </div>
                                    {regionCountries.map((country) => (
                                      <SelectItem key={country.code} value={country.name}>
                                        {country.flag} {country.name}
                                      </SelectItem>
                                    ))}
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Full Address</Label>
                        <Input
                          id="address"
                          placeholder="Complete street address with postal code"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            placeholder="Include country code (e.g., +260 XXX XXX XXX)"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="branch@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingBranch ? 'Update Branch' : 'Create Branch'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Details</TableHead>
                  <TableHead>Location & Contact</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => {
                  const country = getCountryByName(branch.location);
                  return (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center space-x-2">
                            {country && <span>{country.flag}</span>}
                            <span>{branch.name}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Created {new Date(branch.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-blue-600">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {branch.location}
                          </div>
                          {branch.address && (
                            <div className="text-sm text-gray-500 mt-1">{branch.address}</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">
                            {branch.phone && <div>📞 {branch.phone}</div>}
                            {branch.email && <div>✉️ {branch.email}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {branch.manager ? (
                          <div>
                            <div className="font-medium">
                              {branch.manager.first_name && branch.manager.last_name 
                                ? `${branch.manager.first_name} ${branch.manager.last_name}`
                                : branch.manager.email
                              }
                            </div>
                            <div className="text-sm text-gray-500">{branch.manager.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No manager assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.is_active ? "default" : "secondary"}>
                          {branch.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBranchStatusMutation.mutate({
                              branchId: branch.id,
                              isActive: branch.is_active
                            })}
                          >
                            {branch.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredBranches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {selectedRegion === 'all' 
                  ? 'No branches found. Add your first African branch to get started!'
                  : `No branches found in ${selectedRegion}. Consider expanding to this region!`
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBranchManagement;
