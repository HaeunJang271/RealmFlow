import { useEffect, useState } from 'react'
import { X, Download, RefreshCw } from 'lucide-react'
import { BLOG, DAO, USERS, queryEval } from './lib/gno/rpcClient'
import { callRealmMethod, type Wallet } from './lib/gno/adena'
import { decodeScenario, id, parseOutput, type Scenario, type Step } from './lib/scenario'

function sample(title: string, realm: string, func: string, args: string[], expected = ''): Scenario {
  const step: Step = { id: id(), name: title, mode: 'qeval', realm, func, args, types: args.map(() => 'string'), expected, status: 'idle', output: '' }
  return { title, realm, steps: [step] }
}
const onyxRegistry = 'gno.land/r/g1832jd5gytypzj48d0328r2sqvv2x38zj0zryuq/realmflow2'
const examples = [sample('Gno.land Blog Smoke Test', BLOG, 'Render', ['']), sample('GovDAO Governance Check', DAO, 'Render', ['']), sample('Users Registry Lookup', USERS, 'Render', ['']), sample('RealmFlow Registry Self-Check', onyxRegistry, 'GetScenarioCount', [])]
const chain = sample('Multi-Step Variable Chaining Demo', onyxRegistry, 'GetScenarioCount', [])
chain.steps.push({ ...sample('Render with step 1 output', BLOG, 'Render', ['{{step1.output}}']).steps[0] })
const presets = [...examples, chain]
type Entry = { title: string; realm: string; scenario: Scenario; author?: string; id?: number; verifyCount?: number }

export default function Community({ demo, rpc, registry, wallet, onClose, onLoad }: { demo: boolean; rpc: string; registry: string; wallet: Wallet | null; onClose: () => void; onLoad: (s: Scenario) => void }) {
  const [quickRealm, setQuickRealm] = useState('')
  const [quickError, setQuickError] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [skipped, setSkipped] = useState(0)
  const [verifyMessage, setVerifyMessage] = useState('')
  const [verifying, setVerifying] = useState<number | null>(null)
  async function verify(id: number) {
    if (!wallet?.address) { setVerifyMessage('Connect Adena before verifying a scenario.'); return }
    setVerifying(id); setVerifyMessage('')
    try {
      await callRealmMethod({ caller: wallet.address, pkgPath: registry, func: 'VerifyScenario', args: [String(id)] })
      setVerifyMessage('Verification transaction submitted. Refresh the registry after it is confirmed.')
    } catch (e) { setVerifyMessage(e instanceof Error ? e.message : String(e)) }
    finally { setVerifying(null) }
  }
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
          const verifyCount = Number(parts[parts.length - 1])
          if (!Number.isSafeInteger(verifyCount) || verifyCount < 0) throw new Error('Invalid verification count')
          found.push({ id: i, verifyCount, title: parts.slice(2, -3).join(' | '), author: parts[1], realm: parts[parts.length - 3], scenario })
        } catch { invalid++ }
      }
      setEntries(found.reverse()); setSkipped(invalid)
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); setEntries([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [demo, rpc, registry])
  return <div className="modal-backdrop" onClick={onClose}><section className="community-modal" role="dialog" aria-modal="true" aria-labelledby="community-title" onClick={e => e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">EXPLORE / {demo ? 'DEMO COLLECTION' : 'ON-CHAIN REGISTRY'}</span><h2 id="community-title">Community scenarios</h2><p>{demo ? 'Try a ready-made workflow.' : registry}</p></div><button className="icon-button" onClick={onClose} aria-label="Close community scenarios"><X size={16}/></button></div><div className="community-list"><section className="preset-section"><h3>Ecosystem &amp; Hackathon Presets</h3><p>Onyx read-only scenarios. Load a preset, then run it in the editor.</p>{presets.map(scenario => <article className="community-card" key={scenario.title}><div><strong>{scenario.title}</strong><p>{scenario.realm}</p><small>{scenario.steps.length} step{scenario.steps.length === 1 ? '' : 's'}</small></div><button className="button secondary" onClick={() => onLoad(scenario)}><Download size={14}/> Load</button></article>)}<form className="quick-realm" onSubmit={e => { e.preventDefault(); const path = quickRealm.trim(); if (!/^gno\.land\/r\/[\w.-]+(?:\/[\w.-]+)+$/.test(path)) { setQuickError('Enter a valid gno.land/r/... realm path.'); return } setQuickError(''); onLoad(sample('Quick Hackathon Realm Test', path, 'Render', [''])) }}><label htmlFor="quick-realm">Quick Hackathon Realm Tester</label><p>Load Render("") and fetch the realm's live function signatures.</p><div><input id="quick-realm" value={quickRealm} onChange={e => setQuickRealm(e.target.value)} placeholder="gno.land/r/..."/><button className="button secondary" type="submit">Load realm</button></div>{quickError && <p role="alert">{quickError}</p>}</form></section><h3>On-chain registry</h3>{verifyMessage && <p role="status">{verifyMessage}</p>}{loading ? <p>Loading scenarios…</p> : error ? <div className="community-error"><strong>Could not load the registry.</strong><p>{error}</p><p>Check the registry path and network, or deploy the registry realm first.</p><button className="button secondary" onClick={load}><RefreshCw size={13}/> Retry</button></div> : entries.length ? entries.map((entry, i) => <article className="community-card" key={i}><div><strong>{entry.title}</strong><p>{entry.realm}</p><small>{entry.scenario.steps.length} step{entry.scenario.steps.length === 1 ? '' : 's'}{entry.author ? ` · ${entry.author}` : ' · RealmFlow demo'}</small>{entry.id && <p><span className="pill green">{entry.verifyCount} verifications</span></p>}</div><div><button className="button secondary" onClick={() => onLoad(entry.scenario)}><Download size={14}/> Load</button>{entry.id && <button className="button secondary" disabled={verifying !== null} onClick={() => void verify(entry.id!)}>{verifying === entry.id ? 'Submitting…' : 'Verify On-Chain'}</button>}</div></article>) : <p>No scenarios have been published yet.</p>}{skipped > 0 && <p>{skipped} malformed or unsupported scenario{skipped === 1 ? '' : 's'} could not be loaded.</p>}</div></section></div>
}
