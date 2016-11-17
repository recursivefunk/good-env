
require('dotenv').config({ path: 'test/test.env' })

const test = require('tape')
const env = require('../index')

test('it fetches existing env', (t) => {
  const result = env.get('FOO')
  t.equal(result, 'bar')
  t.end()
})

test('it checks existence', (t) => {
  let result = env.ok('FOO')
  t.equal(result, true)
  result = env.ok('NOPE')
  t.equal(result, false)
  t.end()
})

test('it returns default val for non-existing env', (t) => {
  const result = env.get('BANG', 'boop')
  t.equal(result, 'boop')
  t.end()
})

test('returns integers', (t) => {
  let result = env.getInt('INT_NUM')
  t.equal(result, 10)
  result = null
  result = env.int('INT_NUM')
  t.equal(result, 10)
  t.end()
})

test('returns undefined for non-existing number', (t) => {
  const result = env.getInt('INT_NOT_HERE')
  t.equal(undefined, result)
  t.end()
})

test('returns undefined for existing non-number', (t) => {
  const result = env.getInt('FOO')
  t.equal(undefined, result)
  t.end()
})

test('returns a list of values', (t) => {
  const result = env.getList('MY_LIST')
  t.equal(result.length, 3)
  t.equal(result[0], 'foo')
  t.end()
})

test('returns empty list for non-existy', (t) => {
  let result = env.getList('MY_LIST_NOT_HERE')
  t.equal(result.length, 0)
  t.end()
})

/*
test('returns a default list of values', (t) => {
  let result = env.getList('MY_LIST_NOT_HERE', ['beep', 'boop'])
  t.equal(result.length, 2)
  t.equal(result[0], 'beep')
  result = null
  // Test shortcut version
  result = env.list('MY_LIST_NOT_HERE', ['beep', 'boop'])
  t.equal(result.length, 2)
  t.equal(result[0], 'beep')
  t.end()
})
*/
test('parses int list', (t) => {
  let result = env.getList('MY_INT_LIST', { cast: 'int' })
  result.forEach((i) => t.equal(isInt(i), true))
  t.end()
})

test('parses float list', (t) => {
  let result = env.getList('MY_FLOAT_LIST', { cast: 'float' })
  result.forEach((i) => t.equal(isFloat(i), true))
  t.end()
})

test('returns true for true', (t) => {
  let result = env.getBool('MY_TRUE_KEY')
  t.equal(result, true)
  result = env.getBool('MY_UPPER_TRUE_KEY')
  t.equal(result, true)
  result = null
  // Test shortcut version
  result = env.bool('MY_UPPER_TRUE_KEY')
  t.equal(result, true)
  t.end()
})

test('returns false for false', (t) => {
  let result = env.getBool('MY_FALSE_KEY')
  t.equal(result, false)
  result = env.getBool('MY_UPPER_FALSE_KEY')
  t.equal(result, false)
  t.end()
})

test('parses values with leading whitespace', (t) => {
  let result = env.get('LEADING_WHITESPACE')
  t.equal(result, 'val')
  t.end()
})

test('parses values with trailing whitespace', (t) => {
  let result = env.get('TRAILING_WHITESPACE')
  t.equal(result, 'val')
  t.end()
})


function isInt(i) {
  return Number(i) === i && i % 1 === 0
}

function isFloat(i) {
  return Number(i) === i && i % 1 !== 0
}
