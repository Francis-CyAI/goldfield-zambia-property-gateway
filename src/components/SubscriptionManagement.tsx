
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Crown, Zap, Star, ArrowRight } from 'lucide-react';
import { useSubscriptionTiers, useUserSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';

const SubscriptionManagement = () => {
  const { data: tiers = [], isLoading: tiersLoading } = useSubscriptionTiers();
  const { data: userSubscription, isLoading: subscriptionLoading } = useUserSubscription();

  if (tiersLoading || subscriptionLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentTier = userSubscription?.subscription_tier;
  const trialEndDate = userSubscription?.trial_ends_at ? new Date(userSubscription.trial_ends_at) : null;
  const isTrialActive = trialEndDate ? trialEndDate > new Date() : false;
  const trialDaysLeft = isTrialActive && trialEndDate
    ? Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const nextBillingDate = userSubscription?.current_period_end ? new Date(userSubscription.current_period_end) : null;

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free trial':
        return <Crown className="h-5 w-5" />;
      case 'standard':
        return <Zap className="h-5 w-5" />;
      case 'pro':
        return <Star className="h-5 w-5" />;
      case 'service provider':
        return <Crown className="h-5 w-5" />;
      default:
        return <Crown className="h-5 w-5" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free trial':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pro':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'service provider':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      {userSubscription && (
        <Card className="border-2 border-luxury-gold/30 bg-luxury-cream/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getTierIcon(currentTier?.name || '')}
                <div>
                  <CardTitle className="text-lg">Current Plan: {currentTier?.name}</CardTitle>
                  <CardDescription>
                    {isTrialActive ? (
                      <span className="text-amber-600 font-medium">
                        Trial expires in {trialDaysLeft} days ({format(new Date(userSubscription.trial_ends_at!), 'MMM dd, yyyy')})
                      </span>
                    ) : (
                      <span>
                        Next billing: {nextBillingDate ? format(nextBillingDate, 'MMM dd, yyyy') : 'Pending confirmation'}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Badge className={`px-3 py-1 ${getTierColor(currentTier?.name || '')}`}>
                Active
              </Badge>
            </div>
          </CardHeader>
          {isTrialActive && (
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trial Progress</span>
                  <span>{30 - trialDaysLeft} of 30 days used</span>
                </div>
                <Progress value={((30 - trialDaysLeft) / 30) * 100} className="h-2" />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Subscription Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold luxury-text-gradient mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your property management needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const isCurrentPlan = currentTier?.id === tier.id;
            const isPopular = tier.name === 'Pro';
            
            return (
              <Card 
                key={tier.id} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  isCurrentPlan 
                    ? 'border-2 border-luxury-gold shadow-lg' 
                    : isPopular 
                    ? 'border-2 border-purple-300' 
                    : 'border border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-luxury-gold text-white px-3 py-1">Current Plan</Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-3">
                    {getTierIcon(tier.name)}
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      {tier.price === 0 ? 'Free' : `ZMW ${tier.price}`}
                    </div>
                    {tier.price > 0 && (
                      <div className="text-sm text-gray-500">per month</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full ${
                          isPopular 
                            ? 'luxury-gradient text-white' 
                            : ''
                        }`}
                        variant={isPopular ? 'default' : 'outline'}
                      >
                        {tier.price === 0 ? 'Start Free Trial' : 'Upgrade'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>Compare features across all subscription tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  {tiers.map((tier) => (
                    <th key={tier.id} className="text-center py-3 px-4 min-w-[120px]">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Property Listings</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      {tier.max_properties === -1 ? 'Unlimited' : tier.max_properties || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Monthly Bookings</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      {tier.max_bookings === -1 ? 'Unlimited' : tier.max_bookings || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Priority Support</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      {tier.priority_support ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Analytics Access</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      {tier.analytics_access ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
