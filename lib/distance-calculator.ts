'use server'

/**
 * Calculate distance between origin and destination using Google Maps Distance Matrix API
 * @param destination - Customer's event address
 * @returns Distance in miles
 */
export async function calculateDistance(destination: string): Promise<number> {
  const origin = process.env.BUSINESS_ORIGIN_ADDRESS || '4463 Helmsway Dr, Lansing, MI 48911'
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error('[v0] Google Maps API key not found, using fallback distance estimation')
    return 0
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
      return 0
    }

    if (data.rows?.[0]?.elements?.[0]?.status !== 'OK') {
      console.error('[v0] No route found between addresses')
      return 0
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
    return 0
  }
}
