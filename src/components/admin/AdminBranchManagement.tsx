
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Plus, Edit, Building, Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Manager {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Branch {
  id: string;
  name: string;
  location: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  manager_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  manager?: Manager | null;
  admin_count?: number;
}

const AdminBranchManagement = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    manager_id: ''
  });
  const [availableManagers, setAvailableManagers] = useState<Manager[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
    fetchAvailableManagers();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get admin counts for each branch
      const branchesWithCounts = await Promise.all(
        (data || []).map(async (branch) => {
          const { count } = await supabase
            .from('admin_users')
            .select('*', { count: 'exact', head: true })
            .eq('branch_location', branch.location)
            .eq('is_active', true);

          return {
            ...branch,
            admin_count: count || 0
          };
        })
      );

      setBranches(branchesWithCounts);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch branches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('role', 'institution_admin');

      if (error) throw error;
      setAvailableManagers(data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleCreateBranch = async () => {
    try {
      const { error } = await supabase
        .from('branches')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Branch created successfully',
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchBranches();
    } catch (error) {
      console.error('Error creating branch:', error);
      toast({
        title: 'Error',
        description: 'Failed to create branch',
        variant: 'destructive',
      });
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      location: branch.location,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      manager_id: branch.manager_id || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBranch = async () => {
    if (!selectedBranch) return;

    try {
      const { error } = await supabase
        .from('branches')
        .update(formData)
        .eq('id', selectedBranch.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Branch updated successfully',
      });

      setIsEditDialogOpen(false);
      setSelectedBranch(null);
      resetForm();
      fetchBranches();
    } catch (error) {
      console.error('Error updating branch:', error);
      toast({
        title: 'Error',
        description: 'Failed to update branch',
        variant: 'destructive',
      });
    }
  };

  const toggleBranchStatus = async (branch: Branch) => {
    try {
      const { error } = await supabase
        .from('branches')
        .update({ is_active: !branch.is_active })
        .eq('id', branch.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Branch ${branch.is_active ? 'deactivated' : 'activated'} successfully`,
      });

      fetchBranches();
    } catch (error) {
      console.error('Error toggling branch status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update branch status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      address: '',
      phone: '',
      email: '',
      manager_id: ''
    });
  };

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = !searchTerm || 
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && branch.is_active) ||
      (statusFilter === 'inactive' && !branch.is_active);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3 p-1 sm:p-3 lg:p-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Branch Management</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage branch offices and locations
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="h-8 text-xs px-3">
          <Plus className="h-3 w-3 mr-1" />
          Add Branch
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total Branches</CardTitle>
            <Building className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-lg sm:text-xl font-bold">{branches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Active Branches</CardTitle>
            <Activity className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-lg sm:text-xl font-bold">
              {branches.filter(b => b.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total Admins</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-lg sm:text-xl font-bold">
              {branches.reduce((sum, branch) => sum + (branch.admin_count || 0), 0)}
            </div>
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
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium mb-1 block">Search</label>
              <Input
                placeholder="Search branches..."
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
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base lg:text-lg">
            Branches ({filteredBranches.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-xs text-muted-foreground">Loading branches...</p>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-xs">No branches found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Branch</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Contact</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Manager</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Admins</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="py-1">
                          <div>
                            <div className="font-medium text-xs">{branch.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-2 w-2" />
                              <span className="truncate max-w-[100px]">{branch.location}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-1 hidden sm:table-cell">
                          <div className="text-xs">
                            {branch.email && (
                              <div className="truncate max-w-[120px]">{branch.email}</div>
                            )}
                            {branch.phone && (
                              <div className="text-muted-foreground">{branch.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-1 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {branch.manager_id ? 'Assigned' : 'Unassigned'}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 hidden lg:table-cell">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {branch.admin_count || 0} admins
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1">
                          <Badge variant={branch.is_active ? 'default' : 'secondary'} className="text-xs px-1 py-0">
                            {branch.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBranch(branch)}
                              className="h-6 px-2 text-xs"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleBranchStatus(branch)}
                              className={`h-6 px-2 text-xs ${branch.is_active ? 'text-red-600' : 'text-green-600'}`}
                            >
                              {branch.is_active ? 'Deactivate' : 'Activate'}
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

      {/* Create Branch Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">Create New Branch</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Add a new branch office to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1">
              <Label htmlFor="name" className="text-xs">Branch Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="location" className="text-xs">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="address" className="text-xs">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="h-7 text-xs px-3">
              Cancel
            </Button>
            <Button onClick={handleCreateBranch} className="h-7 text-xs px-3">
              Create Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">Edit Branch</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update branch information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1">
              <Label htmlFor="edit-name" className="text-xs">Branch Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="edit-location" className="text-xs">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="edit-address" className="text-xs">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="edit-email" className="text-xs">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="edit-phone" className="text-xs">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-7 text-xs px-3">
              Cancel
            </Button>
            <Button onClick={handleUpdateBranch} className="h-7 text-xs px-3">
              Update Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBranchManagement;
