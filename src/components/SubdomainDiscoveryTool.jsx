import { useState } from 'react'

export default function SubdomainDiscoveryTool() {
  const [query, setQuery] = useState('example.com')
  const [subdomains, setSubdomains] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const discoverSubdomains = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setError('Please enter a domain name.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(cleanQuery)}&include_subdomains=true&expand=dns_names`)
      if (!response.ok) {
        throw new Error(`Certificate transparency lookup failed with status ${response.status}`)
      }

      const records = await response.json()
      const discovered = new Set()

      records.forEach((entry) => {
        const names = entry.dns_names || []
        names.forEach((name) => {
          if (name && name.endsWith(cleanQuery)) {
            discovered.add(name)
          }
        })
      })

      setSubdomains(Array.from(discovered).sort().slice(0, 50))
    } catch (lookupError) {
      setError(lookupError.message || 'Unable to discover subdomains.')
      setSubdomains([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300">expert tool</div>
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">CERTIFICATE TRANSPARENCY SUBDOMAIN FINDER</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">certspotter</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">This discovery pane queries certificate transparency issuance records and aggregates wildcarded DNS names that match the target domain. Use it to spot publicly visible hostnames that may not be obvious from the primary web presence.</div>
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
          onClick={discoverSubdomains}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'SCANNING…' : 'DISCOVER'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {subdomains.length > 0 ? (
        <div className="mt-3 border border-slate-800 bg-slate-950/60 p-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Discovered Names</div>
          <div className="max-h-80 space-y-2 overflow-auto text-xs text-slate-200">
            {subdomains.map((item) => (
              <div key={item} className="border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono">{item}</div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
