
# good-env

[![Circle CI](https://circleci.com/gh/recursivefunk/good-env.png?circle-token=b1d0d5b046161f60cc5816afb82b741db7163344)](https://circleci.com/gh/recursivefunk/good-env)

```
$ npm install good-env --save
```

With normal process.env

```
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
```
> const env = require('good-env')
> env.getInt('FOO')
10
> env.getBool('A_TRUE_VAL')
true
> env.getBool('A_FALSE_VAL')
false
```

Specify defaults
```
> env.get('NOT_SET', 'foo')
'foo'
>
```

Lists
```
> env.getList('LIST')
['foo', 'bar', 'bang']

> env.getList('LIST_NOT_SET')
[]
```

Integer Lists
```
> export LIST=1,2,3
> process.env.LIST
'1,2,3'

> env.list('LIST', { cast: 'int' })
[1, 2, 3]
```

Float Lists
```
> export LIST=1.3,2.5,3.6
'1.3,2.5,3.6'

env.list('LIST', { cast: 'float' })
[1.3, 2.2, 3.6]
```

Sometimes you just need to know if something exists
```
> env.ok('NOT_SET')
false
> env.ok('FOO')
true
>
```

## Shortcut Methods

```javascript
env.int() ==> env.getInt()
env.bool() ==> env.getBool()
env.list() ==> env.getList()
```
