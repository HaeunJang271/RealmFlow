import { useEffect, useState } from 'react'
import { Copy, RefreshCw } from 'lucide-react'
import { queryFile } from './lib/gno/rpcClient'

function highlight(source: string) {
  const token = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|`[^`]*`|\b(?:package|import|func|return|var|const|type|struct|interface|if|else|for|range|switch|case|break|continue|map|true|false|nil)\b|\b\d+\b)/g
  return source.split(token).map((part, i) => <span key={i} className={/^\/\//.test(part) || /^\/\*/.test(part) ? 'syntax-comment' : /^['"`]/.test(part) ? 'syntax-string' : /^\d+$/.test(part) ? 'syntax-number' : /^(package|import|func|return|var|const|type|struct|interface|if|else|for|range|switch|case|break|continue|map|true|false|nil)$/.test(part) ? 'syntax-keyword' : undefined}>{part}</span>)
}
export default function SourceView({ rpc, realm, demo, notify }: { rpc: string; realm: string; demo: boolean; notify: (s: string) => void }) {
  const [files, setFiles] = useState<string[]>([]); const [file, setFile] = useState(''); const [source, setSource] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function list() {
    setLoading(true); setError(''); setFiles([]); setFile(''); setSource('')
    try { if (demo) throw new Error('Source files are available in live mode. Turn off Demo Mode to query the network.'); const result = await queryFile(rpc, realm); const names = result.split(/\r?\n/).map(s => s.trim()).filter(s => /^[\w.-]+\.gno$/.test(s)); setFiles(names); if (names.length) setFile(names.find(n => !n.endsWith('_test.gno')) || names[0]); else setError('No .gno source files were returned.') } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { void list() }, [rpc, realm, demo])
  useEffect(() => { if (!file) return; let current = true; setLoading(true); setSource(''); setError(''); queryFile(rpc, `${realm}/${file}`).then(text => { if (current) setSource(text) }).catch(e => { if (current) setError(e instanceof Error ? e.message : String(e)) }).finally(() => { if (current) setLoading(false) }); return () => { current = false } }, [file, realm, rpc])
  return <div className="output-content"><div className="output-heading"><span>REALM SOURCE</span><button className="text-button" onClick={list}><RefreshCw size={13}/> Refresh</button></div>{files.length > 0 && <div className="source-toolbar"><select aria-label="Source file" value={file} onChange={e => setFile(e.target.value)}>{files.map(f => <option key={f}>{f}</option>)}</select><button className="text-button" onClick={async () => { try { await navigator.clipboard.writeText(source); notify('Source copied to clipboard') } catch { notify('Unable to copy source') } }}><Copy size={13}/> Copy</button></div>}{loading && <p className="source-message">Loading source…</p>}{error && <p className="source-message">{error}</p>}{source && <pre className="source-code"><code>{highlight(source)}</code></pre>}</div>
}
