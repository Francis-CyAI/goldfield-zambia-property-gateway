
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
    } | null;
  } | null;
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
        ip_address: log.ip_address ? String(log.ip_address) : null,
        admin_user: log.admin_user && !('error' in log.admin_user) ? {
          ...log.admin_user,
          profiles: log.admin_user.profiles && !('error' in log.admin_user.profiles) ? log.admin_user.profiles : null
        } : null
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
        return <User className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'create':
      case 'update':
      case 'delete':
        return <Settings className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />;
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
    <div className="space-y-3 p-1 sm:p-3 lg:p-6 max-w-full overflow-hidden">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Activity Logs</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Track all administrative actions and system events
        </p>
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
            <div className="space-y-1">
              <label className="text-xs font-medium">Search</label>
              <Input
                placeholder="Search actions, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Action Type</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="text-xs h-8">
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
            <div className="space-y-1">
              <label className="text-xs font-medium">Time Period</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="text-xs h-8">
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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-xs">
            Showing {filteredLogs.length} of {logs.length} activity logs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-xs text-muted-foreground">Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-xs">No activity logs found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px] text-xs">Action</TableHead>
                      <TableHead className="w-[140px] text-xs hidden sm:table-cell">Admin User</TableHead>
                      <TableHead className="w-[100px] text-xs hidden md:table-cell">Target</TableHead>
                      <TableHead className="w-[120px] text-xs hidden lg:table-cell">Details</TableHead>
                      <TableHead className="w-[100px] text-xs hidden xl:table-cell">IP Address</TableHead>
                      <TableHead className="w-[120px] text-xs">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="py-1">
                          <div className="flex items-center gap-1">
                            {getActionIcon(log.action)}
                            <Badge variant={getActionBadgeVariant(log.action)} className="text-xs px-1 py-0">
                              {log.action}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-1 hidden sm:table-cell">
                          {log.admin_user?.profiles ? (
                            <div className="space-y-0.5">
                              <div className="font-medium text-xs">
                                {log.admin_user.profiles.first_name} {log.admin_user.profiles.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                                {log.admin_user.profiles.email}
                              </div>
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {log.admin_user.admin_type}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">System</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 hidden md:table-cell">
                          {log.target_type && log.target_id ? (
                            <div className="space-y-0.5">
                              <div className="font-medium text-xs">{log.target_type}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {log.target_id.substring(0, 8)}...
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 hidden lg:table-cell">
                          <div className="max-w-xs truncate text-xs" title={formatDetails(log.details)}>
                            {formatDetails(log.details)}
                          </div>
                        </TableCell>
                        <TableCell className="py-1 hidden xl:table-cell">
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {log.ip_address || '-'}
                          </code>
                        </TableCell>
                        <TableCell className="py-1">
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
