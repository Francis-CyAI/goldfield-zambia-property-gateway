
-- Create admin roles table for hierarchical admin access
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_type TEXT NOT NULL CHECK (admin_type IN ('hq_admin', 'branch_admin', 'super_admin')),
  branch_location TEXT, -- Only for branch admins
  permissions TEXT[] DEFAULT ARRAY['read'],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on admin users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin users
CREATE POLICY "HQ admins can manage all admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.admin_type IN ('hq_admin', 'super_admin')
      AND au.is_active = true
    )
  );

CREATE POLICY "Branch admins can view their own record" 
  ON public.admin_users 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  manager_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create policies for branches
CREATE POLICY "Anyone can view active branches" 
  ON public.branches 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "HQ admins can manage branches" 
  ON public.branches 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.admin_type IN ('hq_admin', 'super_admin')
      AND au.is_active = true
    )
  );

-- Create admin activity logs
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.admin_users(user_id),
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'property', 'booking', etc.
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on activity logs
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity logs
CREATE POLICY "Admins can view activity logs based on their level" 
  ON public.admin_activity_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
      AND (
        au.admin_type IN ('hq_admin', 'super_admin') OR
        (au.admin_type = 'branch_admin' AND admin_user_id = auth.uid())
      )
    )
  );

CREATE POLICY "System can create activity logs" 
  ON public.admin_activity_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION public.check_admin_permission(
  user_id UUID,
  required_type TEXT DEFAULT 'hq_admin'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = user_id
    AND au.is_active = true
    AND (
      au.admin_type = required_type OR
      au.admin_type = 'super_admin' OR
      (required_type = 'branch_admin' AND au.admin_type IN ('hq_admin', 'super_admin'))
    )
  );
END;
$$;

-- Insert default super admin (you'll need to update this with actual user ID)
-- INSERT INTO public.admin_users (user_id, admin_type, permissions)
-- VALUES ('your-user-id-here', 'super_admin', ARRAY['read', 'write', 'delete', 'manage_users', 'manage_branches']);
