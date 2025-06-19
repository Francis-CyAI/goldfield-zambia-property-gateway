
-- Create availability table for property calendars
CREATE TABLE public.property_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override NUMERIC,
  minimum_stay INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, date)
);

-- Create property locations table for map-based search
CREATE TABLE public.property_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'Zambia',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

-- Create property amenities table for better filtering
CREATE TABLE public.property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_name TEXT NOT NULL,
  amenity_category TEXT, -- e.g., 'safety', 'comfort', 'entertainment'
  is_highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, amenity_name)
);

-- Create saved searches table
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property views/analytics table
CREATE TABLE public.property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking requests table (for inquiry system)
CREATE TABLE public.booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, declined, expired
  total_price NUMERIC,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_availability
CREATE POLICY "Anyone can view property availability" ON public.property_availability
  FOR SELECT USING (true);

CREATE POLICY "Property hosts can manage availability" ON public.property_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_availability.property_id 
      AND host_id = auth.uid()
    )
  );

-- RLS policies for property_locations
CREATE POLICY "Anyone can view property locations" ON public.property_locations
  FOR SELECT USING (true);

CREATE POLICY "Property hosts can manage locations" ON public.property_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_locations.property_id 
      AND host_id = auth.uid()
    )
  );

-- RLS policies for property_amenities
CREATE POLICY "Anyone can view property amenities" ON public.property_amenities
  FOR SELECT USING (true);

CREATE POLICY "Property hosts can manage amenities" ON public.property_amenities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_amenities.property_id 
      AND host_id = auth.uid()
    )
  );

-- RLS policies for saved_searches
CREATE POLICY "Users can manage their own saved searches" ON public.saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for property_views
CREATE POLICY "Property hosts can view their property analytics" ON public.property_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_views.property_id 
      AND host_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create property views" ON public.property_views
  FOR INSERT WITH CHECK (true);

-- RLS policies for booking_requests
CREATE POLICY "Users can view their own booking requests" ON public.booking_requests
  FOR SELECT USING (auth.uid() = guest_id OR auth.uid() = host_id);

CREATE POLICY "Guests can create booking requests" ON public.booking_requests
  FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Hosts can update booking requests for their properties" ON public.booking_requests
  FOR UPDATE USING (auth.uid() = host_id);

-- Create indexes for better performance
CREATE INDEX idx_property_availability_property_date ON public.property_availability(property_id, date);
CREATE INDEX idx_property_locations_coordinates ON public.property_locations(latitude, longitude);
CREATE INDEX idx_property_views_property_date ON public.property_views(property_id, viewed_at);
CREATE INDEX idx_booking_requests_status_expires ON public.booking_requests(status, expires_at);
