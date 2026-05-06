export interface QuoteFormData {
  // Customer Info
  customer_name: string;
  phone: string;
  email: string;
  
  // Event Details
  event_date: string;
  event_type: string;
  guest_count: number;
  
  // Location
  event_address: string;
  city: string;
  state: string;
  zip_code: string;
  
  // Timing
  event_start_time: string;
  event_end_time: string;
  
  // Utilities
  has_power: boolean;
  has_water: boolean;
  
  // Additional
  additional_notes?: string;
}

export interface PricingSettings {
  base_price_100_guests: number;
  base_price_150_guests: number;
  base_price_200_guests: number;
  base_price_200_plus: number;
  included_miles: number;
  travel_rate_per_mile: number;
  generator_fee: number;
  water_fee: number;
  after_hours_hourly_rate: number;
  after_hours_cutoff_hour: number;
  deposit_percentage: number;
}

export interface PriceBreakdown {
  base_price: number;
  travel_fee: number;
  utility_fee: number;
  after_hours_fee: number;
  total_price: number;
  deposit_amount: number;
  final_balance: number;
  details: {
    guest_tier: string;
    distance_miles: number;
    extra_miles: number;
    generator_needed: boolean;
    water_needed: boolean;
    after_hours_count: number;
  };
}

export interface QuoteRequest extends QuoteFormData {
  id: string;
  created_at: string;
  quote_number: string;
  distance_miles: number;
  base_price: number;
  travel_fee: number;
  utility_fee: number;
  after_hours_fee: number;
  total_price: number;
  status: 'pending' | 'sent' | 'accepted' | 'declined';
  deposit_amount: number;
  final_balance: number;
  calculated_breakdown: PriceBreakdown;
}

export const EVENT_TYPES = [
  'Wedding',
  'Corporate Event', 
  'Festival/Concert',
  'Private Party',
  'Construction Site',
  'Outdoor Ceremony',
  'Graduation Party',
  'Other'
] as const;

export const MICHIGAN_CITIES = [
  'Detroit',
  'Grand Rapids',
  'Warren',
  'Sterling Heights',
  'Ann Arbor',
  'Lansing',
  'Flint',
  'Dearborn',
  'Livonia',
  'Troy',
  'Westland',
  'Farmington Hills',
  'Kalamazoo',
  'Wyoming',
  'Southfield',
  'Rochester Hills',
  'Taylor',
  'Pontiac',
  'St. Clair Shores',
  'Royal Oak'
] as const;
