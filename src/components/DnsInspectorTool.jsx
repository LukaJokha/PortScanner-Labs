import { useState } from 'react'

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS']

const doHUrl = (domain, type) =>
  `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`

export default function DnsInspectorTool() {
  const [query, setQuery] = useState('example.com')
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const inspectDns = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setError('Please enter a domain name.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const batch = await Promise.all(
        RECORD_TYPES.map(async (type) => {
          const response = await fetch(doHUrl(cleanQuery, type), {
            headers: {
              accept: 'application/dns-json',
            },
          })
          if (!response.ok) {
            throw new Error(`DNS lookup failed for ${type}`)
          }

          const data = await response.json()
          const answerRecords = data.Answer || []

          return {
            type,
            records: answerRecords.map((item) => item.data).filter(Boolean),
          }
        }),
      )

      setRecords(batch)
    } catch (dnsError) {
      setError(dnsError.message || 'Unable to fetch DNS records.')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300">tool 02</div>
          <h2 className="mt-1 font-mono text-sm font-semibold text-white">DNS RECORD INSPECTOR</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className="border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            {showInfo ? 'Hide info' : 'Info'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">DoH / cloudflare</span>
        </div>
      </div>

      {showInfo ? (
        <div className="mb-3 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs leading-6 text-slate-300">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">How it works</div>
          <div className="mt-2">The DNS inspector executes browser-safe Cloudflare DNS-over-HTTPS lookups for A, AAAA, MX, TXT, and NS records. Review the returned record values in a structured table to verify publication and routing posture.</div>
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
          onClick={inspectDns}
          disabled={loading}
          className="border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'QUERYING…' : 'INSPECT'}
        </button>
      </div>

      {error ? <div className="mt-3 border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-200">{error}</div> : null}

      {records.length > 0 ? (
        <div className="mt-3 overflow-hidden border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
            <thead className="bg-slate-950 text-slate-300">
              <tr>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em]">Record Type</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em]">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {records.map((entry) => (
                <tr key={entry.type}>
                  <td className="px-3 py-2 font-mono text-cyan-300">{entry.type}</td>
                  <td className="px-3 py-2 font-mono text-slate-200">
                    {entry.records.length ? entry.records.join(', ') : 'No records returned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
