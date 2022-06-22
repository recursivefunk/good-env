
# good-env

[![Circle CI](https://circleci.com/gh/recursivefunk/good-env.png?circle-token=b1d0d5b046161f60cc5816afb82b741db7163344)](https://circleci.com/gh/recursivefunk/good-env)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

`good-env` provides a more intuitive way to interface with environment variables for node apps. Reasoning
about raw strings is OK for some things but for non-trivial applications, booleans, numbers, lists or even
the existence (or non-existence) of environment configurations can play a key role in how an application behaves.

```
$ npm install good-env --save
```

With normal process.env

```
$ export HOST=localhost
$ export SECRET=shhh
$ export FOO=10
$ export A_TRUE_VAL=true
$ export A_FALSE_VAL=false
$ export LIST=foo,bar,bang
$ node
> process.env.FOO
'10'
> process.env.A_TRUE_VAL
'true'
> process.env.A_FALSE_VAL
'false'
> process.env.LIST
'foo,bar,bang'
>
```

Using `good-env`

```javascript
const env = require('good-env')
env.getNumber('FOO') // 10
env.getBool('A_TRUE_VAL') // true
env.getBool('A_FALSE_VAL') // false
```

> **Warning**
> Checking the _existence_ of a boolean value which resolves to `false` will return `true` because `ok()` doesn't give you a value.

```
export A_BOOL_VAL=false
```
```javascript
env.ok('A_BOOL_VAL') // true
```

Specify defaults

```javascript
env.get('NOT_SET', 'foo') // 'foo'
```

Batch Gets

```javascript
env.getAll(['SECRET', 'HOST']) // ['shhh', 'localhost']

// defaults work here too
env.getAll({
  A_SECRET: 'lolz', 
  HOST: null // null means no default
}) // { A_SECRET: 'lolz', HOST: 'localhost' }
```

Use the first available environment variable

```javascript
// old and busted
const host = process.env.THE_HOST || process.env.HOST // 'localhost'

// new hotness
const host = env.get(['THE_HOST', 'HOST']) // 'localhost'

// works with defaults
const host = env.get(['THE_HOST', 'A_HOST'], 'localhost') // 'localhost'
```

Lists

```javascript
env.getList('LIST') // ['foo', 'bar', 'bang']
env.getList('LIST_NOT_SET') // []
```

Number Lists

```
$ export LIST=1,2,3
```

```javascript
process.env.LIST // '1,2,3'
env.list('LIST', { cast: 'number' }) // [1, 2, 3]
```

Sometimes you just need to know if something exists

```javascript
env.ok('NOT_SET') // false
env.ok('FOO') // true

// works with multiple arguments.
// Returns true if ALL keys exist
env.ok('FOO', 'BAR') // true
env.ok('FOO', 'BAR', 'NOT_SET') // false
```

Use `.assert(item1, item2...)` to check the existence and/or type of a few items at once
Note: If any variable passed to `assert()` doesn't exist or is otherwise
invalid, an error will be thrown.

```javascirpt

env.assert(
    // Will ensure 'HOSTNAME' exists
    'HOSTNAME',
    
    // Will ensure 'PORT' both exists and is a number
    { 'PORT': { type: 'number' }},
    
    // Will ensure 'INTERVAL' exists, it's a number and its value is greater
    // than or equal to 1000
    { 'INTERVAL': { type: 'number', ok: s => s >= 1000 }}
    
    // ... any number of arguments
)
```

## Shortcut Methods

```javascript
env.num() ==> env.getNumber()
env.bool() ==> env.getBool()
env.list() ==> env.getList()
```
