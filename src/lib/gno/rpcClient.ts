export type GnoParam = { Name: string; Type: string }
export type GnoFunc = { FuncName: string; Params: GnoParam[]; Results: GnoParam[] }
export const DEFAULT_RPC = 'https://rpc.latest.testnets.gno.land:443'
export const MAINNET_RPC = 'https://rpc.gno.land:443'
export const BOARDS = 'gno.land/r/demo/boards'
export const BLOG = 'gno.land/r/gnoland/blog'
export const DAO = 'gno.land/r/gov/dao'
export const USERS = 'gno.land/r/sys/users'
export const REGISTRY = import.meta.env?.VITE_REGISTRY_REALM || 'gno.land/r/realmflow/registry'
export const demos: Record<string, GnoFunc[]> = {
  [BLOG]: [{ FuncName: 'Render', Params: [{ Name: 'path', Type: 'string' }], Results: [{ Name: '', Type: 'string' }] }],
  [DAO]: [{ FuncName: 'Render', Params: [{ Name: 'path', Type: 'string' }], Results: [{ Name: '', Type: 'string' }] }],
  [USERS]: [{ FuncName: 'Render', Params: [{ Name: 'path', Type: 'string' }], Results: [{ Name: '', Type: 'string' }] }],
  [BOARDS]: [
    { FuncName: 'GetBoard', Params: [{ Name: 'name', Type: 'string' }], Results: [{ Name: '', Type: 'string' }] },
    { FuncName: 'GetPost', Params: [{ Name: 'board', Type: 'string' }, { Name: 'id', Type: 'int' }], Results: [{ Name: '', Type: 'string' }] },
    { FuncName: 'CreateBoard', Params: [{ Name: 'name', Type: 'string' }, { Name: 'description', Type: 'string' }], Results: [] },
    { FuncName: 'CreatePost', Params: [{ Name: 'board', Type: 'string' }, { Name: 'title', Type: 'string' }, { Name: 'body', Type: 'string' }], Results: [] },
  ],
  [REGISTRY]: [
    { FuncName: 'GetScenarioCount', Params: [], Results: [{ Name: '', Type: 'int' }] },
    { FuncName: 'GetScenario', Params: [{ Name: 'id', Type: 'int' }], Results: [{ Name: '', Type: 'string' }] },
    { FuncName: 'VerifyScenario', Params: [{ Name: 'id', Type: 'int' }], Results: [{ Name: '', Type: 'int' }] },
    { FuncName: 'RegisterScenario', Params: [{ Name: 'title', Type: 'string' }, { Name: 'targetRealm', Type: 'string' }, { Name: 'payload', Type: 'string' }], Results: [{ Name: '', Type: 'int' }] },
  ],
}
function decode(value: string) { const bytes = Uint8Array.from(atob(value), c => c.charCodeAt(0)); return new TextDecoder().decode(bytes) }
export async function abciQuery(rpcUrl: string, path: string, data: string): Promise<string> {
  const bytes = new TextEncoder().encode(data)
  const encoded = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
  const response = await fetch('/api/rpc', { method: 'POST', headers: { 'content-type': 'application/json', targetRpc: rpcUrl }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'abci_query', params: { path, data: encoded } }) })
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
export const queryFile = (rpcUrl: string, path: string) => abciQuery(rpcUrl, 'vm/qfile', path)
export const isRealmParam = (param: GnoParam) => /\.seal\s+func\(\)|\.uverse\.realm/.test(param.Type)
export const userParams = (func: GnoFunc) => func.Params.filter(p => !isRealmParam(p))

