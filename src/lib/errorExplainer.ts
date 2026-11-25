export type Explanation = { cause: string; issue: string; fix: string; action?: 'demo' | 'wallet' | 'realm' }
export function explainError(error: string): Explanation {
  const s = error.toLowerCase()
  if (/adena.*(not found|install)/.test(s)) return { cause: 'Adena is not available in this browser.', issue: 'State-changing calls need a connected wallet.', fix: 'Switch to Demo Mode to simulate the call.', action: 'demo' }
  if (/type mismatch|cannot convert|invalid.*(int|type)/.test(s)) return { cause: 'An argument has the wrong type.', issue: 'The value does not match the function signature.', fix: 'Check the parameter types and update the input.' }
  if (/insufficient|not enough coins/.test(s)) return { cause: 'The wallet has insufficient funds.', issue: 'The transaction needs coins for its fee or send amount.', fix: 'Fund your wallet, then try again.', action: 'wallet' }
  if (/unknown package|package.*not found|invalid package/.test(s)) return { cause: 'The realm could not be found.', issue: 'The package path may be incorrect or not deployed on this network.', fix: 'Load the sample boards realm.', action: 'realm' }
  if (/unauthorized|permission denied/.test(s)) return { cause: 'This caller is not authorized.', issue: 'The realm rejected the connected address.', fix: 'Connect an authorized wallet and retry.', action: 'wallet' }
  if (/out of gas|gas exhausted/.test(s)) return { cause: 'The call ran out of gas.', issue: 'Execution exceeded the transaction gas limit.', fix: 'Simplify the call or increase the gas limit in the wallet.' }
  if (/argument count|number of arguments|too many arguments|not enough arguments/.test(s)) return { cause: 'The function received the wrong number of arguments.', issue: 'The inputs do not match its signature.', fix: 'Reload the realm and check every parameter.', action: 'realm' }
  return { cause: 'The request could not be completed.', issue: error || 'No additional error details were returned.', fix: 'Check the endpoint, realm path, and inputs, or try Demo Mode.', action: 'demo' }
}
