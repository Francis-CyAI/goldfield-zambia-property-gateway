
-- First, let's add a role column to the profiles table to distinguish between hosts and guests
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'guest' CHECK (role IN ('guest', 'host', 'admin'));

-- Add a constraint to ensure properties have valid host_id references
-- Note: We'll drop it first if it exists, then recreate it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_properties_host_id' 
               AND table_name = 'properties') THEN
        ALTER TABLE public.properties DROP CONSTRAINT fk_properties_host_id;
    END IF;
END $$;

ALTER TABLE public.properties ADD CONSTRAINT fk_properties_host_id 
FOREIGN KEY (host_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add a constraint to ensure bookings have valid guest_id references
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_bookings_guest_id' 
               AND table_name = 'bookings') THEN
        ALTER TABLE public.bookings DROP CONSTRAINT fk_bookings_guest_id;
    END IF;
END $$;

ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_guest_id 
FOREIGN KEY (guest_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add a constraint to ensure wishlists have valid user_id references
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_wishlists_user_id' 
               AND table_name = 'wishlists') THEN
        ALTER TABLE public.wishlists DROP CONSTRAINT fk_wishlists_user_id;
    END IF;
END $$;

ALTER TABLE public.wishlists ADD CONSTRAINT fk_wishlists_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add a constraint to ensure reviews have valid guest_id references
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_reviews_guest_id' 
               AND table_name = 'reviews') THEN
        ALTER TABLE public.reviews DROP CONSTRAINT fk_reviews_guest_id;
    END IF;
END $$;

ALTER TABLE public.reviews ADD CONSTRAINT fk_reviews_guest_id 
FOREIGN KEY (guest_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable Row Level Security (RLS) on properties table
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones for properties table
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
CREATE POLICY "Anyone can view active properties" ON public.properties
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Hosts can manage their own properties" ON public.properties;
CREATE POLICY "Hosts can manage their own properties" ON public.properties
FOR ALL USING (host_id = auth.uid());

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings table  
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings
FOR SELECT USING (guest_id = auth.uid() OR property_id IN (
  SELECT id FROM public.properties WHERE host_id = auth.uid()
));

DROP POLICY IF EXISTS "Guests can create bookings" ON public.bookings;
CREATE POLICY "Guests can create bookings" ON public.bookings
FOR INSERT WITH CHECK (guest_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings" ON public.bookings
FOR UPDATE USING (guest_id = auth.uid() OR property_id IN (
  SELECT id FROM public.properties WHERE host_id = auth.uid()
));

-- Enable RLS on wishlists table
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlists table
DROP POLICY IF EXISTS "Users can manage their own wishlists" ON public.wishlists;
CREATE POLICY "Users can manage their own wishlists" ON public.wishlists
FOR ALL USING (user_id = auth.uid());

-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews table
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Guests can create reviews for their bookings" ON public.reviews;
CREATE POLICY "Guests can create reviews for their bookings" ON public.reviews
FOR INSERT WITH CHECK (
  guest_id = auth.uid() AND 
  booking_id IN (SELECT id FROM public.bookings WHERE guest_id = auth.uid() AND status = 'completed')
);

-- Update the handle_new_user function to set role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'guest')
  );
  RETURN NEW;
END;
$function$;
