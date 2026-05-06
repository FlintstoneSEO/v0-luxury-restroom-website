'use server'

/**
 * Calculate distance between origin and destination using Google Maps Distance Matrix API
 * @param origin - Starting address (from BUSINESS_ORIGIN_ADDRESS)
 * @param destination - Customer's event address
 * @returns Distance in miles
 */
export async function calculateDistance(origin: string, destination: string): Promise<number> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error('[v0] Google Maps API key not found, using fallback distance estimation')
    return 30 // Default fallback
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${encodeURIComponent(origin)}` +
        `&destinations=${encodeURIComponent(destination)}` +
        `&units=imperial` +
        `&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`Distance Matrix API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('[v0] Distance Matrix API error:', data.error_message || data.status)
      return 30 // Default fallback
    }

    if (data.rows?.[0]?.elements?.[0]?.status !== 'OK') {
      console.error('[v0] No route found between addresses')
      return 30 // Default fallback
    }

    const distanceInMeters = data.rows[0].elements[0].distance.value
    const distanceInMiles = distanceInMeters / 1609.34

    console.log('[v0] Distance calculated:', {
      origin,
      destination,
      miles: distanceInMiles.toFixed(2),
    })

    return parseFloat(distanceInMiles.toFixed(2))
  } catch (error) {
    console.error('[v0] Distance calculation error:', error)
    return 30 // Default fallback
  }
}
