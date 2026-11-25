import { useEffect, useState } from 'react'
import { X, Download, RefreshCw } from 'lucide-react'
import { BLOG, DAO, REGISTRY, queryEval } from './lib/gno/rpcClient'
import { decodeScenario, id, parseOutput, type Scenario, type Step } from './lib/scenario'

function sample(title: string, realm: string, func: string, args: string[], expected = ''): Scenario {
  const step: Step = { id: id(), name: title, mode: 'qeval', realm, func, args, types: args.map(() => 'string'), expected, status: 'idle', output: '' }
  return { title, realm, steps: [step] }
}
const examples = [sample('Blog Read / Check', BLOG, 'Render', [''], 'blog'), sample('GovDAO Proposal Check', DAO, 'Render', ['']), sample('RealmFlow Registry Check', REGISTRY, 'GetScenarioCount', [])]
type Entry = { title: string; realm: string; scenario: Scenario; author?: string }

export default function Community({ demo, rpc, registry, onClose, onLoad }: { demo: boolean; rpc: string; registry: string; onClose: () => void; onLoad: (s: Scenario) => void }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [skipped, setSkipped] = useState(0)
  async function load() {
    setLoading(true); setError(''); setSkipped(0)
    try {
      if (demo) { setEntries(examples.map(scenario => ({ title: scenario.title, realm: scenario.realm, scenario }))); return }
      const countText = parseOutput(await queryEval(rpc, registry, 'GetScenarioCount()'))
      if (!/^\d+$/.test(countText)) throw new Error('Registry returned an invalid scenario count')
      const count = Number(countText)
      if (!Number.isSafeInteger(count) || count > 1000) throw new Error('Registry has too many scenarios to load at once (limit 1000)')
      const found: Entry[] = []; let invalid = 0
      for (let i = 1; i <= count; i++) {
        try {
          const record = parseOutput(await queryEval(rpc, registry, `GetScenario(${i})`))
          const parts = record.split(' | ')
          if (parts.length < 6) throw new Error('Invalid registry record')
          const payload = parts[parts.length - 2]; const scenario = decodeScenario(payload)
          found.push({ title: parts.slice(2, -3).join(' | '), author: parts[1], realm: parts[parts.length - 3], scenario })
        } catch { invalid++ }
      }
      setEntries(found.reverse()); setSkipped(invalid)
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); setEntries([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [demo, rpc, registry])
  return <div className="modal-backdrop" onClick={onClose}><section className="community-modal" role="dialog" aria-modal="true" aria-labelledby="community-title" onClick={e => e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">EXPLORE / {demo ? 'DEMO COLLECTION' : 'ON-CHAIN REGISTRY'}</span><h2 id="community-title">Community scenarios</h2><p>{demo ? 'Try a ready-made workflow.' : registry}</p></div><button className="icon-button" onClick={onClose} aria-label="Close community scenarios"><X size={16}/></button></div><div className="community-list">{loading ? <p>Loading scenarios…</p> : error ? <div className="community-error"><strong>Could not load the registry.</strong><p>{error}</p><p>Check the registry path and network, or deploy the registry realm first.</p><button className="button secondary" onClick={load}><RefreshCw size={13}/> Retry</button></div> : entries.length ? entries.map((entry, i) => <article className="community-card" key={i}><div><strong>{entry.title}</strong><p>{entry.realm}</p><small>{entry.scenario.steps.length} step{entry.scenario.steps.length === 1 ? '' : 's'}{entry.author ? ` · ${entry.author}` : ' · RealmFlow demo'}</small></div><button className="button secondary" onClick={() => onLoad(entry.scenario)}><Download size={14}/> Load</button></article>) : <p>No scenarios have been published yet.</p>}{skipped > 0 && <p>{skipped} malformed or unsupported scenario{skipped === 1 ? '' : 's'} could not be loaded.</p>}</div></section></div>
}
