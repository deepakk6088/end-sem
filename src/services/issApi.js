const ISS_URL = 'http://api.open-notify.org/iss-now.json'
const ASTROS_URL = 'http://api.open-notify.org/astros.json'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
const OCEAN_FALLBACK = 'Over ocean / remote area'

export async function fetchIssPosition() {
  const response = await fetch(ISS_URL)
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
}

export async function fetchPeopleInSpace() {
  const response = await fetch(ASTROS_URL)
  if (!response.ok) {
    throw new Error('Failed to fetch people in space')
  }

  const data = await response.json()
  const people = Array.isArray(data?.people) ? data.people : []

  return {
    count: Number(data?.number) || people.length,
    people,
  }
}

export async function fetchNearestPlace(lat, lng) {
  try {
    const url = `${NOMINATIM_URL}?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
    const response = await fetch(url, {
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
