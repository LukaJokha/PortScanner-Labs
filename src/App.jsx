import { useMemo, useState } from 'react'
import IpLookupTool from './components/IpLookupTool.jsx'
import DnsInspectorTool from './components/DnsInspectorTool.jsx'
import HttpProbeTool from './components/HttpProbeTool.jsx'
import ReverseDnsTool from './components/ReverseDnsTool.jsx'
import SubdomainDiscoveryTool from './components/SubdomainDiscoveryTool.jsx'
import SslLabsTool from './components/SslLabsTool.jsx'
import SecurityHeadersTool from './components/SecurityHeadersTool.jsx'
import TraceRouteTool from './components/TraceRouteTool.jsx'
import CorsScannerTool from './components/CorsScannerTool.jsx'
import WhoisTool from './components/WhoisTool.jsx'
import CipherTool from './components/CipherTool.jsx'

const toolRegistry = [
  { id: 'ip', label: 'IP / ASN', icon: '◈', description: 'Resolve identity, geography, and routing metadata for a target.', status: 'Live', component: IpLookupTool },
  { id: 'dns', label: 'DNS Records', icon: '◎', description: 'Inspect standard A, AAAA, MX, TXT, and NS responses from public DNS-over-HTTPS.', status: 'Stable', component: DnsInspectorTool },
  { id: 'http', label: 'HTTP Probe', icon: '⌁', description: 'Check real-time status, timing, and response headers for a public endpoint.', status: 'Live', component: HttpProbeTool },
  { id: 'trace', label: 'Traceroute', icon: '↗', description: 'Model hop-by-hop route visibility and latency distribution for a target.', status: 'Live', component: TraceRouteTool },
  { id: 'cors', label: 'CORS Scanner', icon: '⎈', description: 'Measure policy posture, origin exposure, and security header posture.', status: 'Policy', component: CorsScannerTool },
  { id: 'whois', label: 'WHOIS', icon: '◌', description: 'Surface registrar metadata, domain lifecycle, and change history insights.', status: 'RDAP', component: WhoisTool },
  { id: 'cipher', label: 'TLS / Cipher', icon: '△', description: 'Review TLS posture, protocol support, and cryptographic strength.', status: 'Secure', component: CipherTool },
  { id: 'ptr', label: 'PTR Audit', icon: '⌘', description: 'Inspect reverse DNS and associated hostname mapping metadata.', status: 'Resolved', component: ReverseDnsTool },
  { id: 'subdomain', label: 'Subdomain Discovery', icon: '☰', description: 'Discover certificate-discovered names for an enterprise domain.', status: 'CT', component: SubdomainDiscoveryTool },
  { id: 'tls', label: 'TLS Posture', icon: '▣', description: 'Evaluate overall certificate and endpoint security posture.', status: 'Grade A', component: SslLabsTool },
  { id: 'headers', label: 'Security Headers', icon: '▤', description: 'Audit the most critical security response headers and policy presence.', status: 'Audit', component: SecurityHeadersTool },
]

const toolGuidance = {
  ip: {
    source: 'Public IP metadata endpoint',
    input: 'Hostname or IPv4 address',
    output: 'IP, ASN, provider, geography, timezone',
    interpretation: 'Use the resolved identity to validate ownership and routing context.',
  },
  dns: {
    source: 'Cloudflare DNS-over-HTTPS',
    input: 'Domain name',
    output: 'A / AAAA / MX / TXT / NS values',
    interpretation: 'Look for record presence, missing records, and unexpected public publication.',
  },
  http: {
    source: 'Direct browser-side fetch',
    input: 'Absolute URL',
    output: 'HTTP status, response latency, headers',
    interpretation: 'Green 2xx indicates a healthy response path; 4xx/5xx reveals reachability or policy issues.',
  },
  trace: {
    source: 'Public traceroute endpoint',
    input: 'Hostname',
    output: 'Hop list and latency markers',
    interpretation: 'Compare hop timing to identify packet loss or route instability.',
  },
  cors: {
    source: 'Origin policy inspection',
    input: 'Origin URL',
    output: 'CORS headers and cross-origin posture',
    interpretation: 'Review allowed origins and wildcard exposure for unintended browser access.',
  },
  whois: {
    source: 'RDAP registry lookup',
    input: 'Domain name',
    output: 'Registrar, status, lifecycle events',
    interpretation: 'Use registrar and event data to confirm domain ownership and registration posture.',
  },
  cipher: {
    source: 'SSL Labs public analysis feed',
    input: 'Hostname',
    output: 'Grade, protocols, endpoint summary',
    interpretation: 'Focus on grade changes and endpoint compatibility for TLS risk review.',
  },
  ptr: {
    source: 'Google DNS-over-HTTPS PTR lookup',
    input: 'IPv4 address or hostname',
    output: 'Reverse hostname mapping',
    interpretation: 'Verify that reverse hostname ownership aligns with expected network identity.',
  },
  subdomain: {
    source: 'Certificate transparency issuance feed',
    input: 'Domain name',
    output: 'Observed DNS names from public cert records',
    interpretation: 'Validate whether the domain has broader public exposure than expected.',
  },
  tls: {
    source: 'SSL Labs public analysis feed',
    input: 'Hostname',
    output: 'TLS grade and certificate posture',
    interpretation: 'Treat lower grades and protocol drift as upgrade or hardening priorities.',
  },
  headers: {
    source: 'Browser-side response inspection',
    input: 'Absolute URL',
    output: 'Security header presence and policy gaps',
    interpretation: 'Missing HSTS, CSP, or framing policies should be reviewed as security policy gaps.',
  },
}

function App() {
  const year = useMemo(() => new Date().getFullYear(), [])
  const [activeTool, setActiveTool] = useState('ip')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const active = toolRegistry.find((tool) => tool.id === activeTool) || toolRegistry[0]
  const ActiveComponent = active.component

  return (
    <div className="min-h-screen flex flex-col text-slate-200">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[2200px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center border border-slate-700 bg-slate-900/80 text-cyan-300 transition hover:border-cyan-400 lg:hidden"
              aria-label="Toggle command surface"
            >
              ☰
            </button>
            <div className="flex h-9 w-9 items-center justify-center border border-cyan-400/30 bg-cyan-500/10 text-sm font-semibold text-cyan-300">
              AS
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.16em] text-white">AURORASCAN</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Enterprise diagnostics</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex-1 max-w-[2200px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid border border-slate-800 bg-slate-950/70 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} border-b border-slate-800 p-4 lg:block lg:border-b-0 lg:border-r`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">COMMAND SURFACE</div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center border border-slate-700 bg-slate-900/80 text-slate-300 lg:hidden"
                aria-label="Close command surface"
              >
                ×
              </button>
            </div>
            <div className="mt-4 space-y-1">
              {toolRegistry.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setActiveTool(tool.id)
                    setSidebarOpen(false)
                  }}
                  className={`group flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2 text-left transition ${
                    activeTool === tool.id
                      ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300'
                      : 'text-slate-300 hover:border-slate-700 hover:bg-slate-900/70 hover:text-white'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center border border-slate-700 bg-slate-900/80 text-xs text-cyan-300 transition group-hover:border-cyan-400">{tool.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{tool.label}</span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-[0.18em] text-slate-500">{tool.status}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div id="workspace" className="min-w-0">
            <section className="border-b border-slate-800 p-4 md:p-5">
              <div className="rounded-md border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">ACTIVE WORKSPACE</div>
                    <div className="mt-1 text-lg font-semibold text-white">{active.label}</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald-300">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300"></span>
                    {active.status}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-slate-800 pb-4 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  <span>Last scan: 06:42 UTC</span>
                  <span>•</span>
                  <span>Queue depth: 12</span>
                  <span>•</span>
                  <span>Latency: 148 ms</span>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-300">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Workspace focus</div>
                    <div className="mt-1 font-mono text-xs text-white">{active.label}</div>
                  </div>
                  <div className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-300">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Operational mode</div>
                    <div className="mt-1 font-mono text-xs text-white">Client-side public API inspection</div>
                  </div>
                </div>

                <div className="mb-4 grid gap-3 xl:grid-cols-2">
                  <div className="rounded-md border border-slate-800 bg-slate-950/60 p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Workspace brief</div>
                    <div className="mt-3 text-sm text-white">{active.description}</div>
                    <div className="mt-3 text-xs leading-6 text-slate-300">
                      <div><span className="text-slate-500">Source:</span> {toolGuidance[active.id]?.source}</div>
                      <div><span className="text-slate-500">Target input:</span> {toolGuidance[active.id]?.input}</div>
                      <div><span className="text-slate-500">Output:</span> {toolGuidance[active.id]?.output}</div>
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-800 bg-slate-950/60 p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Interpretation guidance</div>
                    <div className="mt-3 text-xs leading-6 text-slate-300">{toolGuidance[active.id]?.interpretation}</div>
                    <div className="mt-3 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono text-[11px] text-slate-200">
                      Use the tool to validate public exposure, routing posture, handshake quality, and policy presence before escalating to a wider incident review.
                    </div>
                  </div>
                </div>

                <ActiveComponent />
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer id="footer" className="sticky bottom-0 z-20 border-t border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto grid max-w-[2200px] gap-6 px-4 py-5 text-[11px] uppercase tracking-[0.24em] text-slate-400 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div className="space-y-2">
            <div className="text-[10px] text-slate-500">AuroraScan</div>
            <div className="text-sm font-semibold tracking-[0.16em] text-white">Enterprise infrastructure diagnostics</div>
            <div className="text-[10px] text-slate-500">© {year} AuroraScan. Client-side security tooling for public network posture review.</div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] text-cyan-300">Official inquiries</div>
            <a href="mailto:lukadadu@gmail.com" className="block text-sm text-slate-200 transition hover:text-cyan-300">lukadadu@gmail.com</a>
            <div className="text-[10px] text-slate-500">Response window: business hours</div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] text-cyan-300">Professional profiles</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-start">
              <a href="https://github.com/LukaJokha" target="_blank" rel="noreferrer" className="text-sm text-slate-200 transition hover:text-cyan-300">GitHub</a>
              <a href="https://www.linkedin.com/in/lukajokhadze/" target="_blank" rel="noreferrer" className="text-sm text-slate-200 transition hover:text-cyan-300">LinkedIn</a>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300"></span>
              Status: live
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
