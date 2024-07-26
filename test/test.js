require('dotenv').config({ path: 'test/test.env' });

const test = require('tape');
const env = require('../src/index');

test('it parses a valid url', (t) => {
  const result = env.getUrl('ENDPOINT');
  const { origin } = result;
  t.equals(origin, 'https://foo.com');
  t.end();
});

test('it gracefully fails to parse a non-existing url', (t) => {
  const result = env.getUrl('FAKE_ENDPOINT');
  t.notOk(result, 'URL doesn\'t exist');
  t.end();
});

test('it returns a default url', (t) => {
  const result = env.getUrl('FAKE_ENDPOINT', 'https://localhost:3000');
  const { origin } = result;
  t.equals(origin, 'https://localhost:3000');
  t.end();
});

test('shortcut works', (t) => {
  const result = env.url('ENDPOINT');
  const { origin } = result;
  t.equals(origin, 'https://foo.com');
  t.end();
});

test('it fetches existing env', (t) => {
  const result = env.get('FOO');
  t.equals(result, 'bar');
  t.end();
});

test('it checks non-existence', (t) => {
  let result = env.ok('FOO');
  t.equals(result, true);
  result = env.ok('NOPE');
  t.equals(result, false);
  t.end();
});

test('it checks existence of every item', (t) => {
  // 'FOO' and 'BANG' both exequalst - expect true
  let result = env.ok('FOO', 'BANG');
  t.equals(result, true);
  result = null;
  // 'BEEZ' does not exequalst - expect false
  result = env.ok('BEEZ', 'FOO');
  t.equals(result, false);
  t.end();
});

test('it gets all items', (t) => {
  let result = env.getAll(['FOO', 'BANG', 'BZP']);
  t.equals(result[0], 'bar');
  t.equals(result[1], 'boop');
  t.notOk(result[2], 'Nonexisting value');
  t.throws(() => env.getAll('nope'), 'Invalid arg nope');

  result = env.getAll({ FOO: null, BAR: 'boop', BZZ: 'bang' });
  t.equals(result.FOO, 'bar');
  t.equals(result.BAR, 'boop');
  t.equals(result.BZZ, 'bang');
  t.end();
});

test('it returns default val for non-exequalsting env', (t) => {
  const result = env.get('BANG', 'boop');
  t.equals(result, 'boop');
  t.end();
});

test('it tries multiple keys in order', (t) => {
  let result = env.get('BOOZ');
  // ensure first that BOOZ equals not an environment variable
  t.notOk(result);
  // ensure we recognize the last item in the array as the exequalsting env var
  result = env.get(['BOOZ', 'FOO']);
  t.equals(result, 'bar');
  result = null;
  // ensure we recognize the first item in the array as the exequalsting env var
  result = env.get(['FOO', 'BOOZ']);
  t.equals(result, 'bar');
  result = null;
  // ensure we recognize a middle item in the array as the exequalsting env var
  result = env.get(['BOOZ', 'FOO', 'ZAP']);
  t.equals(result, 'bar');
  result = null;
  result = env.get(['BOOZ', 'ZOOP']);
  // ensure a falsy result for no exequalsting env vars
  t.notOk(result);
  t.end();
});

test('ensure/assert breaks for an invalid type', (t) => {
  t.throws(() => {
    env.ensure([{}]);
  }, 'Invalid key [object Object]');
  t.throws(() => {
    env.assert([{}]);
  }, 'Invalid key [object Object]');
  t.end();
});

test('it breaks for invalid keys', (t) => {
  t.throws(() => {
    env.get({ foo: 'bar' });
  }, 'Invalid key(s) [object Object]');
  t.end();
});

test('returns integers', (t) => {
  let result = env.getNumber('INT_NUM');
  t.equals(result, 10);
  result = null;
  result = env.num('INT_NUM');
  t.equals(result, 10);
  result = null;
  result = env.num(['INTT', 'INT_NUM']);
  t.equals(result, 10);
  result = null;
  result = env.num(['INTT', 'INT_NUM', 'INNTT']);
  t.equals(result, 10);
  t.end();
});

test('returns undefined for non-exequalsting number', (t) => {
  const result = env.getNumber('INT_NOT_HERE');
  t.equals(undefined, result);
  t.end();
});

test('returns undefined for exequalsting non-number', (t) => {
  const result = env.getNumber('FOO');
  t.equals(undefined, result);
  t.end();
});

test('returns a list of values', (t) => {
  let result = env.getList('MY_LIST');
  t.equals(result.length, 3);
  t.equals(result[0], 'foo');
  // test shortcut
  result = null;
  result = env.list('MY_LIST');
  t.equals(result.length, 3);
  t.equals(result[0], 'foo');
  t.end();
});

test('returns empty lequalst for non-exequalsty', (t) => {
  const result = env.getList('MY_LIST_NOT_HERE');
  t.equals(result.length, 0);
  t.end();
});

test('parses int lequalst', (t) => {
  const result = env.getList('MY_INT_LIST', { cast: 'number' });
  result.forEach((i) => t.equals(equalsNum(i), true));
  t.end();
});

test('returns true for true', (t) => {
  let result = env.getBool('MY_TRUE_KEY');
  t.equals(result, true);
  result = env.getBool('MY_UPPER_TRUE_KEY');
  t.equals(result, true);
  result = null;
  // Test shortcut version
  result = env.bool('MY_UPPER_TRUE_KEY');
  t.equals(result, true);
  t.end();
});

test('returns false for false', (t) => {
  let result = env.getBool('MY_FALSE_KEY');
  t.equals(result, false);
  result = env.getBool('MY_UPPER_FALSE_KEY');
  t.equals(result, false);
  t.end();
});

test('returns default bool:true', (t) => {
  let result = env.getBool('BOOL_NOT_SET', true);
  t.equals(result, true);
  result = env.getBool('BOOL_NOT_SET', false);
  t.equals(result, false);
  result = env.getBool('BOOL_NOT_SET');
  t.equals(result, false);
  t.end();
});

test('parses values with leading whitespace', (t) => {
  const result = env.get('LEADING_WHITESPACE');
  t.equals(result, 'val');
  t.end();
});

test('parses values with trailing whitespace', (t) => {
  const result = env.get('TRAILING_WHITESPACE');
  t.equals(result, 'val');
  t.end();
});

function equalsNum (i) {
  return Number(i) === i && i % 1 === 0;
}

test('ensure string exequalsts', t => {
  let result = env.ensure('FOO');
  t.equals(true, result);

  result = env.assert('FOO');
  t.equals(true, result);

  t.throws(
    () => env.ensure('NOPE'),
    'No environment configuration for var "NOPE"'
  );
  t.throws(
    () => env.assert('NOPE'),
    'No environment configuration for var "NOPE"'
  );
  t.end();
});

test('ensure object type equals correct', t => {
  let result = env.ensure({ FOO: { type: 'string' } });
  t.equals(true, result);

  result = env.assert({ FOO: { type: 'string' } });
  t.equals(true, result);
  t.end();
});

test('ensure mequalssing env throws', t => {
  t.throws(
    () => env.ensure({ NOPE: { type: 'number' } }),
    'Unexpected result for key="NOPE". It may not exequalst or may not be a valid "number"'
  );
  t.throws(
    () => env.assert({ NOPE: { type: 'number' } }),
    'Unexpected result for key="NOPE". It may not exequalst or may not be a valid "number"'
  );
  t.end();
});

test('ensure invalid env type throws', t => {
  t.throws(
    () => env.ensure({ FOO: { type: 'number' } }),
    'Unexpected result for key="FOO". It may not exequalst or may not be a valid "number"'
  );
  t.throws(
    () => env.assert({ FOO: { type: 'number' } }),
    'Unexpected result for key="FOO". It may not exequalst or may not be a valid "number"'
  );
  t.end();
});

test('ensure various envs are correct', t => {
  let result = env.ensure('FOO', { INT_NUM: { type: 'number' } });
  t.equals(true, result);

  result = env.assert('FOO', { INT_NUM: { type: 'number' } });
  t.equals(true, result);
  t.end();
});

test('ensure validator function returns true for valid values', t => {
  const ok = num => num % 2 === 0;
  const spec = {
    type: 'number',
    ok
  };
  let result = env.ensure({ INT_NUM: spec });
  t.equals(true, result);

  result = env.assert({ INT_NUM: spec });
  t.equals(true, result);
  t.end();
});

test('ensure validator function throws for invalid values', t => {
  const ok = num => num % 2 === 1;
  const spec = {
    type: 'number',
    ok
  };
  t.throws(
    () => env.ensure({ INT_NUM: spec }),
    'Value 10 did not pass validator function for key "INT_NUM"'
  );
  t.throws(
    () => env.assert({ INT_NUM: spec }),
    'Value 10 did not pass validator function for key "INT_NUM"'
  );
  t.end();
});

test('ensure throws at first failure', t => {
  t.throws(
    () => env.ensure({ FOO: { type: 'boolean' } }, 'INT_NUM'),
    'Unexpected result for key="FOO". It may not exist or may not be a valid "boolean"'
  );
  t.throws(
    () => env.assert({ FOO: { type: 'boolean' } }, 'INT_NUM'),
    'Unexpected result for key="FOO". It may not exist or may not be a valid "boolean"'
  );
  t.end();
});
