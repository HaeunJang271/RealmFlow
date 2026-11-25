export type Mode = 'qeval' | 'm_call'
export type Step = { id: string; name: string; mode: Mode; realm: string; func: string; args: string[]; types: string[]; expected: string; status: 'idle' | 'running' | 'passed' | 'failed'; output: string; latency?: number; resolvedArgs?: string[] }
export type Scenario = { title: string; realm: string; steps: Step[] }
export const id = () => Math.random().toString(36).slice(2, 10)
export function encode(value: unknown) { const bytes = new TextEncoder().encode(JSON.stringify(value)); let binary = ''; bytes.forEach(byte => { binary += String.fromCharCode(byte) }); return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }
export function decodeScenario(encoded: string): Scenario {
  const bytes = Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
  const data: unknown = JSON.parse(new TextDecoder().decode(bytes))
  if (!data || typeof data !== 'object') throw new Error('Invalid scenario payload')
  const scenario = data as Scenario
  if (typeof scenario.title !== 'string' || typeof scenario.realm !== 'string' || !Array.isArray(scenario.steps) || !scenario.steps.every(s => s && typeof s.name === 'string' && typeof s.realm === 'string' && typeof s.func === 'string' && (s.mode === 'qeval' || s.mode === 'm_call') && Array.isArray(s.args) && s.args.every(a => typeof a === 'string') && Array.isArray(s.types) && s.types.every(t => typeof t === 'string') && typeof s.expected === 'string')) throw new Error('Invalid scenario payload')
  return { title: scenario.title, realm: scenario.realm, steps: scenario.steps.map(s => ({ ...s, id: id(), status: 'idle', output: '', latency: undefined, resolvedArgs: undefined })) }
}
export function parseOutput(output: string): string {
  const text = output.trim()
  const typed = text.match(/^\(("(?:\\.|[^"\\])*"|[^\s()]+)\s+[^()]+\)$/s)
  const value = typed ? typed[1] : text
  if (value.startsWith('"') && value.endsWith('"')) { try { return JSON.parse(value) as string } catch { return value } }
  return value
}
export function resolveArgs(args: string[], outputs: string[]): string[] {
  return args.map(arg => arg.replace(/\{\{step(\d+)\.output\}\}/g, (_match, number: string) => { const index = Number(number) - 1; if (index < 0 || index >= outputs.length) throw new Error(`Step ${number} output is unavailable. Only earlier successful steps can be referenced.`); return parseOutput(outputs[index]) }))
}
export function expression(step: Step) { return `${step.func}(${step.args.map((arg, i) => /^(u?int|float)/i.test(step.types[i] || '') || step.types[i] === 'bool' ? arg : /^(address|\.uverse\.address)$/.test(step.types[i] || '') ? `address(${JSON.stringify(arg)})` : JSON.stringify(arg)).join(', ')})` }
const quote = (s: string) => `'${s.replace(/'/g, "'\\''")}'`
export function cliCommand(step: Step, rpc: string, chainId: string, key: string): string {
  if (step.mode === 'qeval') return `gnokey query vm/qeval -data ${quote(`${step.realm}.${expression(step)}`)} -remote ${quote(rpc)}`
  return `gnokey maketx call -pkgpath ${quote(step.realm)} -func ${quote(step.func)}${step.args.map(a => ` -args ${quote(a)}`).join('')} -gas-fee 2000ugnot -gas-wanted 3000000 -chainid ${quote(chainId)} -remote ${quote(rpc)} -broadcast ${quote(key)}`
}
