
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Sparkles } from 'lucide-react';
import { useSubscriptionTiers, useUserSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PricingSection = () => {
  const { data: tiers = [], isLoading } = useSubscriptionTiers();
  const { data: userSubscription } = useUserSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free trial':
        return <Sparkles className="h-6 w-6 text-blue-500" />;
      case 'basic plan':
        return <Zap className="h-6 w-6 text-green-500" />;
      case 'standard plan':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'premium plan':
        return <Crown className="h-6 w-6 text-amber-500" />;
      default:
        return <Crown className="h-6 w-6" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free trial':
        return 'border-blue-200 hover:border-blue-300';
      case 'basic plan':
        return 'border-green-200 hover:border-green-300';
      case 'standard plan':
        return 'border-purple-200 hover:border-purple-300 ring-2 ring-purple-200';
      case 'premium plan':
        return 'border-amber-200 hover:border-amber-300';
      default:
        return 'border-gray-200 hover:border-gray-300';
    }
  };

  const isCurrentPlan = (tierId: string) => {
    return userSubscription?.subscription_tier_id === tierId;
  };

  const handleSelectPlan = (tierName: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (tierName === 'Free Trial') {
      // Users already get free trial by default
      navigate('/dashboard');
    } else {
      // Redirect to subscription management for upgrades
      navigate('/subscription');
    }
  };

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a free 30-day trial, then choose the plan that best fits your property management needs
          </p>
          <div className="mt-6 flex items-center justify-center">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              🎉 30-Day Free Trial - No Credit Card Required
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const isPopular = tier.name === 'Standard Plan';
            const isCurrent = isCurrentPlan(tier.id);
            
            return (
              <Card 
                key={tier.id}
                className={`relative transition-all duration-300 hover:shadow-lg ${getTierColor(tier.name)} ${
                  isPopular ? 'transform scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    {getTierIcon(tier.name)}
                  </div>
                  <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-gray-900">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </div>
                    {tier.price > 0 && (
                      <div className="text-sm text-gray-500">per month</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t">
                    <div className="text-xs text-gray-500 mb-3">
                      <div className="flex justify-between">
                        <span>Properties:</span>
                        <span className="font-medium">
                          {tier.max_properties === -1 ? 'Unlimited' : tier.max_properties}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Monthly Bookings:</span>
                        <span className="font-medium">
                          {tier.max_bookings === -1 ? 'Unlimited' : tier.max_bookings}
                        </span>
                      </div>
                    </div>

                    {isCurrent ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSelectPlan(tier.name)}
                        className={`w-full ${
                          isPopular 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : tier.name === 'Free Trial'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : ''
                        }`}
                        variant={isPopular ? 'default' : tier.name === 'Free Trial' ? 'default' : 'outline'}
                      >
                        {tier.name === 'Free Trial' ? 'Start Free Trial' : 'Upgrade'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Commission Information */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Commission Structure
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">Free Trial</div>
                <div className="text-gray-600">8% commission</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">Basic Plan</div>
                <div className="text-gray-600">6% commission</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">Standard Plan</div>
                <div className="text-gray-600">4% commission</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-amber-600">Premium Plan</div>
                <div className="text-gray-600">3% commission</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Commission is only charged on successful bookings. Lower rates for higher tier subscriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
