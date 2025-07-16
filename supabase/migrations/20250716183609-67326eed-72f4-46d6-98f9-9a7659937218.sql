
-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('guest', 'host', 'institution_admin', 'super_admin');

-- Update profiles table to ensure proper role handling
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- Create subscription tiers for the platform
INSERT INTO public.subscription_tiers (name, price, features, max_properties, max_bookings, priority_support, analytics_access) VALUES
('Free Trial', 0, ARRAY['Basic property listing', 'Standard support', 'Basic analytics'], 3, 10, false, false),
('Basic Plan', 29.99, ARRAY['Up to 10 properties', 'Priority support', 'Advanced analytics', 'Commission reduction'], 10, 50, true, true),
('Standard Plan', 59.99, ARRAY['Up to 25 properties', '24/7 support', 'Premium analytics', 'Lower commission rates'], 25, 150, true, true),
('Premium Plan', 99.99, ARRAY['Unlimited properties', 'Dedicated support', 'Full analytics suite', 'Lowest commission rates'], null, null, true, true);

-- Create initial admin user function
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_type TEXT DEFAULT 'hq_admin',
  branch_location TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get user ID from profiles table
  SELECT id INTO user_id
  FROM public.profiles
  WHERE email = admin_email
  LIMIT 1;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', admin_email;
  END IF;
  
  -- Insert admin user record
  INSERT INTO public.admin_users (user_id, admin_type, branch_location, is_active)
  VALUES (user_id, admin_type, branch_location, true)
  ON CONFLICT (user_id) DO UPDATE SET
    admin_type = EXCLUDED.admin_type,
    branch_location = EXCLUDED.branch_location,
    is_active = true,
    updated_at = now();
    
  RETURN user_id;
END;
$$;

-- Add sample properties function
CREATE OR REPLACE FUNCTION public.add_sample_properties()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sample_host_id UUID;
BEGIN
  -- Get a host user (you'll need to create one first)
  SELECT id INTO sample_host_id
  FROM public.profiles
  WHERE role = 'host'
  LIMIT 1;
  
  IF sample_host_id IS NOT NULL THEN
    -- Insert sample properties
    INSERT INTO public.properties (
      host_id, title, description, location, property_type, 
      price_per_night, max_guests, bedrooms, bathrooms, 
      amenities, images
    ) VALUES
    (sample_host_id, 'Luxury Villa in Lusaka', 'Beautiful 4-bedroom villa with pool and garden', 'Lusaka, Zambia', 'villa', 150.00, 8, 4, 3, 
     '["Swimming Pool", "WiFi", "Air Conditioning", "Garden", "Parking"]'::jsonb,
     '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6"]'::jsonb),
    (sample_host_id, 'Cozy Apartment Downtown', 'Modern 2-bedroom apartment in city center', 'Lusaka, Zambia', 'apartment', 75.00, 4, 2, 1,
     '["WiFi", "Kitchen", "Air Conditioning", "Balcony"]'::jsonb,
     '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]'::jsonb),
    (sample_host_id, 'Safari Lodge Experience', 'Unique safari lodge with wildlife views', 'Livingstone, Zambia', 'lodge', 200.00, 6, 3, 2,
     '["Wildlife Views", "Restaurant", "WiFi", "Safari Tours"]'::jsonb,
     '["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"]'::jsonb);
  END IF;
END;
$$;

-- Create notification system
CREATE OR REPLACE FUNCTION public.create_notification(
  user_id UUID,
  title TEXT,
  message TEXT,
  notification_type TEXT DEFAULT 'info',
  related_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (user_id, title, message, notification_type, related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger for booking notifications
CREATE OR REPLACE FUNCTION public.handle_booking_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  host_id UUID;
  property_title TEXT;
BEGIN
  -- Get host and property info
  SELECT p.host_id, p.title INTO host_id, property_title
  FROM public.properties p
  WHERE p.id = NEW.property_id;
  
  -- Notify host of new booking
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    PERFORM public.create_notification(
      host_id,
      'New Booking Confirmed',
      'Your property "' || property_title || '" has been booked.',
      'booking',
      NEW.id
    );
    
    -- Notify guest of confirmation
    PERFORM public.create_notification(
      NEW.guest_id,
      'Booking Confirmed',
      'Your booking for "' || property_title || '" has been confirmed.',
      'booking',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_booking_status_change ON public.bookings;
CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_notifications();
