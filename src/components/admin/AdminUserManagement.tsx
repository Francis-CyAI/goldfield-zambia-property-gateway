
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, UserPlus, Search, Shield, Ban } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  admin_status?: {
    admin_type: string;
    is_active: boolean;
    branch_location: string | null;
  };
}

const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      console.log('Fetching users with search term:', searchTerm);
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          created_at,
          admin_users!left (
            admin_type,
            is_active,
            branch_location
          )
        `);

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data.map(user => ({
        ...user,
        admin_status: user.admin_users?.[0] || null
      }));
    },
  });

  const promoteToAdminMutation = useMutation({
    mutationFn: async ({ userId, adminType, branchLocation }: { 
      userId: string; 
      adminType: string; 
      branchLocation?: string; 
    }) => {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          admin_type: adminType,
          branch_location: branchLocation,
          permissions: adminType === 'super_admin' 
            ? ['read', 'write', 'delete', 'manage_users', 'manage_branches']
            : adminType === 'hq_admin'
            ? ['read', 'write', 'manage_users']
            : ['read', 'write']
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setAdminDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User promoted to admin successfully",
      });
    },
    onError: (error) => {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin",
        variant: "destructive",
      });
    },
  });

  const toggleAdminStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !isActive })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Success",
        description: "Admin status updated successfully",
      });
    },
  });

  const handlePromoteToAdmin = (adminType: string, branchLocation?: string) => {
    if (!selectedUser) return;
    promoteToAdminMutation.mutate({
      userId: selectedUser.id,
      adminType,
      branchLocation
    });
  };

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
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
          <CardDescription>
            Manage users, assign admin roles, and monitor user activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Admin Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.email
                          }
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.admin_status ? (
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.admin_status.is_active ? "default" : "secondary"}>
                            <Shield className="h-3 w-3 mr-1" />
                            {user.admin_status.admin_type?.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {user.admin_status.branch_location && (
                            <Badge variant="outline">{user.admin_status.branch_location}</Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">Regular User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {!user.admin_status ? (
                          <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Make Admin
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Promote to Admin</DialogTitle>
                                <DialogDescription>
                                  Select the admin role for {user.email}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Button
                                  onClick={() => handlePromoteToAdmin('branch_admin')}
                                  className="w-full justify-start"
                                  variant="outline"
                                >
                                  Branch Admin - Limited to branch operations
                                </Button>
                                <Button
                                  onClick={() => handlePromoteToAdmin('hq_admin')}
                                  className="w-full justify-start"
                                  variant="outline"
                                >
                                  HQ Admin - Full platform management
                                </Button>
                                <Button
                                  onClick={() => handlePromoteToAdmin('super_admin')}
                                  className="w-full justify-start"
                                  variant="outline"
                                >
                                  Super Admin - Complete system access
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAdminStatusMutation.mutate({
                              userId: user.id,
                              isActive: user.admin_status.is_active
                            })}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            {user.admin_status.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
