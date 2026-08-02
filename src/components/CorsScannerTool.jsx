import { useState } from 'react'

const securityMarkers = [
  { label: 'HSTS', key: 'strict-transport-security' },
  { label: 'CSP', key: 'content-security-policy' },
  { label: 'X-Frame-Options', key: 'x-frame-options' },
  { label: 'X-Content-Type-Options', key: 'x-content-type-options' },
  { label: 'Referrer-Policy', key: 'referrer-policy' },
]

export default function CorsScannerTool() {
  const [query, setQuery] = useState('https://example.com')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const scanCors = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setError('Please enter a website URL.')
      return
    }

    try {
      new URL(cleanQuery)
    } catch {
      setError('Please provide a valid absolute URL.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(cleanQuery, { method: 'GET' })
      const headers = Object.fromEntries(response.headers.entries())
      const missing = securityMarkers.filter((marker) => !headers[marker.key])
      const wildcardOrigin = headers['access-control-allow-origin'] === '*'
      const allowCredentials = headers['access-control-allow-credentials'] === 'true'

      setResult({
        url: cleanQuery,
        status: response.status,
        wildcardOrigin,
        allowCredentials,
        missing,
        headerSnapshot: headers,
      })
    } catch (probeError) {
      setError(probeError.message || 'CORS and security scan failed.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300">expert tool</div>
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">CORS / SECURITY MISCONFIGURATION SCANNER</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">policy inspect</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">This scanner reviews response headers and cross-origin posture for a target origin. It highlights permissive CORS declarations, wildcard exposure, and related policy risks that can broaden browser-side access unexpectedly.</div>
        </div>
      ) : null}

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="https://example.com"
          className="border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none transition focus:border-cyan-400"
        />
        <button
          onClick={scanCors}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'SCANNING…' : 'SCAN'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {result ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">URL</div>
              <div className="mt-1 font-mono text-xs text-white">{result.url}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Status</div>
              <div className="mt-1 font-mono text-xs text-white">{result.status}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Wildcard Origin</div>
              <div className={`mt-1 font-mono text-xs ${result.wildcardOrigin ? 'text-rose-300' : 'text-emerald-300'}`}>{String(result.wildcardOrigin)}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Allow Credentials</div>
              <div className={`mt-1 font-mono text-xs ${result.allowCredentials ? 'text-amber-300' : 'text-emerald-300'}`}>{String(result.allowCredentials)}</div>
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Security Policies Missing</div>
            <div className="space-y-2 text-xs text-slate-200">
              {result.missing.length ? (
                result.missing.map((item) => (
                  <div key={item.key} className="border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono text-rose-200">
                    {item.label} missing
                  </div>
                ))
              ) : (
                <div className="border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono text-emerald-300">
                  No critical security policy gaps detected in the inspected response.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
