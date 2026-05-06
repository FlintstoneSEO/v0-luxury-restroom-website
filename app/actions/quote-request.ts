"use server"

import { createClient } from "@/lib/supabase/server"
import { QuoteFormData, PricingSettings } from "@/lib/types/quote"
import { calculateQuotePrice } from "@/lib/pricing-engine"

export type QuoteRequestFormState = {
  success: boolean
  message: string
  quoteNumber?: string
  errors?: Record<string, string[]>
}

// Hardcoded distance for now (would use Google Maps API in production)
// This estimates distance from Flint, MI (headquarters)
const ESTIMATED_DISTANCES: Record<string, number> = {
  'flint': 0,
  'detroit': 66,
  'ann arbor': 53,
  'lansing': 50,
  'grand rapids': 100,
  'kalamazoo': 115,
  'saginaw': 30,
  'bay city': 45,
  'traverse city': 190,
  'warren': 55,
  'sterling heights': 50,
  'dearborn': 70,
  'livonia': 60,
  'troy': 45,
  'westland': 65,
  'farmington hills': 55,
  'pontiac': 35,
  'rochester hills': 40,
  'royal oak': 50,
  'southfield': 55,
}

function estimateDistance(city: string): number {
  const normalizedCity = city.toLowerCase().trim()
  return ESTIMATED_DISTANCES[normalizedCity] ?? 50 // Default 50 miles
}

async function getPricingSettings(): Promise<PricingSettings> {
  const supabase = await createClient()
  const { data } = await supabase.from('pricing_settings').select('setting_key, setting_value')
  
  if (!data || data.length === 0) {
    // Return defaults if no settings found
    return {
      base_price_100_guests: 650,
      base_price_150_guests: 750,
      base_price_200_guests: 900,
      base_price_200_plus: 1100,
      included_miles: 30,
      travel_rate_per_mile: 2.5,
      generator_fee: 150,
      water_fee: 100,
      after_hours_hourly_rate: 75,
      after_hours_cutoff_hour: 22,
      deposit_percentage: 25,
    }
  }
  
  const settings: Record<string, number> = {}
  data.forEach(row => {
    settings[row.setting_key] = Number(row.setting_value)
  })
  
  return settings as unknown as PricingSettings
}

export async function submitQuoteRequest(
  _prevState: QuoteRequestFormState,
  formData: FormData
): Promise<QuoteRequestFormState> {
  // Extract all form fields
  const data: QuoteFormData = {
    customer_name: formData.get("customer_name") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    event_date: formData.get("event_date") as string,
    event_type: formData.get("event_type") as string,
    guest_count: parseInt(formData.get("guest_count") as string, 10),
    event_address: formData.get("event_address") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string || 'MI',
    zip_code: formData.get("zip_code") as string,
    event_start_time: formData.get("event_start_time") as string,
    event_end_time: formData.get("event_end_time") as string,
    has_power: formData.get("has_power") === "true",
    has_water: formData.get("has_water") === "true",
    additional_notes: formData.get("additional_notes") as string || undefined,
  }

  // Validation
  const errors: Record<string, string[]> = {}

  if (!data.customer_name || data.customer_name.trim().length < 2) {
    errors.customer_name = ["Please enter your full name"]
  }

  if (!data.email || !data.email.includes("@")) {
    errors.email = ["Please enter a valid email address"]
  }

  if (!data.phone || data.phone.replace(/\D/g, '').length < 10) {
    errors.phone = ["Please enter a valid phone number"]
  }

  if (!data.event_date) {
    errors.event_date = ["Please select an event date"]
  } else {
    const eventDate = new Date(data.event_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (eventDate < today) {
      errors.event_date = ["Event date must be in the future"]
    }
  }

  if (!data.event_type) {
    errors.event_type = ["Please select an event type"]
  }

  if (!data.guest_count || data.guest_count < 1) {
    errors.guest_count = ["Please enter the expected number of guests"]
  }

  if (!data.event_address) {
    errors.event_address = ["Please enter the event address"]
  }

  if (!data.city) {
    errors.city = ["Please enter the city"]
  }

  if (!data.zip_code || data.zip_code.length < 5) {
    errors.zip_code = ["Please enter a valid ZIP code"]
  }

  if (!data.event_start_time) {
    errors.event_start_time = ["Please select a start time"]
  }

  if (!data.event_end_time) {
    errors.event_end_time = ["Please select an end time"]
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors below",
      errors,
    }
  }

  try {
    const supabase = await createClient()
    
    // Get pricing settings and calculate price
    const pricingSettings = await getPricingSettings()
    const distanceMiles = estimateDistance(data.city)
    
    const priceBreakdown = calculateQuotePrice(
      data.guest_count,
      distanceMiles,
      data.has_power,
      data.has_water,
      data.event_end_time,
      pricingSettings
    )

    // Insert quote request
    const { data: insertedQuote, error } = await supabase
      .from("quote_requests")
      .insert({
        customer_name: data.customer_name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
        event_date: data.event_date,
        event_type: data.event_type,
        guest_count: data.guest_count,
        event_address: data.event_address.trim(),
        city: data.city.trim(),
        state: data.state,
        zip_code: data.zip_code.trim(),
        event_start_time: data.event_start_time,
        event_end_time: data.event_end_time,
        has_power: data.has_power,
        has_water: data.has_water,
        additional_notes: data.additional_notes?.trim() || null,
        distance_miles: distanceMiles,
        base_price: priceBreakdown.base_price,
        travel_fee: priceBreakdown.travel_fee,
        utility_fee: priceBreakdown.utility_fee,
        after_hours_fee: priceBreakdown.after_hours_fee,
        total_price: priceBreakdown.total_price,
        deposit_amount: priceBreakdown.deposit_amount,
        final_balance: priceBreakdown.final_balance,
        calculated_breakdown: priceBreakdown,
      })
      .select('quote_number')
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        message: "Something went wrong. Please try again or contact us directly.",
      }
    }

    return {
      success: true,
      message: "Thank you! Your quote request has been submitted successfully.",
      quoteNumber: insertedQuote?.quote_number,
    }
  } catch (error) {
    console.error("Submission error:", error)
    return {
      success: false,
      message: "Something went wrong. Please try again or contact us directly.",
    }
  }
}
