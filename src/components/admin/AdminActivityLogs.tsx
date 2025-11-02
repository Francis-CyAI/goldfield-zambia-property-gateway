import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, User, Shield } from 'lucide-react';
import { listDocuments } from '@/lib/utils/firebase';
import type { AdminActivityLog } from '@/lib/models';

const AdminActivityLogs = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: async () => {
      const { data, error } = await listDocuments('adminActivityLogs', [orderBy('created_at', 'desc')]);
      if (error) throw error;
      return data ?? [];
    },
  });

  const auditLogs = logs.filter((log) => log.entity_type === 'user' || log.entity_type === 'permission');
  const activityLogs = logs.filter((log) => !auditLogs.includes(log));

  const renderRows = (records: AdminActivityLog[]) => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
            Loading activity logs...
          </TableCell>
        </TableRow>
      );
    }

    if (records.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
            No activity recorded yet.
          </TableCell>
        </TableRow>
      );
    }

    return records.map((log) => (
      <TableRow key={log.id}>
        <TableCell>
          <div className="font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {log.actor_email || log.actor_id}
          </div>
          <div className="text-xs text-muted-foreground">{log.actor_id}</div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{log.action}</div>
          {log.entity_type && (
            <div className="text-xs text-muted-foreground">
              {log.entity_type}
              {log.entity_id ? ` • ${log.entity_id}` : ''}
            </div>
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant={
              log.severity === 'critical'
                ? 'destructive'
                : log.severity === 'warning'
                ? 'secondary'
                : 'outline'
            }
          >
            <Shield className="h-3 w-3 mr-1" />
            {log.severity ?? 'info'}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Admin Activity Logs
        </CardTitle>
        <CardDescription>Track administrative actions and audit events across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Platform Activity</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderRows(activityLogs)}</TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderRows(auditLogs)}</TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminActivityLogs;

