
-- Update subscription tiers with proper pricing and features for real estate platform
UPDATE public.subscription_tiers SET
  price = 0.00,
  features = ARRAY[
    'Up to 2 property listings',
    'Basic property search',
    'Email support',
    '1-month free trial',
    'Basic analytics'
  ],
  max_properties = 2,
  max_bookings = 5
WHERE name = 'Free Trial';

UPDATE public.subscription_tiers SET
  name = 'Basic Plan',
  price = 25.00,
  features = ARRAY[
    'Up to 10 property listings',
    'Advanced property search & filters',
    'Email & chat support',
    'Basic analytics dashboard',
    'Mobile app access',
    'Guest inquiry management'
  ],
  max_properties = 10,
  max_bookings = 30,
  priority_support = false,
  analytics_access = true
WHERE name = 'Standard';

UPDATE public.subscription_tiers SET
  name = 'Standard Plan',
  price = 45.00,
  features = ARRAY[
    'Up to 25 property listings',
    'Premium search & advanced filters',
    'Priority email & chat support',
    'Advanced analytics & reporting',
    'Mobile app access',
    'Guest inquiry & booking management',
    'Revenue tracking dashboard',
    'Calendar management tools',
    'Custom property descriptions'
  ],
  max_properties = 25,
  max_bookings = 100,
  priority_support = true,
  analytics_access = true
WHERE name = 'Pro';

-- Insert Premium Plan
INSERT INTO public.subscription_tiers (
  name, 
  price, 
  features, 
  max_properties, 
  max_bookings, 
  priority_support, 
  analytics_access
) VALUES (
  'Premium Plan',
  75.00,
  ARRAY[
    'Unlimited property listings',
    'Premium search with AI recommendations',
    '24/7 priority phone & chat support',
    'Advanced analytics & business insights',
    'Mobile app with premium features',
    'Complete booking & revenue management',
    'Multi-channel marketing tools',
    'Custom branding options',
    'API access for integrations',
    'Dedicated account manager',
    'Featured property placement'
  ],
  -1,
  -1,
  true,
  true
);

-- Create commission tracking table for ABS Real Estate revenue
CREATE TABLE public.platform_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  host_id UUID NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0500, -- 5% default commission
  booking_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on commission tracking
ALTER TABLE public.platform_commissions ENABLE ROW LEVEL SECURITY;

-- Create policies for commission tracking
CREATE POLICY "System can manage commissions" 
  ON public.platform_commissions 
  FOR ALL 
  USING (true);

-- Update user subscriptions to extend trial period to 1 month
UPDATE public.user_subscriptions 
SET 
  trial_ends_at = current_period_start + INTERVAL '30 days',
  current_period_end = current_period_start + INTERVAL '30 days'
WHERE subscription_tier_id = (
  SELECT id FROM public.subscription_tiers WHERE name = 'Free Trial'
);

-- Create function to calculate platform commission
CREATE OR REPLACE FUNCTION public.calculate_platform_commission(
  booking_id UUID,
  user_tier TEXT DEFAULT 'Free Trial'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  booking_record RECORD;
  commission_rate DECIMAL(5,4);
  commission_amount DECIMAL(10,2);
BEGIN
  -- Get booking details
  SELECT b.*, p.host_id 
  INTO booking_record 
  FROM public.bookings b
  JOIN public.properties p ON p.id = b.property_id
  WHERE b.id = booking_id;
  
  -- Set commission rate based on subscription tier
  CASE user_tier
    WHEN 'Free Trial' THEN commission_rate := 0.0800; -- 8% for free users
    WHEN 'Basic Plan' THEN commission_rate := 0.0600; -- 6% for basic users
    WHEN 'Standard Plan' THEN commission_rate := 0.0400; -- 4% for standard users
    WHEN 'Premium Plan' THEN commission_rate := 0.0300; -- 3% for premium users
    ELSE commission_rate := 0.0500; -- 5% default
  END CASE;
  
  -- Calculate commission amount
  commission_amount := booking_record.total_price * commission_rate;
  
  -- Insert commission record
  INSERT INTO public.platform_commissions (
    booking_id,
    property_id,
    host_id,
    commission_rate,
    booking_amount,
    commission_amount,
    status
  ) VALUES (
    booking_id,
    booking_record.property_id,
    booking_record.host_id,
    commission_rate,
    booking_record.total_price,
    commission_amount,
    'pending'
  );
END;
$$;

-- Create trigger to automatically calculate commission on booking completion
CREATE OR REPLACE FUNCTION public.handle_booking_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  host_tier TEXT;
BEGIN
  -- Only process when booking status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get host's subscription tier
    SELECT st.name INTO host_tier
    FROM public.user_subscriptions us
    JOIN public.subscription_tiers st ON st.id = us.subscription_tier_id
    JOIN public.properties p ON p.host_id = us.user_id
    WHERE p.id = NEW.property_id
    AND us.status = 'active';
    
    -- Calculate and record commission
    PERFORM public.calculate_platform_commission(NEW.id, COALESCE(host_tier, 'Free Trial'));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_booking_completion
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_completion();
