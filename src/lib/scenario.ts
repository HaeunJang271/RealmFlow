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
export const gnoPackageName = (realm: string) => realm.split('/').pop()?.replace(/[^a-zA-Z0-9_]/g, '_') || 'realm'
export function exportGnoTest(scenario: Scenario): string {
  const expected = scenario.steps.some(s => s.expected.trim())
  const refs = scenario.steps.some(s => s.args.some((a, i) => /\{\{step\d+\.output\}\}/.test(a) && (!/^\{\{step\d+\.output\}\}$/.test(a) || (s.types[i] || 'string') === 'string')))
  const imports = ['testing', ...(expected || refs ? ['fmt'] : []), ...(expected ? ['strings'] : [])]
  const name = scenario.title.split(/[^a-zA-Z0-9]+/).filter(Boolean).map(s => s[0].toUpperCase() + s.slice(1)).join('') || 'Scenario'
  const lines = [`package ${gnoPackageName(scenario.realm)}`, '', 'import (', ...imports.map(i => `\t"${i}"`), ')', '', `func Test${name}(t *testing.T) {`]
  if (scenario.steps.some(s => s.mode === 'm_call')) lines.push('\t// State-changing calls need a realm context. Adapt to your Gno version:', '\t// import "std" and use testing.SetRealm(testing.NewUserRealm(std.Address("g1...")))', '\t// Define cross for your realm before using it below.')
  scenario.steps.forEach((step, index) => {
    if (step.realm !== scenario.realm) lines.push(`\t// TODO: ${step.func} belongs to ${step.realm}; import and qualify it for this package.`)
    const args = step.args.map((arg, i) => {
      const type = step.types[i] || 'string'
      const exact = arg.match(/^\{\{step(\d+)\.output\}\}$/)
      if (exact) return type === 'string' ? `fmt.Sprint(step${exact[1]}Out)` : `step${exact[1]}Out`
      const pieces = arg.split(/(\{\{step\d+\.output\}\})/g).filter(Boolean)
      if (pieces.length > 1 || /\{\{step\d+\.output\}\}/.test(arg)) return pieces.map(p => { const ref = p.match(/^\{\{step(\d+)\.output\}\}$/); return ref ? `fmt.Sprint(step${ref[1]}Out)` : JSON.stringify(p) }).join(' + ')
      if (/^(u?int|float)/i.test(type) || type === 'bool') return arg || (type === 'bool' ? 'false' : '0')
      if (/^(address|\.uverse\.address)$/.test(type)) return `address(${JSON.stringify(arg)})`
      return JSON.stringify(arg)
    })
    const n = index + 1
    if (step.mode === 'm_call') lines.push('\t// State-changing call (cross)')
    lines.push(`\tstep${n}Out := ${step.func}(${[...(step.mode === 'm_call' ? ['cross'] : []), ...args].join(', ')})`)
    if (step.expected.trim()) lines.push(`\tif !strings.Contains(fmt.Sprint(step${n}Out), ${JSON.stringify(step.expected)}) {`, `\t\tt.Fatalf("step ${n} failed: got %v", step${n}Out)`, '\t}')
    else lines.push(`\t_ = step${n}Out`)
  })
  lines.push('}', '')
  return lines.join('\n')
}
