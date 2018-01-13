
const is = require('is_js')
const component = require('stampit')
const ok = is.existy

const Env = component()
  .methods({
    /**
     * @description Fetches the env var with the given key. If no env var
     * with the specified key exists, the default value is returned if it is
     * provided else it returns undefined
     *
     */
    get (keyObj, defaultVal) {
      let keys
      let value

      if (is.string(keyObj)) {
        keys = [keyObj]
      } else if (is.array(keyObj)) {
        keys = keyObj.map(k => k.trim())
      } else {
        throw Error(`Invalid key(s) ${keyObj}`)
      }

      keys.some(key => {
        if (ok(process.env[key])) {
          value = process.env[key]
          return true
        }
      })

      if (!ok(value) && typeof ok(defaultVal)) {
        value = defaultVal
      }

      value = (is.string(value)) ? value.trim() : value

      return value
    },

    /**
    * @description Gets all items specified in the object. If the item is an
    * array, the function will perform a standard get with no defaults. If the
    * item is an object {}, the function will use the values as defaults -
    * null values will be treated as no default specified
    *
    *
    */
    getAll (items) {
      const objReducer = (obj, getter) => (
        Object.keys(obj).reduce((prev, next, index) => {
          prev[next] = getter(next, obj[next])
          return prev
        }, {})
      )

      const arrReducer = (keys, getter) => {
        const arr = items.map(key => getter(key))
        return arr.reduce((prev, next, index) => {
          prev[keys[index]] = arr[index]
          return prev
        }, {})
      }

      if (is.array(items)) {
        return arrReducer(items, this.get)
      } else if (is.json(items)) {
        return objReducer(items, this.get)
      } else {
        throw Error(`Invalid arg ${items}`)
      }
    },

    /**
     * @description Determines whether or not all of the values given key is
     * truthy
     *
     */
    ok: (...keys) => keys.every(key => ok(process.env[key])),

    /**
     * @description Determines which items are NOT present in the environment.
     * A dictionary is returned for easy existence checking
     *
     * @deprecated Use ensure() instead
     *
    */
    whichNotOk: (...keys) => {
      console.log('whichNotOk() is deprecated. Please use ensure() instead')
      return keys
        .filter(key => !ok(process.env[key]))
        .reduce((accum, key) => {
          accum[key] = true // true from the assertion: This item is NOT present.
          return accum
        }, {})
    },

    /**
     * @description This method ensures 1 to many environment variables either
     * exist, or exist and are of a designated type
     *
     * ensure(
     *  'HOSTNAME', // Will ensure 'HOSTNAME' exists
     *  { 'PORT': 'number' } // Will ensure 'PORT' both exists and is a number
     *  // ...
     *)
     *
     */
    ensure (...items) {
      const self = this
      const getKit = item => {
        switch (item) {
          case 'string':
            return { validator: is.string, getter: self.get.bind(self) }
          case 'number':
            return { validator: is.number, getter: self.getNumber.bind(self) }
          case 'boolean':
            return { validator: is.boolean, getter: self.getBool.bind(self) }
          default:
            throw Error(`Invalid type "${item}"`)
        }
      }

      return items.every(item => {
        if (is.string(item)) {
          if (this.ok(item)) {
            return true
          } else {
            throw Error(`No environment configuration for var "${item}"`)
          }
        } else if (is.json(item)) {
          const key = Object.keys(item)[0]
          const type = item[key]

          if (!validType(type)) {
            throw Error(`Invalid expected type "${type}"`)
          } else {
            const kit = getKit(type)
            const val = kit.getter(key)
            const result = kit.validator(val)
            if (!result) {
              throw Error(`Unexpected result for key="${key}". It may not exist or may not be a valid "${type}"`)
            } else {
              return true
            }
          }
        }
      })
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coerce it into a boolean
     *
     */
    getBool (key, defaultVal) {
      let value

      value = process.env[key]

      if (ok(value)) {
        let ret
        value = value.toLowerCase().trim()
        if (value === 'true') {
          ret = true
        } else if (value === 'false') {
          ret = false
        }
        return ret
      } else if (defaultVal === true || defaultVal === false) {
        return defaultVal
      }

      return false
    },

    /**
     * @description An alias function for getBool()
     *
     */
    bool (key, defaultVal) {
      return this.getBool(key, defaultVal)
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into an integer
     *
     */
    getNumber (key, defaultVal) {
      let value
      let intVal
      let valIsInt

      value = this.get(key, defaultVal)
      intVal = parseInt(value, 10)
      valIsInt = is.integer(intVal)

      if (value === defaultVal) {
        return value
      } else if (valIsInt) {
        return intVal
      }
    },

    /**
     * @deprecated Use getNumber() instead
     */
    getInt (key, defaultVal) {
      console.log('getInt() is deprecated. Please use getNumber() or num() instead.')
      return this.getNumber(key, defaultVal)
    },

    /**
     * @deprecated Use getNum() instead
     *
     */
    int (key, defaultVal) {
      console.log('int() is deprecated. Please use num() instead()')
      return this.getInt(key, defaultVal)
    },

    /**
     * @description An alias function for getNumber()
     *
     */
    num (key, defaultVal) {
      return this.getNumber(key, defaultVal)
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into a list of literal values
     *
     *
     */
    getList (key, opts = { dilim: ',', cast: null }) {
      const { dilim, cast } = opts
      let value

      value = this.get(key, [])

      if (!is.array(value)) {
        let ret = value.split(dilim).map(i => i.trim())
        if (cast && cast === 'int') {
          ret = mapInts(ret)
        } else if (cast && cast === 'float') {
          ret = mapFloats(ret)
        }
        return ret
      } else {
        return value
      }
    },

    /**
     * @description An alias function for getList()
     *
     */
    list (key, opts) {
      return this.getList(key, opts)
    }
  })

module.exports = Env.create()

const parse = (items, converter) => items.map(t => converter(t, 10))
const mapFloats = items => parse(items, parseFloat)
const mapInts = items => parse(items, parseInt)
const validType = item => ['number', 'boolean', 'string'].includes(item)
