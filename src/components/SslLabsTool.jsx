import { useState } from 'react'

export default function SslLabsTool() {
  const [query, setQuery] = useState('example.com')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const inspectTls = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setError('Please enter a hostname.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(cleanQuery)}&all=done&fromCache=on`)
      if (!response.ok) {
        throw new Error(`TLS analysis failed with status ${response.status}`)
      }

      const data = await response.json()
      if (data.status === 'ERROR') {
        throw new Error(data.statusMessage || 'TLS analysis returned an error.')
      }

      const endpoints = data.endpoints || []
      const highestGrade = endpoints.reduce((best, endpoint) => {
        const grade = endpoint.grade || 'X'
        if (!best || grade < best) {
          return grade
        }
        return best
      }, 'X')

      setResult({
        host: cleanQuery,
        status: data.status,
        grade: data.grade || highestGrade,
        endpoints: endpoints.map((item) => ({
          ip: item.ipAddress,
          grade: item.grade || 'X',
          status: item.statusMessage || 'No status message',
          protocols: item.details?.protocols?.map((protocol) => protocol.name).join(', ') || '—',
        })),
      })
    } catch (tlsError) {
      setError(tlsError.message || 'Unable to run TLS analysis.')
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
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">SSL / TLS POSTURE ANALYZER</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">ssl labs</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">The TLS posture analyzer uses the public SSL Labs endpoint to assess certificate status, protocol coverage, and endpoint handshake grade. Review the grade and summary endpoints to understand encryption strength and compatibility posture.</div>
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
          onClick={inspectTls}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'ANALYZING…' : 'ANALYZE'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {result ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Host</div>
              <div className="mt-1 font-mono text-xs text-white">{result.host}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Overall Grade</div>
              <div className="mt-1 font-mono text-xs text-white">{result.grade}</div>
            </div>
            <div className="border border-slate-800 bg-slate-950/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Status</div>
              <div className="mt-1 font-mono text-xs text-white">{result.status}</div>
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Endpoint Summary</div>
            <div className="space-y-2 text-xs text-slate-200">
              {result.endpoints.map((endpoint) => (
                <div key={`${endpoint.ip}-${endpoint.grade}`} className="border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono">
                  <div className="flex flex-wrap gap-3">
                    <span className="text-cyan-300">{endpoint.ip}</span>
                    <span className="text-white">Grade {endpoint.grade}</span>
                    <span>{endpoint.status}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">Protocols: {endpoint.protocols}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
