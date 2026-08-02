import { useState } from 'react'

const isIPv4 = (value) => /^\d{1,3}(\.\d{1,3}){3}$/.test(value)

export default function ReverseDnsTool() {
  const [query, setQuery] = useState('8.8.8.8')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const inspectReverseDns = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setError('Please enter an IPv4 address or hostname.')
      return
    }

    setLoading(true)
    setError('')

    try {
      let targetIp = cleanQuery

      if (!isIPv4(cleanQuery)) {
        const hostResponse = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanQuery)}&type=A`)
        if (!hostResponse.ok) {
          throw new Error('Hostname resolution failed.')
        }
        const hostData = await hostResponse.json()
        const ipAnswers = hostData.Answer || []
        const firstAddress = ipAnswers.find((entry) => entry.type === 1)?.data
        if (!firstAddress) {
          throw new Error('No A record returned for the hostname.')
        }
        targetIp = firstAddress
      }

      const ptrName = `${targetIp.split('.').reverse().join('.')}.in-addr.arpa`
      const ptrResponse = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(ptrName)}&type=PTR`)
      if (!ptrResponse.ok) {
        throw new Error('Reverse DNS query failed.')
      }

      const ptrData = await ptrResponse.json()
      const ptrAnswers = (ptrData.Answer || []).map((item) => item.data)

      setResult({
        target: cleanQuery,
        resolvedIp: targetIp,
        ptrRecords: ptrAnswers.length ? ptrAnswers : ['No PTR record returned'],
      })
    } catch (lookupError) {
      setError(lookupError.message || 'Reverse DNS inspection failed.')
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
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">REVERSE DNS / PTR INSPECTOR</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">google DoH</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">The PTR audit inspects reverse DNS by resolving an IPv4 address into its in-addr.arpa zone and retrieving the associated hostname records using Google DNS-over-HTTPS. The resulting PTR chain helps validate ownership and infrastructure mapping.</div>
        </div>
      ) : null}

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="8.8.8.8 or example.com"
          className="border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none transition focus:border-cyan-400"
        />
        <button
          onClick={inspectReverseDns}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'RESOLVING…' : 'INSPECT'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {result ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="border border-slate-800 bg-slate-950/60 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Target</div>
            <div className="mt-1 font-mono text-xs text-white">{result.target}</div>
          </div>
          <div className="border border-slate-800 bg-slate-950/60 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Resolved IP</div>
            <div className="mt-1 font-mono text-xs text-white">{result.resolvedIp}</div>
          </div>
          <div className="border border-slate-800 bg-slate-950/60 p-3 sm:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">PTR Records</div>
            <div className="mt-2 space-y-2 text-xs text-slate-200">
              {result.ptrRecords.map((item) => (
                <div key={item} className="border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono">{item}</div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
