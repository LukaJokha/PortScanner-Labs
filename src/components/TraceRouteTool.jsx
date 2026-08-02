import { useState } from 'react'

const parseTrace = (text) => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.map((line) => {
    const parts = line.split(/\s+/)
    const hop = parts[0]
    const ipMatch = line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)
    const latencyMatch = line.match(/(\d+\.\d+|\d+)\s*ms/)

    return {
      hop,
      host: ipMatch ? ipMatch[0] : '—',
      latency: latencyMatch ? `${latencyMatch[1]} ms` : 'n/a',
      raw: line,
    }
  })
}

export default function TraceRouteTool() {
  const [query, setQuery] = useState('example.com')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const runTrace = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setError('Please enter a hostname.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://api.hackertarget.com/trace/?q=${encodeURIComponent(cleanQuery)}`)
      if (!response.ok) {
        throw new Error(`Trace request failed with status ${response.status}`)
      }

      const text = await response.text()
      const hops = parseTrace(text)
      if (!hops.length) {
        throw new Error('No hop data returned by the public traceroute endpoint.')
      }

      setResult({
        target: cleanQuery,
        hops,
      })
    } catch (traceError) {
      setError(traceError.message || 'Route trace could not be completed.')
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
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">TRACEROUTE / HOP LATENCY ANALYZER</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">hackertarget</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">This traceroute view submits a public host query and parses the hop-by-hop text response into a structured latency table. Use it to understand route fragmentation, network path convergence, and early latency spikes.</div>
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
          onClick={runTrace}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'TRACE…' : 'TRACE'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {result ? (
        <div className="mt-3 border border-slate-800 bg-slate-950/60 p-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Target: {result.target}</div>
          <div className="max-h-80 space-y-2 overflow-auto text-xs text-slate-200">
            {result.hops.map((hop) => (
              <div key={`${hop.hop}-${hop.raw}`} className="grid grid-cols-[60px_100px_1fr] gap-2 border border-slate-800 bg-slate-900/70 px-3 py-2 font-mono">
                <span className="text-cyan-300">{hop.hop}</span>
                <span>{hop.host}</span>
                <span>{hop.latency}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
