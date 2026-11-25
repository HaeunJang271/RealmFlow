import type { IncomingMessage, ServerResponse } from 'node:http'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
const DEFAULT_RPC = 'https://rpc.test4.gno.land:443'
const privateIp = (ip: string) => ip === '::1' || ip === '::' || ip.startsWith('::ffff:') || /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip) || /^(fc|fd|fe8|fe9|fea|feb)/i.test(ip)
export async function rpcProxy(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')
  try {
    if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'POST required' })); return }
    const params = new URL(req.url || '/', 'http://localhost').searchParams
    const target = new URL(String(req.headers.targetrpc || params.get('targetRpc') || DEFAULT_RPC))
    if (target.protocol !== 'https:' || target.username || target.password || target.hostname === 'localhost' || (isIP(target.hostname) && privateIp(target.hostname))) throw new Error('RPC endpoint must be a public HTTPS URL')
    const addresses = await lookup(target.hostname, { all: true })
    if (!addresses.length || addresses.some(a => privateIp(a.address))) throw new Error('RPC endpoint must resolve to a public address')
    let body = req.body
    if (!body) { let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 100000) throw new Error('Request too large') } body = JSON.parse(raw) }
    if ((body as { method?: string }).method !== 'abci_query') throw new Error('Only abci_query is supported')
    const upstream = await fetch(target, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(15000) })
    res.statusCode = upstream.status; res.end(await upstream.text())
  } catch (error) { res.statusCode = 502; res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'RPC proxy failed' })) }
}
export default rpcProxy
