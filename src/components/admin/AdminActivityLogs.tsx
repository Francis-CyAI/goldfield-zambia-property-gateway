
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_user: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    admin_type: string;
  } | null;
}

const AdminActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['admin-activity-logs', searchTerm, actionFilter],
    queryFn: async () => {
      console.log('Fetching admin activity logs');
      
      let query = supabase
        .from('admin_activity_logs')
        .select(`
          *,
          admin_users!admin_activity_logs_admin_user_id_fkey (
            profiles!admin_users_user_id_fkey (
              email,
              first_name,
              last_name
            ),
            admin_type
          )
        `);

      if (searchTerm) {
        query = query.ilike('action', `%${searchTerm}%`);
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }

      return data.map(log => ({
        ...log,
        admin_user: log.admin_users ? {
          ...log.admin_users.profiles,
          admin_type: log.admin_users.admin_type
        } : null
      }));
    },
  });

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'register':
        return 'bg-green-100 text-green-800';
      case 'update':
      case 'edit':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
      case 'remove':
        return 'bg-red-100 text-red-800';
      case 'login':
      case 'access':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <Activity className="h-5 w-5" />
            <span>Admin Activity Logs</span>
          </CardTitle>
          <CardDescription>
            Monitor all administrative actions performed on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="access">Access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.admin_user ? (
                        <div>
                          <div className="font-medium">
                            {log.admin_user.first_name && log.admin_user.last_name 
                              ? `${log.admin_user.first_name} ${log.admin_user.last_name}`
                              : log.admin_user.email
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.admin_user.email}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {log.admin_user.admin_type?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.target_type && (
                        <div>
                          <div className="font-medium">{log.target_type}</div>
                          {log.target_id && (
                            <div className="text-sm text-gray-500 font-mono">
                              {log.target_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.details && (
                        <div className="text-sm">
                          {typeof log.details === 'object' 
                            ? JSON.stringify(log.details, null, 2).slice(0, 100) + '...'
                            : log.details.toString().slice(0, 100)
                          }
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.ip_address && (
                        <span className="font-mono text-sm">{log.ip_address}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
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

export default AdminActivityLogs;
