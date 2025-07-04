
-- Create table for property host payouts
CREATE TABLE public.property_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  property_id UUID NOT NULL,
  booking_id UUID NOT NULL,
  amount_kwacha NUMERIC NOT NULL,
  amount_usd NUMERIC NOT NULL,
  exchange_rate NUMERIC NOT NULL,
  payout_date DATE NOT NULL,
  payout_method TEXT NOT NULL DEFAULT 'bank_transfer',
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for host earnings summary
CREATE TABLE public.host_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_earnings_kwacha NUMERIC NOT NULL DEFAULT 0,
  total_earnings_usd NUMERIC NOT NULL DEFAULT 0,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  average_rate_kwacha NUMERIC NOT NULL DEFAULT 0,
  occupancy_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(host_id, month, year)
);

-- Create table for guest inquiries
CREATE TABLE public.guest_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  guest_id UUID NOT NULL,
  host_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'unread',
  check_in_date DATE,
  check_out_date DATE,
  guest_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for property_payouts
ALTER TABLE public.property_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view their own payouts" 
  ON public.property_payouts 
  FOR SELECT 
  USING (auth.uid() = host_id);

CREATE POLICY "System can create payouts" 
  ON public.property_payouts 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policies for host_earnings
ALTER TABLE public.host_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view their own earnings" 
  ON public.host_earnings 
  FOR SELECT 
  USING (auth.uid() = host_id);

CREATE POLICY "System can manage earnings" 
  ON public.host_earnings 
  FOR ALL 
  USING (true);

-- Add RLS policies for guest_inquiries
ALTER TABLE public.guest_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view inquiries for their properties" 
  ON public.guest_inquiries 
  FOR SELECT 
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can update inquiries for their properties" 
  ON public.guest_inquiries 
  FOR UPDATE 
  USING (auth.uid() = host_id);

CREATE POLICY "Guests can create inquiries" 
  ON public.guest_inquiries 
  FOR INSERT 
  WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Guests can view their own inquiries" 
  ON public.guest_inquiries 
  FOR SELECT 
  USING (auth.uid() = guest_id);
