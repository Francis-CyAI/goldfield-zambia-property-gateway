
-- Create partner_subscriptions table to track subscription payments
CREATE TABLE public.partner_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'basic',
  monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 99.00,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for partner subscriptions
CREATE POLICY "Users can view their own partner subscriptions" 
  ON public.partner_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partner subscriptions" 
  ON public.partner_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner subscriptions" 
  ON public.partner_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create partner subscription tiers table
CREATE TABLE public.partner_subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  max_listings INTEGER,
  priority_support BOOLEAN DEFAULT false,
  featured_placement BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default subscription tiers
INSERT INTO public.partner_subscription_tiers (name, monthly_price, features, max_listings, priority_support, featured_placement) VALUES
('Basic Partner', 99.00, ARRAY['Up to 10 service listings', 'Basic profile page', 'Email support'], 10, false, false),
('Premium Partner', 199.00, ARRAY['Up to 50 service listings', 'Enhanced profile page', 'Priority email support', 'Featured in search results'], 50, true, true),
('Enterprise Partner', 499.00, ARRAY['Unlimited service listings', 'Custom profile design', '24/7 phone support', 'Top placement in partner directory', 'Analytics dashboard'], -1, true, true);

-- Enable RLS for subscription tiers (public read access)
ALTER TABLE public.partner_subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription tiers" 
  ON public.partner_subscription_tiers 
  FOR SELECT 
  TO public
  USING (true);
