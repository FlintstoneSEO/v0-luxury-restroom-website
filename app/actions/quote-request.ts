"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { QuoteFormData, PricingSettings } from "@/lib/types/quote"
import { calculateQuotePrice, DEFAULT_PRICING, validateQuoteFormData } from "@/lib/pricing-engine"
import { Resend } from 'resend'

// Initialize Resend (will gracefully fail if API key not set)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const QUOTE_ACTION_VERSION = "service-role-v2"
const BUSINESS_ORIGIN_ADDRESS = "4463 Helmsway Dr, Lansing, MI 48911"
const DEFAULT_FALLBACK_DISTANCE_MILES = 50

export type QuoteRequestFormState = {
  success: boolean
  message: string
  quoteNumber?: string
  errors?: Record<string, string[]>
}

function normalizeAddress(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isSameBusinessAddress(destinationAddress: string): boolean {
  const normalizedDestination = normalizeAddress(destinationAddress)
  const normalizedBusiness = normalizeAddress(BUSINESS_ORIGIN_ADDRESS)

  return normalizedDestination === normalizedBusiness
}

function buildDestinationAddress(data: QuoteFormData): string {
  const street = data.event_address?.trim() ?? ''
  const city = data.city?.trim() ?? ''
  const state = data.state?.trim() ?? ''
  const zip = data.zip_code?.trim() ?? ''

  return [street, city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}

async function calculateDrivingDistanceMiles(destinationAddress: string): Promise<number> {
  if (!destinationAddress) {
    console.warn('[quote-request] Missing destination address. Using fallback distance 50 miles.')
    return DEFAULT_FALLBACK_DISTANCE_MILES
  }

  if (isSameBusinessAddress(destinationAddress)) {
    return 0
  }

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!googleApiKey) {
    console.error('[quote-request] Missing GOOGLE_MAPS_API_KEY. Falling back to default distance.')
    console.warn(`[quote-request] Fallback distance used: ${DEFAULT_FALLBACK_DISTANCE_MILES} miles for destination "${destinationAddress}".`)
    return DEFAULT_FALLBACK_DISTANCE_MILES
  }

  try {
    const params = new URLSearchParams({
      origins: BUSINESS_ORIGIN_ADDRESS,
      destinations: destinationAddress,
      units: 'imperial',
      mode: 'driving',
      key: googleApiKey,
    })

    const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Distance Matrix HTTP ${response.status}`)
    }

    const body = await response.json() as {
      status?: string
      rows?: Array<{ elements?: Array<{ status?: string; distance?: { value?: number } }> }>
      error_message?: string
    }

    if (body.status !== 'OK') {
      throw new Error(`Distance Matrix status ${body.status ?? 'UNKNOWN'}${body.error_message ? `: ${body.error_message}` : ''}`)
    }

    const element = body.rows?.[0]?.elements?.[0]
    if (!element || element.status !== 'OK' || typeof element.distance?.value !== 'number') {
      throw new Error(`Distance element unavailable. elementStatus=${element?.status ?? 'UNKNOWN'}`)
    }

    const miles = element.distance.value / 1609.344
    return Number(miles.toFixed(1))
  } catch (error) {
    console.error('[quote-request] Distance calculation failed', {
      destinationAddress,
      error,
    })

    if (isSameBusinessAddress(destinationAddress)) {
      return 0
    }

    console.warn(`[quote-request] Fallback distance used: ${DEFAULT_FALLBACK_DISTANCE_MILES} miles for destination "${destinationAddress}".`)
    return DEFAULT_FALLBACK_DISTANCE_MILES
  }
}

async function getPricingSettings(): Promise<PricingSettings> {
  const defaultPricing: PricingSettings = DEFAULT_PRICING

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('pricing_settings').select('setting_key, setting_value')

    if (error) {
      console.error('[quote-request] pricing_settings read error', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return defaultPricing
    }

    if (!data || data.length === 0) {
      return defaultPricing
    }

    const settings: Record<string, number> = {}
    data.forEach((row) => {
      settings[row.setting_key] = Number(row.setting_value)
    })

    return settings as unknown as PricingSettings
  } catch (error) {
    console.error('[quote-request] pricing_settings unexpected error', error)
    return defaultPricing
  }
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
  const errors = validateQuoteFormData(data)

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors below",
      errors,
    }
  }

  try {
    console.log('[quote-request] action version', QUOTE_ACTION_VERSION)

    // Get pricing settings and calculate price
    const pricingSettings = await getPricingSettings()
    const destinationAddress = buildDestinationAddress(data)
    const distanceMiles = await calculateDrivingDistanceMiles(destinationAddress)
    
    const priceBreakdown = calculateQuotePrice(
      data.guest_count,
      distanceMiles,
      data.has_power,
      data.has_water,
      data.event_end_time,
      data.event_date,
      pricingSettings
    )

    // Insert quote request with server-only service role client (bypasses anon RLS)
    let supabaseAdmin

    try {
      supabaseAdmin = createAdminClient()
    } catch (error) {
      if (error instanceof Error && error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        console.error('[quote-request] Missing server env var: SUPABASE_SERVICE_ROLE_KEY')
      } else {
        console.error('[quote-request] Failed to create admin client', error)
      }

      return {
        success: false,
        message: 'We could not save your quote request right now. Please contact us directly while we resolve this.',
      }
    }

    const { data: insertedQuote, error } = await supabaseAdmin
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
        cleaning_fee: priceBreakdown.cleaning_fee,
        damage_waiver_fee: priceBreakdown.damage_waiver_fee,
        rush_booking_fee: priceBreakdown.rush_booking_fee,
        subtotal: priceBreakdown.subtotal,
        total_price: priceBreakdown.total_price,
        status: "pending_review",
        deposit_amount: priceBreakdown.deposit_amount,
        deposit_status: "due",
        final_balance: priceBreakdown.final_balance,
        agreement_status: "not_sent",
        calculated_breakdown: priceBreakdown,
      })
      .select('quote_number')
      .single()

    if (error) {
      console.error("[quote-request] insert error", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      if (error.code === '42501') {
        console.error('[quote-request] RLS blocked insert. Confirm service role key is configured in production.')
      }
      return {
        success: false,
        message: "We could not save your quote request right now. Please contact us directly while we resolve this.",
      }
    }

    // Send email notification
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Signature Luxe Events & Amenities <info@signatureluxeevents.com>',
          replyTo: 'info@signatureluxeevents.com',
          to: 'info@signatureluxeevents.com',
          subject: `New Quote Request: ${insertedQuote?.quote_number} - ${data.customer_name}`,
          html: `
            <h2>New Quote Request Received</h2>
            <p><strong>Quote Number:</strong> ${insertedQuote?.quote_number}</p>
            <hr />
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${data.customer_name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <hr />
            <h3>Event Details</h3>
            <p><strong>Date:</strong> ${data.event_date}</p>
            <p><strong>Type:</strong> ${data.event_type}</p>
            <p><strong>Guest Count:</strong> ${data.guest_count}</p>
            <p><strong>Time:</strong> ${data.event_start_time} - ${data.event_end_time}</p>
            <hr />
            <h3>Location</h3>
            <p><strong>Address:</strong> ${data.event_address}</p>
            <p><strong>City:</strong> ${data.city}, ${data.state} ${data.zip_code}</p>
            <p><strong>Calculated Driving Distance:</strong> ${distanceMiles.toFixed(1)} miles</p>
            <hr />
            <h3>Site Utilities</h3>
            <p><strong>Power Available:</strong> ${data.has_power ? 'Yes' : 'No'}</p>
            <p><strong>Water Available:</strong> ${data.has_water ? 'Yes' : 'No'}</p>
            ${data.additional_notes ? `<p><strong>Additional Notes:</strong> ${data.additional_notes}</p>` : ''}
            <hr />
            <h3>Calculated Pricing</h3>
            <p><strong>Base Price:</strong> $${priceBreakdown.base_price.toFixed(2)}</p>
            ${priceBreakdown.travel_fee > 0 ? `<p><strong>Travel Fee:</strong> $${priceBreakdown.travel_fee.toFixed(2)}</p>` : ''}
            ${priceBreakdown.utility_fee > 0 ? `<p><strong>Utility Fee:</strong> $${priceBreakdown.utility_fee.toFixed(2)}</p>` : ''}
            ${priceBreakdown.after_hours_fee > 0 ? `<p><strong>After Hours Fee:</strong> $${priceBreakdown.after_hours_fee.toFixed(2)}</p>` : ''}
            <p><strong>Total Price:</strong> $${priceBreakdown.total_price.toFixed(2)}</p>
            <p><strong>Deposit (25%):</strong> $${priceBreakdown.deposit_amount.toFixed(2)}</p>
            <p><strong>Final Balance:</strong> $${priceBreakdown.final_balance.toFixed(2)}</p>
          `,
        })
      } catch (emailError) {
        console.error('[v0] Email error (non-fatal):', emailError)
        // Don't fail the whole request if email fails
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
      message: "We could not save your quote request right now. Please contact us directly while we resolve this.",
    }
  }
}
