import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Search, Plus, Edit, Shield, UserX, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminStatus {
  admin_type: string;
  is_active: boolean;
  branch_location: string | null;
}

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'student' | 'institution_admin' | 'super_admin';
  created_at: string;
  admin_status: AdminStatus | null;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    role: '',
    adminType: '',
    isActive: false,
    branchLocation: '',
    permissions: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          admin_users(
            admin_type,
            is_active,
            branch_location,
            permissions
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers: User[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at,
        admin_status: user.admin_users && Array.isArray(user.admin_users) && user.admin_users.length > 0 ? {
          admin_type: user.admin_users[0].admin_type,
          is_active: user.admin_users[0].is_active,
          branch_location: user.admin_users[0].branch_location
        } : null
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      adminType: user.admin_status?.admin_type || '',
      isActive: user.admin_status?.is_active || false,
      branchLocation: user.admin_status?.branch_location || '',
      permissions: []
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      // Update profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: editForm.role as any })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      // Handle admin status
      if (editForm.adminType) {
        const { error: adminError } = await supabase
          .from('admin_users')
          .upsert({
            user_id: selectedUser.id,
            admin_type: editForm.adminType,
            is_active: editForm.isActive,
            branch_location: editForm.branchLocation || null,
            permissions: editForm.permissions
          });

        if (adminError) throw adminError;
      } else {
        // Remove admin status if no admin type selected
        const { error: deleteError } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', selectedUser.id);

        if (deleteError) throw deleteError;
      }

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });

      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (user: User) => {
    if (!user.admin_status) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !user.admin_status.is_active })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${user.admin_status.is_active ? 'deactivated' : 'activated'} successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'admin' && user.admin_status) ||
      (statusFilter === 'active' && user.admin_status?.is_active) ||
      (statusFilter === 'inactive' && user.admin_status && !user.admin_status.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'institution_admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getAdminBadgeVariant = (adminType: string) => {
    switch (adminType) {
      case 'super_admin':
        return 'destructive';
      case 'hq_admin':
        return 'default';
      case 'branch_admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-3 p-1 sm:p-3 lg:p-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage user accounts and administrative privileges
          </p>
        </div>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="institution_admin">Institution Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Admin Users</SelectItem>
                  <SelectItem value="active">Active Admins</SelectItem>
                  <SelectItem value="inactive">Inactive Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-xs text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-xs">No users found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Admin Status</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Branch</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Status</TableHead>
                      <TableHead className="text-xs hidden xl:table-cell">Created</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="py-1">
                          <div>
                            <div className="font-medium text-xs">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : 'No name provided'
                              }
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-1">
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs px-1 py-0">
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1 hidden sm:table-cell">
                          {user.admin_status ? (
                            <Badge variant={getAdminBadgeVariant(user.admin_status.admin_type)} className="text-xs px-1 py-0">
                              {user.admin_status.admin_type.replace('_', ' ')}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 hidden md:table-cell">
                          <span className="text-xs">{user.admin_status?.branch_location || '-'}</span>
                        </TableCell>
                        <TableCell className="py-1 hidden lg:table-cell">
                          {user.admin_status ? (
                            <div className="flex items-center gap-1">
                              {user.admin_status.is_active ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 text-xs px-1 py-0">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs px-1 py-0">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Regular User</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 hidden xl:table-cell">
                          <span className="text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell className="py-1">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="h-6 px-2 text-xs"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {user.admin_status && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleUserStatus(user)}
                                className={`h-6 px-2 text-xs ${user.admin_status.is_active ? 'text-red-600' : 'text-green-600'}`}
                              >
                                {user.admin_status.is_active ? (
                                  <UserX className="h-3 w-3" />
                                ) : (
                                  <UserCheck className="h-3 w-3" />
                                )}
                              </Button>
                            )}
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">Edit User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update user role and administrative privileges
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1">
              <Label htmlFor="role" className="text-xs">User Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="institution_admin">Institution Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="adminType" className="text-xs">Admin Type</Label>
              <Select value={editForm.adminType} onValueChange={(value) => setEditForm({...editForm, adminType: value})}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select admin type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Admin Rights</SelectItem>
                  <SelectItem value="branch_admin">Branch Admin</SelectItem>
                  <SelectItem value="hq_admin">HQ Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editForm.adminType && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={editForm.isActive}
                    onCheckedChange={(checked) => setEditForm({...editForm, isActive: !!checked})}
                  />
                  <Label htmlFor="isActive" className="text-xs">Active Admin</Label>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="branchLocation" className="text-xs">Branch Location</Label>
                  <Input
                    id="branchLocation"
                    value={editForm.branchLocation}
                    onChange={(e) => setEditForm({...editForm, branchLocation: e.target.value})}
                    placeholder="Enter branch location"
                    className="h-8 text-xs"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-7 text-xs px-3">
              Cancel
            </Button>
            <Button onClick={handleSaveUser} className="h-7 text-xs px-3">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
