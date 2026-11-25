export type GnoParam = { Name: string; Type: string }
export type GnoFunc = { FuncName: string; Params: GnoParam[]; Results: GnoParam[] }
export const DEFAULT_RPC = 'https://rpc.test4.gno.land:443'
export const BOARDS = 'gno.land/r/demo/boards'
export const REGISTRY = 'gno.land/r/gnoflow/registry'
export const demos: Record<string, GnoFunc[]> = {
  [BOARDS]: [
    { FuncName: 'GetBoard', Params: [{ Name: 'name', Type: 'string' }], Results: [{ Name: '', Type: 'string' }] },
    { FuncName: 'GetPost', Params: [{ Name: 'board', Type: 'string' }, { Name: 'id', Type: 'int' }], Results: [{ Name: '', Type: 'string' }] },
    { FuncName: 'CreateBoard', Params: [{ Name: 'name', Type: 'string' }, { Name: 'description', Type: 'string' }], Results: [] },
    { FuncName: 'CreatePost', Params: [{ Name: 'board', Type: 'string' }, { Name: 'title', Type: 'string' }, { Name: 'body', Type: 'string' }], Results: [] },
  ],
  [REGISTRY]: [
    { FuncName: 'GetScenarioCount', Params: [], Results: [{ Name: '', Type: 'int' }] },
    { FuncName: 'GetScenario', Params: [{ Name: 'id', Type: 'int' }], Results: [{ Name: '', Type: 'string' }] },
    { FuncName: 'RegisterScenario', Params: [{ Name: 'title', Type: 'string' }, { Name: 'targetRealm', Type: 'string' }, { Name: 'payload', Type: 'string' }], Results: [{ Name: '', Type: 'int' }] },
  ],
}
function decode(value: string) { const bytes = Uint8Array.from(atob(value), c => c.charCodeAt(0)); return new TextDecoder().decode(bytes) }
export async function abciQuery(rpcUrl: string, path: string, data: string): Promise<string> {
  const hex = Array.from(new TextEncoder().encode(data), b => b.toString(16).padStart(2, '0')).join('')
  const response = await fetch('/api/rpc', { method: 'POST', headers: { 'content-type': 'application/json', targetRpc: rpcUrl }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'abci_query', params: { path, data: `0x${hex}` } }) })
  const json = await response.json()
  if (!response.ok || json.error) throw new Error(typeof json.error === 'string' ? json.error : json.error?.message || `RPC request failed (${response.status})`)
  const result = json.result?.response || json.result?.Response || json.result; const base = result?.ResponseBase || result
  if (Number(base?.code || base?.Code || 0) !== 0 || base?.error || base?.Error) throw new Error(String(base?.log || base?.Log || base?.error || base?.Error))
  const value = base?.Data ?? base?.data ?? result?.value ?? result?.Value
  return value ? decode(value) : ''
}
export async function fetchRealmFuncs(rpcUrl: string, pkgPath: string): Promise<GnoFunc[]> {
  const parsed = JSON.parse(await abciQuery(rpcUrl, 'vm/qfuncs', pkgPath))
  if (!Array.isArray(parsed)) throw new Error('Unexpected function list returned by RPC')
  return parsed.map(f => ({ FuncName: f.FuncName || f.func_name || f.name, Params: f.Params || f.params || [], Results: f.Results || f.results || [] })).filter(f => f.FuncName)
}
export const queryRender = (rpcUrl: string, pkgPath: string, args = '') => abciQuery(rpcUrl, 'vm/qrender', `${pkgPath}:${args}`)
export const queryEval = (rpcUrl: string, pkgPath: string, expr: string) => abciQuery(rpcUrl, 'vm/qeval', `${pkgPath}.${expr}`)
