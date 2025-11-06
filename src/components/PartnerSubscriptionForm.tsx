
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { usePartnerSubscriptionTiers, useCreatePartnerCheckout } from '@/hooks/usePartnerSubscription';
import type { MobileMoneyNetwork } from '@/hooks/useSubscription';

const PartnerSubscriptionForm = () => {
  const [partnerName, setPartnerName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [selectedTierId, setSelectedTierId] = useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [mobileMoneyNetwork, setMobileMoneyNetwork] = useState<MobileMoneyNetwork | ''>('');
  const { data: tiers, isLoading: tiersLoading } = usePartnerSubscriptionTiers();
  const createCheckout = useCreatePartnerCheckout();

  const selectedTier = useMemo(
    () => tiers?.find((tier) => tier.id === selectedTierId),
    [selectedTierId, tiers],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !businessType || !selectedTier || !mobileMoneyNumber || !mobileMoneyNetwork) return;

    createCheckout.mutate({
      partnerName,
      businessType,
      subscriptionTierId: selectedTier.id,
      subscriptionTierName: selectedTier.name,
      amount: selectedTier.monthly_price,
      currency: 'ZMW',
      msisdn: mobileMoneyNumber,
      mobileMoneyNetwork,
    });
  };

  const getTierIcon = (tierName: string) => {
    if (tierName.includes('Basic')) return <Zap className="h-5 w-5 text-blue-500" />;
    if (tierName.includes('Premium')) return <Star className="h-5 w-5 text-purple-500" />;
    if (tierName.includes('Enterprise')) return <Crown className="h-5 w-5 text-gold-500" />;
    return <Zap className="h-5 w-5 text-gray-500" />;
  };

  if (tiersLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Partner</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join our network of trusted service providers and reach more customers across Zambia.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {tiers?.map((tier) => (
          <Card 
            key={tier.id} 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedTierId === tier.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedTierId(tier.id)}
          >
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center mb-2">
                {getTierIcon(tier.name)}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <div className="text-3xl font-bold text-primary">
                K{tier.monthly_price}
                <span className="text-sm text-gray-500 font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.featured_placement && (
                <Badge className="mt-3 bg-gradient-to-r from-purple-500 to-pink-500">
                  Featured Placement
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Partner Registration</CardTitle>
          <CardDescription>
            Fill out your business details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="partnerName">Partner/Business Name *</Label>
              <Input
                id="partnerName"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select value={businessType} onValueChange={setBusinessType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology Solutions</SelectItem>
                  <SelectItem value="agriculture">Agriculture & Farming</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="retail">Retail & Commerce</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedTier && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Selected Plan:</p>
                <p className="font-semibold">{selectedTier.name}</p>
                <p className="text-sm text-primary">
                  K{selectedTier.monthly_price}/month
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="mobileMoneyNumber">Mobile Money Number *</Label>
              <Input
                id="mobileMoneyNumber"
                value={mobileMoneyNumber}
                onChange={(e) => setMobileMoneyNumber(e.target.value)}
                placeholder="+2607XXXXXXXX"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We’ll send a payment prompt to this number.
              </p>
            </div>

            <div>
              <Label htmlFor="mobileMoneyNetwork">Mobile Money Network *</Label>
              <Select
                value={mobileMoneyNetwork}
                onValueChange={(value) => setMobileMoneyNetwork(value as MobileMoneyNetwork)}
                required
              >
                <SelectTrigger id="mobileMoneyNetwork">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIRTEL">Airtel Money</SelectItem>
                  <SelectItem value="MTN">MTN MoMo</SelectItem>
                  <SelectItem value="ZAMTEL">Zamtel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                !partnerName ||
                !businessType ||
                !selectedTier ||
                !mobileMoneyNumber ||
                !mobileMoneyNetwork ||
                createCheckout.isPending
              }
            >
              {createCheckout.isPending ? 'Processing...' : 'Subscribe & Pay'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerSubscriptionForm;
