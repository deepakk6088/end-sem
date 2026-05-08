const hasWindow = typeof window !== 'undefined'

export function loadFromStorage(key, fallback = null) {
  if (!hasWindow) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    return fallback
  }
}

export function saveToStorage(key, value) {
  if (!hasWindow) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // ignore storage failures
  }
}

export function removeFromStorage(key) {
  if (!hasWindow) return
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    // ignore storage failures
  }
}

export function loadFromStorageWithExpiry(key) {
  const stored = loadFromStorage(key)
  if (!stored || typeof stored !== 'object') {
    return null
  }

  const { value, expiresAt } = stored
  if (!expiresAt || Date.now() > expiresAt) {
    removeFromStorage(key)
    return null
  }

  return value
}

export function saveToStorageWithExpiry(key, value, ttlSeconds) {
  const expiresAt = Date.now() + ttlSeconds * 1000
  saveToStorage(key, { value, expiresAt })
}
