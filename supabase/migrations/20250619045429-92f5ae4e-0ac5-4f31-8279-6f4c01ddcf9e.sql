
-- Enable Row Level Security on all tables that need it
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Properties policies (drop and recreate all of them)
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Users can create their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
DROP POLICY IF EXISTS "Hosts can manage their own properties" ON public.properties;

CREATE POLICY "Anyone can view active properties" 
  ON public.properties 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can create their own properties" 
  ON public.properties 
  FOR INSERT 
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update their own properties" 
  ON public.properties 
  FOR UPDATE 
  USING (auth.uid() = host_id);

CREATE POLICY "Users can delete their own properties" 
  ON public.properties 
  FOR DELETE 
  USING (auth.uid() = host_id);

-- Bookings policies (drop and recreate all of them)
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Property owners can update booking status" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings as guest" ON public.bookings;
DROP POLICY IF EXISTS "Property hosts can view bookings for their properties" ON public.bookings;
DROP POLICY IF EXISTS "Guests can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Property hosts can update bookings for their properties" ON public.bookings;

CREATE POLICY "Users can view their own bookings as guest" 
  ON public.bookings 
  FOR SELECT 
  USING (auth.uid() = guest_id);

CREATE POLICY "Property hosts can view bookings for their properties" 
  ON public.bookings 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = bookings.property_id 
    AND properties.host_id = auth.uid()
  ));

CREATE POLICY "Users can create bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Guests can update their own bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (auth.uid() = guest_id);

CREATE POLICY "Property hosts can update bookings for their properties" 
  ON public.bookings 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = bookings.property_id 
    AND properties.host_id = auth.uid()
  ));

-- Reviews policies (drop and recreate all of them)
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Guests can create reviews for their bookings" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for properties they booked" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reviews for properties they booked" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = guest_id AND
    (booking_id IS NULL OR EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = reviews.booking_id 
      AND bookings.guest_id = auth.uid()
      AND bookings.status = 'completed'
    ))
  );

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = guest_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews 
  FOR DELETE 
  USING (auth.uid() = guest_id);

-- Wishlists policies (drop and recreate all of them)
DROP POLICY IF EXISTS "Users can manage their own wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can add to their own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can remove from their own wishlist" ON public.wishlists;

CREATE POLICY "Users can view their own wishlist" 
  ON public.wishlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" 
  ON public.wishlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" 
  ON public.wishlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON public.properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price_per_night);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
