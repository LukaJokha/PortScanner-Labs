import { useState } from 'react'

const statusClass = (status) => {
  if (status >= 200 && status < 300) return 'text-emerald-300'
  if (status >= 300 && status < 400) return 'text-cyan-300'
  if (status >= 400 && status < 500) return 'text-amber-300'
  return 'text-rose-300'
}

const formatHeaders = (headers) => {
  const entries = Object.entries(headers)
  return entries.length ? entries : [['headers', 'No response headers returned']]
}

export default function HttpProbeTool() {
  const [query, setQuery] = useState('https://example.com')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const probeUrl = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setError('Please enter a website URL.')
      return
    }

    let parsedUrl
    try {
      parsedUrl = new URL(cleanQuery)
    } catch {
      setError('Please provide a valid absolute URL such as https://example.com.')
      return
    }

    setLoading(true)
    setError('')

    const attempts = [
      { label: 'direct', url: parsedUrl.toString() },
      { label: 'proxy', url: `https://corsproxy.io/?${encodeURIComponent(parsedUrl.toString())}` },
    ]

    let lastError = null

    try {
      for (const attempt of attempts) {
        try {
          const start = performance.now()
          const response = await fetch(attempt.url, {
            method: 'GET',
            mode: 'cors',
          })
          const end = performance.now()
          const headers = Object.fromEntries(response.headers.entries())

          setResult({
            requestMode: attempt.label,
            status: response.status,
            statusText: response.statusText || 'HTTP response',
            responseTime: `${Math.max(0, Math.round(end - start))} ms`,
            headers,
            url: parsedUrl.toString(),
            origin: parsedUrl.origin,
          })
          return
        } catch (probeError) {
          lastError = probeError
        }
      }

      throw lastError || new Error('Request could not be completed. The endpoint may be blocking browser-based fetches.')
    } catch (probeError) {
      setError(probeError.message || 'Request could not be completed.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300">tool 03</div>
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">HTTP STATUS / HEADER PROBE</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">client fetch</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">This probe performs a browser-side GET request and formats the result into a structured terminal snapshot: status code, response latency, origin, and headers. Green codes indicate success, while red or amber codes highlight failures or redirects.</div>
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
          onClick={probeUrl}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'PROBING…' : 'PROBE'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {result ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Status</div>
              <div className={`mt-1 font-mono text-xs ${statusClass(result.status)}`}>{result.status} {result.statusText}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Response Time</div>
              <div className="mt-1 font-mono text-xs text-white">{result.responseTime}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Origin</div>
              <div className="mt-1 font-mono text-xs text-white">{result.origin}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Mode</div>
              <div className="mt-1 font-mono text-xs text-white">{result.requestMode}</div>
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Structured response</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">{result.url}</div>
            </div>
            <pre className="max-h-80 overflow-auto rounded-md border border-slate-800 bg-slate-950 p-3 text-[11px] leading-6 text-slate-200">
{JSON.stringify(
  {
    status: `${result.status} ${result.statusText}`,
    responseTime: result.responseTime,
    requestMode: result.requestMode,
    origin: result.origin,
    headers: Object.fromEntries(formatHeaders(result.headers).map(([key, value]) => [key, value])),
  },
  null,
  2,
)}
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  )
}
