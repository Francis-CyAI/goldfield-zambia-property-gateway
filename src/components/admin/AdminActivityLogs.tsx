import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, User, Settings, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  action: string;
  admin_user_id: string | null;
  target_type: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_user?: {
    user_id: string;
    admin_type: string;
    profiles?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7');
  const { toast } = useToast();

  useEffect(() => {
    fetchActivityLogs();
  }, [dateFilter]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('admin_activity_logs')
        .select(`
          *,
          admin_user:admin_users!admin_activity_logs_admin_user_id_fkey(
            user_id,
            admin_type,
            profiles(
              first_name,
              last_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const date = new Date();
        date.setDate(date.getDate() - days);
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      
      // Fix TypeScript issues by properly typing the data
      const typedLogs: ActivityLog[] = (data || []).map(log => ({
        ...log,
        ip_address: log.ip_address ? String(log.ip_address) : null
      }));
      
      setLogs(typedLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.admin_user?.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />;
      case 'create':
      case 'update':
      case 'delete':
        return <Settings className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'login':
        return 'default';
      case 'logout':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDetails = (details: any) => {
    if (!details) return '-';
    if (typeof details === 'string') return details;
    if (typeof details === 'object') {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join(', ');
    }
    return String(details);
  };

  return (
    <div className="space-y-4 p-2 sm:p-4 lg:p-6">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Activity Logs</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Track all administrative actions and system events
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search actions, users, or targets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-sm">
            Showing {filteredLogs.length} of {logs.length} activity logs
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm">No activity logs found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-full inline-block align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px] text-xs sm:text-sm">Action</TableHead>
                      <TableHead className="min-w-[140px] text-xs sm:text-sm hidden sm:table-cell">Admin User</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm hidden md:table-cell">Target</TableHead>
                      <TableHead className="min-w-[120px] text-xs sm:text-sm hidden lg:table-cell">Details</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm hidden xl:table-cell">IP Address</TableHead>
                      <TableHead className="min-w-[120px] text-xs sm:text-sm">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">
                              {log.action}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 hidden sm:table-cell">
                          {log.admin_user?.profiles ? (
                            <div className="space-y-1">
                              <div className="font-medium text-xs sm:text-sm">
                                {log.admin_user.profiles.first_name} {log.admin_user.profiles.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {log.admin_user.profiles.email}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {log.admin_user.admin_type}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">System</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 hidden md:table-cell">
                          {log.target_type && log.target_id ? (
                            <div className="space-y-1">
                              <div className="font-medium text-xs">{log.target_type}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {log.target_id.substring(0, 8)}...
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 hidden lg:table-cell">
                          <div className="max-w-xs truncate text-xs" title={formatDetails(log.details)}>
                            {formatDetails(log.details)}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 hidden xl:table-cell">
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {log.ip_address || '-'}
                          </code>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-xs">
                            <div className="font-medium">
                              {new Date(log.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </div>
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
    </div>
  );
};

export default AdminActivityLogs;
