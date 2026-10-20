import { useEffect, useState } from 'react'
import { createShortUrl, getAllUrls, deleteUrl, normalizeUrl, SHORT_BASE } from './api.js'

function CopyButton({ text }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {
      const t = document.createElement('textarea'); t.value = text
      document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove()
    }
    setDone(true); setTimeout(() => setDone(false), 1500)
  }
  return <button className={`btn ghost ${done ? 'ok' : ''}`} onClick={copy}>{done ? 'Copied ✓' : 'Copy'}</button>
}

export default function App() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [latest, setLatest] = useState(null)
  const [history, setHistory] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  // MongoDB se saare links + clicks load karo
  const refreshClicks = async () => {
    setRefreshing(true)
    try { setHistory(await getAllUrls()) } catch { /* backend off ho to list waisi hi rahegi */ }
    setRefreshing(false)
  }

  useEffect(() => { refreshClicks() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const url = normalizeUrl(input)
    if (!url) return setError('Please enter a valid URL, e.g. https://example.com/long/link')
    setLoading(true)
    try {
      const { id } = await createShortUrl(url)
      const item = { id, url, createdAt: Date.now(), clicks: 0 }
      setLatest(item)
      setHistory((h) => [item, ...h.filter((x) => x.id !== id)])
      setInput('')
    } catch (err) {
      setError(err.message || 'URL shorten nahi ho saka. Backend aur CORS settings check karein.')
    } finally { setLoading(false) }
  }

  const remove = async (id) => {
    setError('')
    try {
      await deleteUrl(id)
      setHistory((h) => h.filter((x) => x.id !== id))
      if (latest?.id === id) setLatest(null)
    } catch (err) {
      setError(err.message || 'Link delete nahi ho saka.')
    }
  }
  const short = (id) => `${SHORT_BASE}/${id}`

  return (
    <>
      <div className="glow" aria-hidden />
      <header className="nav">
        <div className="logo"><span className="mark">⌁</span> snip</div>
        <a className="nav-link" href="#history">All links{history.length ? ` (${history.length})` : ''}</a>
      </header>

      <main className="wrap">
        <section className="hero">
          <p className="eyebrow">Free URL shortener</p>
          <h1>Make long links <em>short</em><br />and easy to share.</h1>
          <p className="sub">Paste any link below. Get a tidy short URL in a second, and see how many people clicked it.</p>

          <form className="shorten" onSubmit={submit}>
            <input
              type="text" inputMode="url" autoComplete="off" spellCheck="false"
              placeholder="Paste your long link here…"
              value={input} onChange={(e) => setInput(e.target.value)}
              aria-label="Long URL" aria-invalid={!!error}
            />
            <button className="btn primary" disabled={loading}>{loading ? 'Shortening…' : 'Shorten'}</button>
          </form>
          {error && <p className="error" role="alert">{error}</p>}

          {latest && (
            <div className="result" role="status">
              <div className="result-top"><span className="badge">Your short link is ready</span></div>
              <div className="result-row">
                <a className="short" href={short(latest.id)} target="_blank" rel="noreferrer">{short(latest.id).replace(/^https?:\/\//, '')}</a>
                <CopyButton text={short(latest.id)} />
              </div>
              <p className="orig" title={latest.url}>→ {latest.url}</p>
            </div>
          )}
        </section>

        <section className="features">
          <div><b>⚡ Instant</b><span>8-character links generated in a blink.</span></div>
          <div><b>📈 Click tracking</b><span>Every visit is counted and timestamped.</span></div>
          <div><b>🔒 No sign-up</b><span>Paste, shorten, share. That's it.</span></div>
        </section>

        <section className="history" id="history">
          <div className="history-head">
            <h2>All links</h2>
            {history.length > 0 && (
              <button className="btn ghost small" onClick={refreshClicks} disabled={refreshing}>{refreshing ? 'Refreshing…' : '↻ Refresh clicks'}</button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="empty">No links yet. Links you create will show up here.</div>
          ) : (
            <ul className="list">
              {history.map((h) => (
                <li key={h.id} className="item">
                  <div className="item-main">
                    <a href={short(h.id)} target="_blank" rel="noreferrer" className="short sm">{short(h.id).replace(/^https?:\/\//, '')}</a>
                    <span className="orig" title={h.url}>{h.url}</span>
                    <span className="meta">{new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="clicks"><b>{h.clicks ?? 0}</b><span>clicks</span></div>
                  <div className="actions">
                    <CopyButton text={short(h.id)} />
                    <button className="btn ghost danger" onClick={() => remove(h.id)} aria-label="Delete link">✕</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="foot">Built with MongoDB · Express · React · Node</footer>
    </>
  )
}
