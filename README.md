
# good-env

[![Circle CI](https://circleci.com/gh/recursivefunk/good-env.png?circle-token=b1d0d5b046161f60cc5816afb82b741db7163344)](https://circleci.com/gh/recursivefunk/good-env)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)

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
env.getInt('FOO') // 10
env.getBool('A_TRUE_VAL') // true
env.getBool('A_FALSE_VAL') // false
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
  A_SECRET: 'lolz', HOST: null // null means no default
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

Integer Lists

```
$ export LIST=1,2,3
```

```javascript
process.env.LIST // '1,2,3'
env.list('LIST', { cast: 'int' }) // [1, 2, 3]
```

Float Lists

```
$ export LIST=1.3,2.5,3.6
```

```javascript
process.env.LIST // '1.3,2.5,3.6'
env.list('LIST', { cast: 'float' }) // [1.3, 2.2, 3.6]
```

Sometimes you just need to know if something exists

```javascript
env.ok('NOT_SET') // false
env.ok('FOO') // true
// works with multiple arguments
env.ok('FOO', 'BAR') // true
env.ok('FOO', 'BAR', 'NOT_SET') // false
// maybe you want to know which items specifically are not set
env.whichNotOk('FOO', 'BAR', 'NOT_SET') // { NOT_SET: true }
```

## Shortcut Methods

```javascript
env.int() ==> env.getInt()
env.bool() ==> env.getBool()
env.list() ==> env.getList()
```
