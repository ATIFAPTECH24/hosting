// API base URL comes from the Vite environment file (.env).
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://shorturlproject.onrender.com').replace(/\/$/, '')
export const SHORT_BASE = (import.meta.env.VITE_SHORT_BASE || API_BASE_URL).replace(/\/$/, '')

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch {
    throw new Error('Backend se connect nahi ho pa raha. Render backend ko check karein aur CORS settings verify karein.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`)
  }
  return data
}

export async function createShortUrl(url) {
  return request('/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}

export async function getAllUrls() {
  const data = await request('/url')
  // Support APIs that return either an array or an object containing the array.
  if (Array.isArray(data)) return data
  return data.urls || data.data || []
}

export async function deleteUrl(id) {
  return request(`/url/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getAnalytics(id) {
  return request(`/url/analytics/${encodeURIComponent(id)}`)
}

export function normalizeUrl(input) {
  const value = input.trim()
  if (!value) return ''
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const parsed = new URL(withProtocol)
    if (!parsed.hostname.includes('.')) return ''
    return parsed.href
  } catch {
    return ''
  }
}
