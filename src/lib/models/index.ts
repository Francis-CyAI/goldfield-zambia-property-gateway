export interface BaseDocument {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Profile extends BaseDocument {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
  branch_location?: string | null;
}

export interface Property extends BaseDocument {
  title: string;
  description?: string | null;
  location: string;
  property_type?: string | null;
  listing_type?: 'rental' | 'sale';
  sale_status?: 'available' | 'under_offer' | 'sold';
  approval_status?: 'pending' | 'approved' | 'declined';
  approval_notes?: string | null;
  reviewed_by?: string | null;
  submitted_at?: string | null;
  submitted_by_email?: string | null;
  submitted_by_name?: string | null;
  price_per_night?: number | null;
  sale_price?: number | null;
  platform_fee_percent?: number | null;
  buyer_markup_percent?: number | null;
  max_guests?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  amenities?: string[];
  images?: string[];
  is_active?: boolean;
  host_id?: string;
  seller_contact_name?: string | null;
  seller_contact_email?: string | null;
  seller_contact_phone?: string | null;
  seller_id_front_url?: string | null;
  seller_id_back_url?: string | null;
  ownership_documents?: string[];
  data_deleted_at?: string | null;
  size_acres?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  cleaningFee?: number | null;
  serviceFee?: number | null;
}

export interface PropertyAvailability extends BaseDocument {
  property_id: string;
  date: string;
  is_available: boolean;
  price_override?: number | null;
  minimum_stay?: number | null;
}

export interface PropertyLocation extends BaseDocument {
  property_id: string;
  latitude: number;
  longitude: number;
  address_line1?: string | null;
  address_line2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country: string;
}

export interface PropertyView extends BaseDocument {
  property_id: string;
  user_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  viewed_at?: string | null;
}

export interface Booking extends BaseDocument {
  property_id: string;
  host_id?: string | null;
  guest_id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface BookingRequest extends BaseDocument {
  property_id: string;
  guest_id: string;
  host_id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  message?: string | null;
  status: 'pending' | 'approved' | 'declined' | 'expired';
  total_price?: number | null;
  expires_at?: string | null;
}

export interface Commission extends BaseDocument {
  booking_id: string;
  property_id: string;
  host_id: string;
  commission_rate: number;
  booking_amount: number;
  commission_amount: number;
  status: 'pending' | 'processed' | 'paid';
  processed_at?: string | null;
}

export interface Notification extends BaseDocument {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_id?: string | null;
}

export interface NotificationToken extends BaseDocument {
  user_id: string;
  token: string;
  platform?: string | null;
  user_agent?: string | null;
  last_seen_at?: string | null;
}

export interface NotificationPreference extends BaseDocument {
  user_id: string;
  email_general?: boolean;
  push_general?: boolean;
  email_listing?: boolean;
  email_payout?: boolean;
}

export interface Suggestion extends BaseDocument {
  user_id: string;
  title: string;
  message: string;
  type: 'feedback' | 'feature' | 'bug';
  category?: 'bookings' | 'listings' | 'payouts' | 'support' | 'other';
  status: 'new' | 'in_review' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  contact_email?: string | null;
  contact_phone?: string | null;
  resolution_notes?: string | null;
}

export interface ListerEarning extends BaseDocument {
  user_id: string;
  total_gross: number;
  total_platform_fee: number;
  total_lenco_fee: number;
  available_balance: number;
  currency: string;
}

export interface ListerEarningEntry extends BaseDocument {
  booking_id: string;
  host_id: string;
  property_id?: string | null;
  gross_amount: number;
  platform_fee: number;
  lenco_fee: number;
  net_amount: number;
  status: 'pending' | 'available' | 'withdrawing';
  currency: string;
  earned_at: string | null;
}

export interface ListerWithdrawal extends BaseDocument {
  user_id: string;
  reference: string;
  amount_requested: number;
  lenco_fee: number;
  total_deducted: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  target_msisdn: string;
  operator: string;
  payout_reference?: string | null;
  failure_reason?: string | null;
  metadata?: Record<string, unknown> | null;
  processed_at?: string | null;
}

export interface Message extends BaseDocument {
  sender_id: string;
  recipient_id: string;
  participants?: string[];
  property_id?: string | null;
  booking_id?: string | null;
  subject?: string | null;
  content: string;
  is_read: boolean;
}

export interface SavedSearch extends BaseDocument {
  user_id: string;
  name: string;
  search_criteria: Record<string, unknown>;
  is_active: boolean;
  notification_enabled: boolean;
}

export interface SubscriptionTier extends BaseDocument {
  name: string;
  price: number;
  features: string[];
  max_properties: number | null;
  max_bookings: number | null;
  priority_support: boolean;
  analytics_access: boolean;
}

export interface UserSubscription extends BaseDocument {
  user_id: string;
  subscription_tier_id: string;
  subscription_tier_name?: string | null;
  status: string;
  trial_ends_at?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  lenco_payment_reference?: string | null;
  lenco_payment_id?: string | null;
  lenco_customer_id?: string | null;
  last_payment_status?: string | null;
  last_payment_at?: string | null;
  next_billing_at?: string | null;
  mobile_money_network?: string | null;
  mobile_money_number_masked?: string | null;
}

export interface PartnerSubscriptionTier extends BaseDocument {
  name: string;
  monthly_price: number;
  features: string[];
  max_listings: number | null;
  priority_support: boolean;
  featured_placement: boolean;
}

export interface PartnerSubscription extends BaseDocument {
  user_id: string;
  partner_name: string;
  business_type: string;
  subscription_tier: string;
  monthly_fee: number;
  status: string;
  lenco_payment_reference?: string | null;
  lenco_payment_id?: string | null;
  lenco_customer_id?: string | null;
  last_payment_status?: string | null;
  mobile_money_network?: string | null;
  mobile_money_number_masked?: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
}

export interface SubscriptionPayment extends BaseDocument {
  user_id: string;
  subscription_tier_id: string;
  subscription_tier_name?: string | null;
  amount: number;
  currency: string;
  network: string;
  msisdn: string;
  payment_id?: string | null;
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  customer_id?: string | null;
  kind?: string | null;
}

export interface PartnerPayment extends BaseDocument {
  user_id: string;
  subscription_tier_id: string;
  subscription_tier_name?: string | null;
  amount: number;
  currency: string;
  network: string;
  msisdn: string;
  payment_id?: string | null;
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  customer_id?: string | null;
  partner_name?: string | null;
}

export interface Review extends BaseDocument {
  property_id: string;
  guest_id: string;
  booking_id?: string;
  rating: number;
  comment?: string | null;
  category_ratings?: {
    cleanliness: number;
    accuracy: number;
    checkin: number;
    communication: number;
    location: number;
    value: number;
  };
  is_verified_stay?: boolean;
  host_response?: {
    message: string;
    created_at: string;
    host_name?: string;
  } | null;
}

export interface WishlistEntry extends BaseDocument {
  user_id: string;
  property_id: string;
}

export interface PurchaseRequest extends BaseDocument {
  property_id: string;
  property_title?: string | null;
  seller_id?: string | null;
  buyer_user_id?: string | null;
  buyer_name?: string | null;
  buyer_email: string;
  buyer_phone: string;
  buyer_id_front_url: string;
  buyer_id_back_url: string;
  buyer_notes?: string | null;
  status: 'pending' | 'contacted' | 'sold' | 'seller_paid' | 'cancelled';
  sold_at?: string | null;
  admin_notes?: string | null;
  data_deleted_at?: string | null;
}

export interface AdminActivityLog extends BaseDocument {
  actor_id: string;
  actor_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  severity?: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface Branch extends BaseDocument {
  name: string;
  location: string;
  manager_name?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface AdminUser extends BaseDocument {
  user_id: string;
  admin_type: string;
  is_active: boolean;
  branch_location?: string | null;
  permissions?: string[];
}

export type CollectionKey =
  | 'profiles'
  | 'properties'
  | 'propertyAvailability'
  | 'propertyLocations'
  | 'propertyViews'
  | 'bookings'
  | 'bookingRequests'
  | 'platformCommissions'
  | 'notifications'
  | 'notificationTokens'
  | 'notificationPreferences'
  | 'suggestions'
  | 'purchaseRequests'
  | 'listerEarnings'
  | 'listerEarningEntries'
  | 'listerWithdrawals'
  | 'messages'
  | 'savedSearches'
  | 'reviews'
  | 'subscriptionTiers'
  | 'userSubscriptions'
  | 'partnerSubscriptionTiers'
  | 'partnerSubscriptions'
  | 'branches'
  | 'adminUsers'
  | 'adminActivityLogs'
  | 'subscriptionPayments'
  | 'partnerPayments';

export type CollectionRecordMap = {
  profiles: Profile;
  properties: Property;
  propertyAvailability: PropertyAvailability;
  propertyLocations: PropertyLocation;
  propertyViews: PropertyView;
  bookings: Booking;
  bookingRequests: BookingRequest;
  platformCommissions: Commission;
  notifications: Notification;
  notificationTokens: NotificationToken;
  notificationPreferences: NotificationPreference;
  suggestions: Suggestion;
  purchaseRequests: PurchaseRequest;
  listerEarnings: ListerEarning;
  listerEarningEntries: ListerEarningEntry;
  listerWithdrawals: ListerWithdrawal;
  messages: Message;
  savedSearches: SavedSearch;
  reviews: Review;
  subscriptionTiers: SubscriptionTier;
  userSubscriptions: UserSubscription;
  partnerSubscriptionTiers: PartnerSubscriptionTier;
  partnerSubscriptions: PartnerSubscription;
  branches: Branch;
  adminUsers: AdminUser;
  adminActivityLogs: AdminActivityLog;
  subscriptionPayments: SubscriptionPayment;
  partnerPayments: PartnerPayment;
};

export type CollectionRecord<K extends CollectionKey> = CollectionRecordMap[K];
