import { useState } from 'react'

const normalizeInput = (value) => value.trim()

const formatValue = (value) => (value ? String(value) : '—')

export default function IpLookupTool() {
  const [query, setQuery] = useState('example.com')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const runLookup = async () => {
    const cleanQuery = normalizeInput(query)
    if (!cleanQuery) {
      setError('Please enter a domain or IP address.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://ipapi.co/${encodeURIComponent(cleanQuery)}/json/`)
      if (!response.ok) {
        throw new Error(`Lookup failed with status ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.reason || 'Unable to resolve the target.')
      }

      setResult({
        ip: data.ip,
        hostname: data.hostname || '—',
        org: data.org || '—',
        asn: data.asn || '—',
        country: data.country_name || '—',
        city: data.city || '—',
        region: data.region || '—',
        timezone: data.timezone || '—',
      })
    } catch (lookupError) {
      setError(lookupError.message || 'Unexpected lookup error.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300">tool 01</div>
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">IP / HOSTNAME LOOKUP</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">public ip api</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">This tool resolves a hostname or IP using the browser-safe <span className="font-mono text-cyan-300">ipapi.co</span> JSON endpoint. The output surfaces IP identity, ASN, and geographical context without a backend.</div>
        </div>
      ) : null}

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="example.com or 8.8.8.8"
          className="border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none transition focus:border-cyan-400"
        />
        <button
          onClick={runLookup}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'CHECKING…' : 'LOOKUP'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {result ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ['Resolved IP', result.ip],
            ['Hostname', result.hostname],
            ['Organization', result.org],
            ['ASN', result.asn],
            ['Country', result.country],
            ['City', result.city],
            ['Region', result.region],
            ['Timezone', result.timezone],
          ].map(([label, value]) => (
            <div key={label} className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</div>
              <div className="mt-1 font-mono text-xs text-slate-100">{formatValue(value)}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
