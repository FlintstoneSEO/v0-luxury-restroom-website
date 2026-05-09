'use server'

const DEFAULT_DISTANCE_MILES = 30

function getGoogleServerKey() {
  return process.env.GOOGLE_MAPS_API_KEY
}

/**
 * Calculate distance between origin and destination using Google Maps Distance Matrix API
 */
export async function calculateDistance(origin: string, destination: string): Promise<number> {
  const apiKey = getGoogleServerKey()

  if (!apiKey) {
    console.error('[distance] Missing GOOGLE_MAPS_API_KEY. Using fallback distance.')
    return DEFAULT_DISTANCE_MILES
  }

  try {
    const params = new URLSearchParams({
      origins: origin,
      destinations: destination,
      units: 'imperial',
      mode: 'driving',
      key: apiKey,
    })

    const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Distance Matrix HTTP ${response.status}`)
    }

    const data = await response.json()
    const matrixStatus = data?.status
    const element = data?.rows?.[0]?.elements?.[0]

    console.log('[distance] Google response', {
      status: matrixStatus,
      error_message: data?.error_message ?? null,
      element_status: element?.status ?? null,
    })

    if (matrixStatus === 'REQUEST_DENIED') {
      console.error('[distance] Google Distance Matrix request denied. Check key, API enablement, and billing setup.')
      return DEFAULT_DISTANCE_MILES
    }

    if (matrixStatus !== 'OK') {
      console.error(`[distance] Google Distance Matrix failed with status ${matrixStatus ?? 'unknown'}`)
      return DEFAULT_DISTANCE_MILES
    }

    if (element?.status !== 'OK' || typeof element?.distance?.value !== 'number') {
      console.error('[distance] Route element missing/invalid in Distance Matrix response.')
      return DEFAULT_DISTANCE_MILES
    }

    const distanceInMiles = element.distance.value / 1609.34
    return parseFloat(distanceInMiles.toFixed(2))
  } catch (error) {
    console.error('[distance] Distance calculation error:', error)
    return DEFAULT_DISTANCE_MILES
  }
}
