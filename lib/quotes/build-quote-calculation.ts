import { calculateQuotePrice, DEFAULT_PRICING } from '@/lib/pricing-engine'
import { createAdminClient } from '@/lib/supabase/admin'
import { PriceBreakdown, PricingSettings, QuoteFormData } from '@/lib/types/quote'

const BUSINESS_ORIGIN_ADDRESS = '4463 Helmsway Dr, Lansing, MI 48911'
const DEFAULT_FALLBACK_DISTANCE_MILES = 50

export type DistanceCalculationStatus = 'success' | 'fallback' | 'same_address' | 'failed'

export type QuoteCalculationResult = {
  destinationAddress: string
  distanceMiles: number
  priceBreakdown: PriceBreakdown
  distanceCalculationStatus: DistanceCalculationStatus
  distanceCalculationMessage?: string
}

const ADDRESS_ABBREVIATIONS: Record<string, string> = {
  street: 'st', st: 'st',
  drive: 'dr', dr: 'dr',
  road: 'rd', rd: 'rd',
  avenue: 'ave', ave: 'ave',
  boulevard: 'blvd', blvd: 'blvd',
  lane: 'ln', ln: 'ln',
  court: 'ct', ct: 'ct',
}

function normalizeAddress(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ADDRESS_ABBREVIATIONS[token] ?? token)
    .join(' ')
    .trim()
}

function isSameBusinessAddress(destinationAddress: string): boolean {
  return normalizeAddress(destinationAddress) === normalizeAddress(BUSINESS_ORIGIN_ADDRESS)
}

export function buildDestinationAddress(data: QuoteFormData): string {
  const street = data.event_address?.trim() ?? ''
  const city = data.city?.trim() ?? ''
  const state = data.state?.trim() ?? ''
  const zip = data.zip_code?.trim() ?? ''

  return [street, city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}

export async function getPricingSettings(): Promise<PricingSettings> {
  const mergedSettings: PricingSettings = { ...DEFAULT_PRICING }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('pricing_settings').select('setting_key, setting_value')

    if (error) {
      console.error('[quote-request] pricing_settings read error', error)
      return mergedSettings
    }

    if (!data?.length) return mergedSettings

    for (const row of data) {
      const key = row.setting_key as keyof PricingSettings
      if (!(key in mergedSettings)) {
        console.warn(`[quote-request] Unknown pricing setting key ignored: ${row.setting_key}`)
        continue
      }

      const numericValue = Number(row.setting_value)
      if (!Number.isFinite(numericValue)) continue
      mergedSettings[key] = numericValue
    }

    return mergedSettings
  } catch (error) {
    console.error('[quote-request] pricing_settings unexpected error', error)
    return mergedSettings
  }
}

async function calculateDrivingDistanceMiles(destinationAddress: string): Promise<{
  distanceMiles: number
  status: DistanceCalculationStatus
  message?: string
}> {
  if (!destinationAddress) {
    return {
      distanceMiles: DEFAULT_FALLBACK_DISTANCE_MILES,
      status: 'fallback',
      message: 'Destination address missing. Verify travel fee manually.',
    }
  }

  if (isSameBusinessAddress(destinationAddress)) {
    return { distanceMiles: 0, status: 'same_address' }
  }

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!googleApiKey) {
    return {
      distanceMiles: DEFAULT_FALLBACK_DISTANCE_MILES,
      status: 'fallback',
      message: 'Missing GOOGLE_MAPS_API_KEY. Using fallback distance; verify travel fee manually.',
    }
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

    if (!response.ok) throw new Error(`Distance Matrix HTTP ${response.status}`)

    const body = await response.json() as {
      status?: string
      error_message?: string
      rows?: Array<{ elements?: Array<{ status?: string; distance?: { value?: number } }> }>
    }

    const element = body.rows?.[0]?.elements?.[0]

    console.log('[quote-request] Distance Matrix response', {
      status: body.status ?? null,
      error_message: body.error_message ?? null,
      element_status: element?.status ?? null,
    })

    if (body.status === 'REQUEST_DENIED') {
      throw new Error(`REQUEST_DENIED: ${body.error_message ?? 'Unknown Google API denial'}`)
    }

    if (body.status !== 'OK') {
      throw new Error(`Google API status ${body.status ?? 'unknown'}`)
    }

    if (!element || element.status !== 'OK' || typeof element.distance?.value !== 'number') {
      throw new Error(`Distance element status ${element?.status ?? 'unknown'}`)
    }

    const miles = Number((element.distance.value / 1609.344).toFixed(1))
    return { distanceMiles: miles, status: 'success' }
  } catch (error) {
    console.error('[quote-request] Distance calculation failed', { destinationAddress, error })
    return {
      distanceMiles: DEFAULT_FALLBACK_DISTANCE_MILES,
      status: 'fallback',
      message: 'Google Distance Matrix failed (API key, billing, or API enablement issue). Using fallback distance; verify travel fee manually.',
    }
  }
}

export async function buildQuoteCalculation(data: QuoteFormData): Promise<QuoteCalculationResult> {
  const destinationAddress = buildDestinationAddress(data)
  const pricingSettings = await getPricingSettings()
  const distance = await calculateDrivingDistanceMiles(destinationAddress)

  const priceBreakdown = calculateQuotePrice(
    data.guest_count,
    distance.distanceMiles,
    data.has_power,
    data.has_water,
    data.event_end_time,
    data.event_date,
    pricingSettings
  )

  if (distance.status === 'fallback') {
    priceBreakdown.details = {
      ...priceBreakdown.details,
      distance_calculation_status: 'fallback',
      distance_calculation_message: distance.message,
      distance_fallback_miles: DEFAULT_FALLBACK_DISTANCE_MILES,
    }
  }

  return {
    destinationAddress,
    distanceMiles: distance.distanceMiles,
    priceBreakdown,
    distanceCalculationStatus: distance.status,
    distanceCalculationMessage: distance.message,
  }
}
