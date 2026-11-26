import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveArgs, parseOutput, cliCommand, encode, decodeScenario, exportGnoTest, type Step } from '../src/lib/scenario.ts'
import { isRealmParam, userParams } from '../src/lib/gno/rpcClient.ts'

test('resolves typed outputs and rejects references to unavailable steps', () => {
  assert.equal(parseOutput('(42 int)'), '42')
  assert.equal(parseOutput('("hello\\nworld" string)'), 'hello\nworld')
  assert.deepEqual(resolveArgs(['id={{step1.output}}', '{{step2.output}}'], ['(42 int)', '("Gno" string)']), ['id=42', 'Gno'])
  assert.throws(() => resolveArgs(['{{step2.output}}'], ['(42 int)']), /unavailable/)
})

test('crossing realm parameters do not become user arguments', () => {
  const param = { Name: '.arg_0', Type: 'interface {.seal func(); Previous func() .uverse.realm}' }
  assert.equal(isRealmParam(param), true)
  assert.deepEqual(userParams({ FuncName: 'Call', Params: [param, { Name: 'name', Type: 'string' }], Results: [] }), [{ Name: 'name', Type: 'string' }])
})

test('scenario payload round trips and CLI safely quotes arguments', () => {
  const step: Step = { id: '1', name: 'test', mode: 'qeval', realm: 'gno.land/r/gnoland/blog', func: 'Render', args: [''], types: ['string'], expected: '', status: 'idle', output: '' }
  assert.equal(decodeScenario(encode({ title: '한글', realm: step.realm, steps: [step] })).title, '한글')
  const command = cliCommand({ ...step, mode: 'm_call', args: ["it's safe"] }, 'https://rpc.gno.land:443', 'gnoland-1', 'alice')
  assert.match(command, /-chainid 'gnoland-1'/)
  assert.ok(command.includes("'it'\\''s safe'"))
})

test('exports assertions and chained outputs as Gno code', () => {
  const base: Step = { id: '1', name: 'read', mode: 'qeval', realm: 'gno.land/r/demo/example', func: 'Get', args: [], types: [], expected: 'ok', status: 'idle', output: '' }
  const code = exportGnoTest({ title: 'sample flow', realm: base.realm, steps: [base, { ...base, id: '2', func: 'Find', args: ['id={{step1.output}}'], types: ['string'], expected: '' }] })
  assert.match(code, /func TestSampleFlow\(t \*testing.T\)/)
  assert.match(code, /strings.Contains\(fmt.Sprint\(step1Out\), "ok"\)/)
  assert.match(code, /Find\("id=" \+ fmt.Sprint\(step1Out\)\)/)
})
