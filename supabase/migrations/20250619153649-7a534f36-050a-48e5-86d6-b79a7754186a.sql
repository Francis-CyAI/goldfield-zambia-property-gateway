
-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  max_properties INTEGER,
  max_bookings INTEGER,
  priority_support BOOLEAN DEFAULT false,
  analytics_access BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert subscription tiers
INSERT INTO public.subscription_tiers (name, price, features, max_properties, max_bookings, priority_support, analytics_access) VALUES
('Free Trial', 0.00, ARRAY['Up to 2 property listings', 'Basic booking management', 'Email support', '30-day trial period'], 2, 10, false, false),
('Standard', 12.00, ARRAY['Up to 10 property listings', 'Advanced booking management', 'Email support', 'Basic analytics'], 10, 50, false, true),
('Pro', 17.00, ARRAY['Up to 50 property listings', 'Advanced booking management', 'Priority email support', 'Advanced analytics', 'Custom branding'], 50, 200, true, true),
('Service Provider', 25.00, ARRAY['Unlimited service listings', 'Client management tools', 'Priority support', 'Advanced analytics', 'Custom profile'], -1, -1, true, true);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_tier_id UUID REFERENCES public.subscription_tiers(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscription tables
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription tiers (public read access)
CREATE POLICY "Anyone can view subscription tiers" 
  ON public.subscription_tiers 
  FOR SELECT 
  USING (true);

-- Create policies for user subscriptions
CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert subscriptions" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to automatically create free trial for new users
CREATE OR REPLACE FUNCTION public.create_free_trial_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  free_trial_tier_id UUID;
BEGIN
  -- Get the free trial tier ID
  SELECT id INTO free_trial_tier_id 
  FROM public.subscription_tiers 
  WHERE name = 'Free Trial' 
  LIMIT 1;
  
  -- Create free trial subscription for new user
  INSERT INTO public.user_subscriptions (
    user_id, 
    subscription_tier_id, 
    trial_ends_at,
    current_period_end
  ) VALUES (
    NEW.id, 
    free_trial_tier_id, 
    now() + INTERVAL '30 days',
    now() + INTERVAL '30 days'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create free trial for new users
CREATE TRIGGER create_user_free_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_free_trial_subscription();

-- Create admin roles table for host management
CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on admin roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin roles
CREATE POLICY "Users can view their own role" 
  ON public.admin_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
  ON public.admin_roles 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage roles" 
  ON public.admin_roles 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX idx_admin_roles_role ON public.admin_roles(role);
