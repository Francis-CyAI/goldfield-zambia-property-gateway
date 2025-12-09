
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
  Settings,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminPropertyManagement from '@/components/admin/AdminPropertyManagement';
import AdminCommissionTracking from '@/components/admin/AdminCommissionTracking';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminBranchManagement from '@/components/admin/AdminBranchManagement';
import AdminActivityLogs from '@/components/admin/AdminActivityLogs';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import AdminSuggestions from '@/components/admin/AdminSuggestions';
import AdminPurchaseRequests from '@/components/admin/AdminPurchaseRequests';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.uid);
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600 text-sm sm:text-base">Access Denied</CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
                Welcome back, {user?.displayName || profile?.first_name || user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {adminStatus.adminType?.replace('_', ' ').toUpperCase()}
              </Badge>
              {adminStatus.branchLocation && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[100px]">{adminStatus.branchLocation}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-[720px] grid-cols-8 lg:grid-cols-9 h-auto p-1">
              <TabsTrigger value="overview" className="flex flex-col items-center space-y-1 p-2 text-xs">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex flex-col items-center space-y-1 p-2 text-xs">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex flex-col items-center space-y-1 p-2 text-xs">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Properties</span>
              </TabsTrigger>
              <TabsTrigger value="purchases" className="flex flex-col items-center space-y-1 p-2 text-xs">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Purchase Requests</span>
              </TabsTrigger>
              <TabsTrigger value="commissions" className="flex flex-col items-center space-y-1 p-2 text-xs">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Commissions</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex flex-col items-center space-y-1 p-2 text-xs">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex flex-col items-center space-y-1 p-2 text-xs">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Suggestions</span>
              </TabsTrigger>
              {isHQAdmin && (
                <TabsTrigger value="branches" className="flex flex-col items-center space-y-1 p-2 text-xs">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Branches</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="activity" className="flex flex-col items-center space-y-1 p-2 text-xs">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Activity</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="properties">
            <AdminPropertyManagement />
          </TabsContent>

          <TabsContent value="purchases">
            <AdminPurchaseRequests />
          </TabsContent>

          <TabsContent value="commissions">
            <AdminCommissionTracking />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="suggestions">
            <AdminSuggestions />
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
