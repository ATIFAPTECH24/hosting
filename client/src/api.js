// Backend ka base URL (short link isi se banta hai). Production mein VITE_SHORT_BASE set karein.
//export const SHORT_BASE = import.meta.env.VITE_SHORT_BASE || 'http://localhost:8001'
export const SHORT_BASE ='https://url-shortner-jmzw.onrender.com';
export async function createShortUrl(url) {
  const res = await fetch('/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data // { id, message }
}

export async function getAllUrls() {
  const res = await fetch('/url')
  if (!res.ok) throw new Error('Could not load links')
  return res.json() // [{ id, url, clicks, createdAt }]
}

export async function deleteUrl(id) {
  await fetch(`/url/${id}`, { method: 'DELETE' })
}

export async function getAnalytics(id) {
  const res = await fetch(`/url/analytics/${id}`)
  if (!res.ok) throw new Error('Not found')
  return res.json() // { totalClicks, analytics }
}

export function normalizeUrl(input) {
  const v = input.trim()
  if (!v) return ''
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    const u = new URL(withProto)
    if (!u.hostname.includes('.')) return ''
    return u.href
  } catch {
    return ''
  }
}
