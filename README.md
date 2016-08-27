
# good-env

```
$ npm install good-env --save
```

With normal process.env

```
$ export FOO=10
$ export A_TRUE_VAL=true
$ export A_FALSE_VAL=false
$ node
> process.env.FOO
'10'
> process.env.A_TRUE_VAL
'true'
> process.env.A_FALSE_VAL
'false'
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
> env.get('NOT_HERE', 'foo')
'foo'
>
```

Even lists
```
$ export LIST=foo,bar,bang
$ node
> env = require('good-env')
> env.getList('LIST')
['foo', 'bar']
```

Sometimes you just need to know if something exists
```
> env.ok('NOT_SET')
false
> env.ok('FOO')
true
```
