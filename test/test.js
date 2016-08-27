
require('dotenv').config({ path: 'test/test.env' })

const test = require('tape')
const env = require('../index')

test('it fetches existing env', (t) => {
  const result = env.get('FOO')
  t.equal(result, 'bar')
  t.end()
})

test('it returns default val for non-existing env', (t) => {
  const result = env.get('BANG', 'boop')
  t.equal(result, 'boop')
  t.end()
})

test('returns integers', (t) => {
  const result = env.getInt('INT_NUM')
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

