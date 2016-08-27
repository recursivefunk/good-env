
# good-env

```
$ npm install good-env --save
```

With normal process.env

```
$ export FOO=10
$ node
> process.env.FOO
'10'
>
```

Using 'good-env'
```
> const env = require('good-env')
> env.getInt('FOO')
10
>
```

Specify defaults
```
> env.get('NOT_HERE', 'foo')
'foo'
>
```
