type AdenaResponse = { status?: string; data?: unknown; message?: string }
type Adena = { AddEstablish: (name: string) => Promise<AdenaResponse>; GetAccount: () => Promise<AdenaResponse>; DoContract: (request: unknown) => Promise<AdenaResponse> }
declare global { interface Window { adena?: Adena } }
export type Wallet = { address: string; balance: string; chainId: string }
function unwrap(response: AdenaResponse): Record<string, unknown> { if (response.status && response.status !== 'success') throw new Error(response.message || `Adena: ${response.status}`); return (response.data || {}) as Record<string, unknown> }
export async function connectAdena(): Promise<Wallet> {
  if (!window.adena) throw new Error('Adena not found. Install the Adena wallet to connect.')
  unwrap(await window.adena.AddEstablish('RealmFlow')); const account = unwrap(await window.adena.GetAccount())
  return { address: String(account.address || ''), balance: typeof account.balance === 'string' ? account.balance : JSON.stringify(account.balance || ''), chainId: String(account.chainId || account.chain_id || '') }
}
export async function callRealmMethod({ caller, pkgPath, func, args, send = '' }: { caller: string; pkgPath: string; func: string; args: string[]; send?: string }) {
  if (!window.adena) throw new Error('Adena not found. Install the Adena wallet to make a call.')
  const result = await window.adena.DoContract({ messages: [{ type: '/vm.m_call', value: { caller, send, pkg_path: pkgPath, func, args } }], gasFee: 1, gasWanted: 3000000 })
  if (result.status && result.status !== 'success') throw new Error(result.message || JSON.stringify(result)); return result
}
