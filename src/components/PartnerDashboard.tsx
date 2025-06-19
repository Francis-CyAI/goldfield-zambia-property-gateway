
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Calendar, 
  CreditCard, 
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { usePartnerSubscription, usePartnerCustomerPortal } from '@/hooks/usePartnerSubscription';
import { format } from 'date-fns';

const PartnerDashboard = () => {
  const { data: subscriptionData, isLoading, refetch } = usePartnerSubscription();
  const customerPortal = usePartnerCustomerPortal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscriptionData?.hasActiveSubscription) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            No Active Partner Subscription
          </CardTitle>
          <CardDescription>
            You don't have an active partner subscription. Subscribe to showcase your services on our platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/partners'}>
            View Subscription Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const subscription = subscriptionData.subscription;
  const isActive = subscription.status === 'active';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Partner Name</p>
                <p className="font-semibold">{subscription.partner_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Business Type</p>
                <p className="font-semibold capitalize">{subscription.business_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subscription Plan</p>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {subscription.subscription_tier}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={isActive ? "default" : "destructive"} className="capitalize">
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Fee</p>
                <p className="font-semibold text-primary">${subscription.monthly_fee}</p>
              </div>
              {subscription.current_period_end && (
                <div>
                  <p className="text-sm text-gray-600">Next Billing Date</p>
                  <p className="font-semibold">
                    {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Manage your payment methods and billing history
            </p>
            <Button 
              onClick={() => customerPortal.mutate()}
              disabled={customerPortal.isPending}
              className="w-full"
            >
              {customerPortal.isPending ? 'Loading...' : 'Manage Billing'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Add and manage your service listings
            </p>
            <Button variant="outline" className="w-full">
              Manage Services
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Update your partner profile and preferences
            </p>
            <Button variant="outline" className="w-full">
              Profile Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Your Plan Benefits</CardTitle>
          <CardDescription>
            Features included in your {subscription.subscription_tier} subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {subscription.subscription_tier === 'Basic Partner' && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Up to 10 service listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Basic profile page</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Email support</span>
                </div>
              </>
            )}
            {subscription.subscription_tier === 'Premium Partner' && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Up to 50 service listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Enhanced profile page</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Priority email support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Featured in search results</span>
                </div>
              </>
            )}
            {subscription.subscription_tier === 'Enterprise Partner' && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Unlimited service listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Custom profile design</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">24/7 phone support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Top placement in partner directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Analytics dashboard</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerDashboard;
