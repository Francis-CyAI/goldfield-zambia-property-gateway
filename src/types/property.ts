
export interface Property {
  id: string;
  title: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  isWishlisted?: boolean;
  cleaningFee?: number;
  serviceFee?: number;
  property_type?: string;
  amenities?: string[];
  tier?: 'high' | 'middle' | 'low';
}
