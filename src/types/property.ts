
export interface Property {
  id: string;
  title: string;
  description?: string;
  location: string;
  price_per_night?: number;
  sale_price?: number;
  property_type: string;
  max_guests?: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  is_active?: boolean;
  host_id?: string;
  created_at?: string;
  updated_at?: string;
  rating?: number;
  reviewCount?: number;
  cleaningFee?: number;
  serviceFee?: number;
  listing_type?: 'rental' | 'sale';
  size_acres?: number;
}
