
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  DollarSign, 
  BarChart3, 
  MapPin,
  Shield,
  Activity,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminPropertyManagement from '@/components/admin/AdminPropertyManagement';
import AdminCommissionTracking from '@/components/admin/AdminCommissionTracking';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminBranchManagement from '@/components/admin/AdminBranchManagement';
import AdminActivityLogs from '@/components/admin/AdminActivityLogs';
import { useAdminStatus } from '@/hooks/useAdminStatus';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: adminStatus, isLoading } = useAdminStatus();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!adminStatus?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isHQAdmin = adminStatus.adminType === 'hq_admin' || adminStatus.adminType === 'super_admin';
  const isSuperAdmin = adminStatus.adminType === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isSuperAdmin ? "default" : "secondary"}>
                <Shield className="h-3 w-3 mr-1" />
                {adminStatus.adminType?.replace('_', ' ').toUpperCase()}
              </Badge>
              {adminStatus.branchLocation && (
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {adminStatus.branchLocation}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Commissions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            {isHQAdmin && (
              <TabsTrigger value="branches" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Branches</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="properties">
            <AdminPropertyManagement />
          </TabsContent>

          <TabsContent value="commissions">
            <AdminCommissionTracking />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          {isHQAdmin && (
            <TabsContent value="branches">
              <AdminBranchManagement />
            </TabsContent>
          )}

          <TabsContent value="activity">
            <AdminActivityLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
