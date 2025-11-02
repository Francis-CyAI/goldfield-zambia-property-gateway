import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Users, Search, Plus, Edit, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { listDocuments, setDocument, logAdminActivity } from '@/lib/utils/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';

interface AdminUserRecord {
  user_id: string;
  admin_type?: string | null;
  is_active?: boolean;
  branch_location?: string | null;
  permissions?: string[];
}

interface ProfileRecord {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  created_at?: string | null;
  admin_status?: AdminUserRecord | null;
}

interface FormState {
  role: string;
  adminType: string;
  isActive: boolean;
  branchLocation: string;
  permissions: string[];
}

const defaultFormState: FormState = {
  role: 'guest',
  adminType: '',
  isActive: false,
  branchLocation: '',
  permissions: [],
};

const AdminUserManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<ProfileRecord | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(defaultFormState);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const [profilesResult, adminResult] = await Promise.all([
        listDocuments('profiles', [orderBy('created_at', 'desc')]),
        listDocuments('adminUsers'),
      ]);
      if (profilesResult.error) throw profilesResult.error;
      if (adminResult.error) throw adminResult.error;

      const adminMap = new Map<string, AdminUserRecord>();
      (adminResult.data ?? []).forEach((record) => {
        adminMap.set(record.user_id, record);
      });

      return (profilesResult.data ?? []).map((profile) => ({
        ...profile,
        admin_status: adminMap.get(profile.id) ?? null,
      }));
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name ?? ''} ${user.last_name ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'admin' && Boolean(user.admin_status?.is_active)) ||
        (statusFilter === 'inactive' && !user.admin_status?.is_active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const updateUserMutation = useMutation({
    mutationFn: async ({
      profile,
      updates,
    }: {
      profile: ProfileRecord;
      updates: FormState;
    }) => {
      await setDocument(
        'profiles',
        profile.id,
        removeUndefined({
          role: updates.role,
          updated_at: serverTimestamp(),
        }),
      );

      if (updates.adminType) {
        await setDocument(
          'adminUsers',
          profile.id,
          removeUndefined({
            user_id: profile.id,
            admin_type: updates.adminType,
            is_active: updates.isActive,
            branch_location: updates.branchLocation || null,
            permissions: updates.permissions,
            updated_at: serverTimestamp(),
            created_at: serverTimestamp(),
          }),
        );
      } else {
        await setDocument(
          'adminUsers',
          profile.id,
          {
            user_id: profile.id,
            admin_type: null,
            is_active: false,
            branch_location: null,
            permissions: [],
            updated_at: serverTimestamp(),
          },
        );
      }

      await logAdminActivity({
        actorId: currentUser?.uid ?? 'system',
        actorEmail: currentUser?.email ?? undefined,
        action: 'Updated user access',
        entityType: 'profile',
        entityId: profile.id,
        metadata: {
          role: updates.role,
          adminType: updates.adminType || null,
          isActive: updates.isActive,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'User updated',
        description: 'The user profile has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (user: ProfileRecord) => {
    setSelectedUser(user);
    setFormState({
      role: user.role || 'guest',
      adminType: user.admin_status?.admin_type || '',
      isActive: Boolean(user.admin_status?.is_active),
      branchLocation: user.admin_status?.branch_location || '',
      permissions: user.admin_status?.permissions || [],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({ profile: selectedUser, updates: formState });
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>Manage user roles and admin access across the platform.</CardDescription>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              className="pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
              <SelectItem value="host">Host</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admin">Active Admins</SelectItem>
              <SelectItem value="inactive">Inactive Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Admin Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No users match your filters.
                  </TableCell>
                </TableRow>
              )}
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">
                      {user.first_name || user.last_name
                        ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
                        : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined{' '}
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {user.role || 'guest'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.admin_status?.is_active ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.admin_status.admin_type?.replace('_', ' ') || 'Admin'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Standard User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Adjust the user role or admin permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Role</Label>
              <Select value={formState.role} onValueChange={(value) => setFormState((prev) => ({ ...prev, role: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="host">Host</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Admin Type</Label>
              <Select
                value={formState.adminType}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, adminType: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="No admin access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No admin access</SelectItem>
                  <SelectItem value="hq_admin">HQ Admin</SelectItem>
                  <SelectItem value="branch_admin">Branch Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formState.adminType && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="admin-active"
                    checked={formState.isActive}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({ ...prev, isActive: Boolean(checked) }))
                    }
                  />
                  <Label htmlFor="admin-active">Active Admin</Label>
                </div>
                <div>
                  <Label>Branch Location</Label>
                  <Input
                    className="mt-1"
                    placeholder="Enter branch location"
                    value={formState.branchLocation}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, branchLocation: event.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateUserMutation.isLoading}>
              {updateUserMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminUserManagement;

