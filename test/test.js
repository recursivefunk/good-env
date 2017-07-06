'use strict'

require('dotenv').config({ path: 'test/test.env' })

const test = require('ava')
const env = require('../index')

test('it fetches existing env', (t) => {
  const result = env.get('FOO')
  t.is(result, 'bar')
})

test('it checks existence', (t) => {
  let result = env.ok('FOO')
  t.is(result, true)
  result = env.ok('NOPE')
  t.is(result, false)
})

test('it checks existence of every item', (t) => {
  // 'FOO' and 'BANG' both exist - expect true
  let result = env.ok('FOO', 'BANG')
  t.is(result, true)
  result = null
  // 'BEEZ' does not exist - expect false
  result = env.ok('BEEZ', 'FOO')
  t.is(result, false)
})

test('it returns the keys which do not exist', (t) => {
  let result = env.whichNotOk('FOO', 'BANG', 'BEEZ', 'FRANK')
  t.truthy(result.BEEZ)
  t.truthy(result.FRANK)
  t.falsy(result.FOO)
  t.falsy(result.BANG)
})

test('it gets all items', (t) => {
  let result = env.getAll(['FOO', 'BANG'])
  t.is(result.FOO, 'bar')
  t.is(result.BANG, 'boop')
  t.throws(() => env.getAll('nope'), 'Invalid arg nope')

  result = env.getAll({ FOO: null, BAR: 'boop', BZZ: 'bang' })
  t.is(result.FOO, 'bar')
  t.is(result.BAR, 'boop')
  t.is(result.BZZ, 'bang')
})

test('it returns default val for non-existing env', (t) => {
  const result = env.get('BANG', 'boop')
  t.is(result, 'boop')
})

test('it tries multiple keys in order', (t) => {
  let result = env.get('BOOZ')
  // ensure first that BOOZ is not an environment variable
  t.falsy(result)
  // ensure we recognize the last item in the array as the existing env var
  result = env.get(['BOOZ', 'FOO'])
  t.is(result, 'bar')
  result = null
  // ensure we recognize the first item in the array as the existing env var
  result = env.get(['FOO', 'BOOZ'])
  t.is(result, 'bar')
  result = null
  // ensure we recognize a middle item in the array as the existing env var
  result = env.get(['BOOZ', 'FOO', 'ZAP'])
  t.is(result, 'bar')
  result = null
  result = env.get(['BOOZ', 'ZOOP'])
  // ensure a falsy result for no existing env vars
  t.falsy(result)
})

test('it breaks for invalid keys', (t) => {
  t.throws(() => {
    env.get({ foo: 'bar' })
  }, 'Invalid key(s) [object Object]')
})

test('returns integers', (t) => {
  let result = env.getInt('INT_NUM')
  t.is(result, 10)
  result = null
  result = env.int('INT_NUM')
  t.is(result, 10)
  result = null
  result = env.int(['INTT', 'INT_NUM'])
  t.is(result, 10)
  result = null
  result = env.int(['INTT', 'INT_NUM', 'INNTT'])
  t.is(result, 10)
})

test('returns undefined for non-existing number', (t) => {
  const result = env.getInt('INT_NOT_HERE')
  t.is(undefined, result)
})

test('returns undefined for existing non-number', (t) => {
  const result = env.getInt('FOO')
  t.is(undefined, result)
})

test('returns a list of values', (t) => {
  let result = env.getList('MY_LIST')
  t.is(result.length, 3)
  t.is(result[0], 'foo')
  // test shortcut
  result = null
  result = env.list('MY_LIST')
  t.is(result.length, 3)
  t.is(result[0], 'foo')
})

test('returns empty list for non-existy', (t) => {
  let result = env.getList('MY_LIST_NOT_HERE')
  t.is(result.length, 0)
})

test('parses int list', (t) => {
  let result = env.getList('MY_INT_LIST', { cast: 'int' })
  result.forEach((i) => t.is(isInt(i), true))
})

test('parses float list', (t) => {
  let result = env.getList('MY_FLOAT_LIST', { cast: 'float' })
  result.forEach((i) => t.is(isFloat(i), true))
})

test('returns true for true', (t) => {
  let result = env.getBool('MY_TRUE_KEY')
  t.is(result, true)
  result = env.getBool('MY_UPPER_TRUE_KEY')
  t.is(result, true)
  result = null
  // Test shortcut version
  result = env.bool('MY_UPPER_TRUE_KEY')
  t.is(result, true)
})

test('returns false for false', (t) => {
  let result = env.getBool('MY_FALSE_KEY')
  t.is(result, false)
  result = env.getBool('MY_UPPER_FALSE_KEY')
  t.is(result, false)
})

test('returns default bool:true', (t) => {
  let result = env.getBool('BOOL_NOT_SET', true)
  t.is(result, true)
  result = env.getBool('BOOL_NOT_SET', false)
  t.is(result, false)
  result = env.getBool('BOOL_NOT_SET')
  t.is(result, false)
})

test('parses values with leading whitespace', (t) => {
  let result = env.get('LEADING_WHITESPACE')
  t.is(result, 'val')
})

test('parses values with trailing whitespace', (t) => {
  let result = env.get('TRAILING_WHITESPACE')
  t.is(result, 'val')
})

function isInt (i) {
  return Number(i) === i && i % 1 === 0
}

function isFloat (i) {
  return Number(i) === i && i % 1 !== 0
}
