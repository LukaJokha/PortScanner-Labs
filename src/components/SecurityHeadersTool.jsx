import { useState } from 'react'

const securityChecks = [
  ['Strict-Transport-Security', 'strict-transport-security'],
  ['X-Frame-Options', 'x-frame-options'],
  ['Content-Security-Policy', 'content-security-policy'],
  ['X-Content-Type-Options', 'x-content-type-options'],
  ['Referrer-Policy', 'referrer-policy'],
]

const headerValue = (headers, label, key) => headers[key] || headers[label] || headers[label.toLowerCase()] || 'Missing'

export default function SecurityHeadersTool() {
  const [query, setQuery] = useState('https://example.com')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const inspectHeaders = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setError('Please enter a website URL.')
      return
    }

    let parsedUrl
    try {
      parsedUrl = new URL(cleanQuery)
    } catch {
      setError('Please provide a valid absolute URL.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(parsedUrl.toString(), { method: 'GET', mode: 'cors' })
      const headers = Object.fromEntries(response.headers.entries())
      const checks = securityChecks.map(([label, key]) => {
        const value = headerValue(headers, label, key)
        return {
          label,
          present: value !== 'Missing',
          value,
        }
      })

      const score = Math.round((checks.filter((item) => item.present).length / checks.length) * 100)
      setResult({
        status: response.status,
        url: parsedUrl.toString(),
        score,
        checks,
      })
    } catch (probeError) {
      setError(probeError.message || 'Security header scan failed. Use a browser-friendly target or try a different host.')
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
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">SECURITY HEADERS AUDIT</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">browser probe</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">The security headers audit performs a client-side fetch against the target URL and inspects the outgoing security headers. Missing HSTS, CSP, or framing controls appear clearly in the summary and should be treated as policy remediation items.</div>
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
          onClick={inspectHeaders}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'AUDITING…' : 'AUDIT'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {result ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Target</div>
              <div className="mt-1 font-mono text-xs text-white">{result.url}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Security Score</div>
              <div className="mt-1 font-mono text-xs text-white">{result.score}%</div>
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Header Findings</div>
            <div className="space-y-2 text-xs text-slate-200">
              {result.checks.map((item) => (
                <div key={item.label} className="flex items-center justify-between border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono">
                  <span>{item.label}</span>
                  <span className={item.present ? 'text-emerald-300' : 'text-rose-300'}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
