import { useState } from 'react'

const normalizeWhois = (payload) => {
  const fields = payload?.records || []
  const summary = {}

  fields.forEach((entry) => {
    const key = entry?.name || entry?.type || 'record'
    summary[key] = entry?.value || entry?.data || '—'
  })

  return summary
}

export default function WhoisTool() {
  const [query, setQuery] = useState('example.com')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const inspectWhois = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setError('Please enter a domain name.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(cleanQuery)}`)
      if (!response.ok) {
        throw new Error(`WHOIS/RDAP lookup failed with status ${response.status}`)
      }

      const data = await response.json()
      const summary = normalizeWhois(data)
      const events = data.events || []
      const registrar = data.entities?.find((item) => item.roles?.includes('registrar')) || {}

      setResult({
        domain: cleanQuery,
        status: data.status || 'active',
        registrar: registrar.vcardArray?.[1]?.find((entry) => entry?.[0] === 'org')?.[3] || '—',
        events,
        summary,
      })
    } catch (whoisError) {
      setError(whoisError.message || 'WHOIS inspection failed.')
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
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">WHOIS / DOMAIN REGISTRAR INTELLIGENCE</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">rdap / whois</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">The WHOIS panel performs a browser-safe RDAP lookup against the public domain registry endpoint. It surfaces registrar context, organization identity, and lifecycle events for the queried domain.</div>
        </div>
      ) : null}

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="example.com"
          className="border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none transition focus:border-cyan-400"
        />
        <button
          onClick={inspectWhois}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'LOADING…' : 'INSPECT'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {result ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Domain</div>
              <div className="mt-1 font-mono text-xs text-white">{result.domain}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Registrar</div>
              <div className="mt-1 font-mono text-xs text-white">{result.registrar}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Status</div>
              <div className="mt-1 font-mono text-xs text-white">{result.status}</div>
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Lifecycle Events</div>
            <div className="space-y-2 text-xs text-slate-200">
              {result.events.map((event) => (
                <div key={`${event.eventAction}-${event.eventDate}`} className="border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono">
                  {event.eventAction} — {event.eventDate || 'n/a'}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
