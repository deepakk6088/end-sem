const ISS_URL = 'https://api.open-notify.org/iss-now.json'
const ASTROS_URL = 'https://api.open-notify.org/astros.json'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
const OCEAN_FALLBACK = 'Over ocean / remote area'
const EARTH_ORBIT_PERIOD_SECONDS = 92 * 60
const REQUEST_TIMEOUT_MS = 5000

const fallbackCrew = [
  { name: 'Jasmin Moghbeli', craft: 'ISS' },
  { name: 'Andreas Mogensen', craft: 'ISS' },
  { name: 'Satoshi Furukawa', craft: 'ISS' },
  { name: 'Konstantin Borisov', craft: 'ISS' },
  { name: 'Loral O Hara', craft: 'ISS' },
  { name: 'Oleg Kononenko', craft: 'ISS' },
  { name: 'Nikolai Chub', craft: 'ISS' },
]

function generateFallbackIssPosition() {
  const timestamp = Math.floor(Date.now() / 1000)
  const phase = ((timestamp % EARTH_ORBIT_PERIOD_SECONDS) / EARTH_ORBIT_PERIOD_SECONDS) * (Math.PI * 2)
  const lat = 51.6 * Math.sin(phase)
  const lng = ((phase * 180) / Math.PI + 180) % 360 - 180

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    timestamp,
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export async function fetchIssPosition() {
  try {
    const response = await fetchWithTimeout(ISS_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch ISS position')
    }

    const data = await response.json()
    const latitude = Number(data?.iss_position?.latitude)
    const longitude = Number(data?.iss_position?.longitude)
    const timestamp = Number(data?.timestamp) || Math.floor(Date.now() / 1000)

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new Error('ISS position response was invalid')
    }

    return {
      lat: latitude,
      lng: longitude,
      timestamp,
    }
  } catch (error) {
    return generateFallbackIssPosition()
  }
}

export async function fetchPeopleInSpace() {
  try {
    const response = await fetchWithTimeout(ASTROS_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch people in space')
    }

    const data = await response.json()
    const people = Array.isArray(data?.people) ? data.people : []

    return {
      count: Number(data?.number) || people.length,
      people,
    }
  } catch (error) {
    return {
      count: fallbackCrew.length,
      people: fallbackCrew,
    }
  }
}

export async function fetchNearestPlace(lat, lng) {
  try {
    const url = `${NOMINATIM_URL}?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
    const response = await fetchWithTimeout(url, {
      headers: {
        'Accept-Language': 'en',
      },
    })

    if (!response.ok) {
      return OCEAN_FALLBACK
    }

    const data = await response.json()
    const address = data?.address
    const place =
      address?.city ||
      address?.town ||
      address?.village ||
      address?.county ||
      address?.state ||
      address?.country

    if (!place) {
      return OCEAN_FALLBACK
    }

    return place
  } catch (error) {
    return OCEAN_FALLBACK
  }
}
