
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Plus, Edit, MapPin, Phone, Mail, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Manager {
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
  is_active: boolean;
  manager_id: string | null;
  manager: Manager | null;
  created_at: string;
  updated_at: string;
  admin_count?: number;
}

const AdminBranchManagement = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
    fetchPotentialManagers();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          manager:profiles!branches_manager_id_fkey(
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get admin counts for each branch
      const branchesWithCounts = await Promise.all(
        (data || []).map(async (branch) => {
          const { count } = await supabase
            .from('admin_users')
            .select('*', { count: 'exact', head: true })
            .eq('branch_location', branch.location);

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

  const fetchPotentialManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          user_id,
          profiles!admin_users_user_id_fkey(
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('admin_type', 'branch_admin')
        .eq('is_active', true);

      if (error) throw error;

      const formattedManagers = (data || [])
        .filter(item => item.profiles)
        .map(item => ({
          id: item.profiles.id,
          email: item.profiles.email,
          first_name: item.profiles.first_name,
          last_name: item.profiles.last_name
        }));

      setManagers(formattedManagers);
    } catch (error) {
      console.error('Error fetching potential managers:', error);
    }
  };

  const handleCreateBranch = async () => {
    try {
      const { error } = await supabase
        .from('branches')
        .insert({
          name: formData.name,
          location: formData.location,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.email || null,
          manager_id: formData.manager_id || null
        });

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
        .update({
          name: formData.name,
          location: formData.location,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.email || null,
          manager_id: formData.manager_id || null
        })
        .eq('id', selectedBranch.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Branch updated successfully',
      });

      setIsEditDialogOpen(false);
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
    setSelectedBranch(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Branch Management</h2>
          <p className="text-muted-foreground">
            Manage office branches and their administrators
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Branches Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branches.filter(b => b.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branches.reduce((sum, branch) => sum + (branch.admin_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
          <CardDescription>
            All registered office branches and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading branches...</div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No branches found. Create your first branch to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Admins</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {branch.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{branch.location}</div>
                        {branch.address && (
                          <div className="text-sm text-muted-foreground">
                            {branch.address}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {branch.manager ? (
                          <div>
                            <div className="font-medium">
                              {branch.manager.first_name} {branch.manager.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {branch.manager.first_name} {branch.manager.last_name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No manager assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {branch.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {branch.phone}
                            </div>
                          )}
                          {branch.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {branch.manager?.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {branch.admin_count || 0} admins
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                          {branch.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBranch(branch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBranchStatus(branch)}
                            className={branch.is_active ? 'text-red-600' : 'text-green-600'}
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
          )}
        </CardContent>
      </Card>

      {/* Create Branch Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogDescription>
              Add a new office branch to your organization
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter branch name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Enter location"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter full address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manager">Branch Manager</Label>
              <Select 
                value={formData.manager_id} 
                onValueChange={(value) => setFormData({...formData, manager_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No manager</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.first_name} {manager.last_name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBranch}>Create Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Update branch information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Branch Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter branch name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Enter location"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter full address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-manager">Branch Manager</Label>
              <Select 
                value={formData.manager_id} 
                onValueChange={(value) => setFormData({...formData, manager_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No manager</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.first_name} {manager.last_name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBranch}>Update Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBranchManagement;
