
const is = require('is_js')
const ok = is.existy

module.exports = Object
  .create({
    /**
     * @description Fetches the env var with the given key. If no env var
     * with the specified key exists, the default value is returned if it is
     * provided else it returns undefined
     *
     * @param {(string|string[])} keyObj - A unique key for an item or a list of possible keys
     * @param {(string|number)} defaultVal - The default value of an item if it doesn't
     * already exist
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
    * @param {string[]} items - An array of keys
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
     * @param {(string|string[])} keys - A unique key or array of keys
     *
     */
    ok: (...keys) => keys.every(key => ok(process.env[key])),

    /**
     * @description This method ensures 1 to many environment variables either
     * exist, or exist and are of a designated type
     *
     * @example
     * ensure(
     *  // Will ensure 'HOSTNAME' exists
     *  'HOSTNAME',
     *  // Will ensure 'PORT' both exists and is a number
     *  { 'PORT': { type: 'number' }},
     *  // Will ensure 'INTERVAL' exists, it's a number and its value is greater
     *  // than or equal to 1000
     *  { 'INTERVAL': { type: 'number', ok: s => s >= 1000 }}
     *  // ...
     * )
     *
     */
    ensure (...items) {
      const self = this
      const getKit = item => {
        switch (item) {
          case 'string':
            console.log('triggered string')
            return { validator: is.string, getter: self.get.bind(self) }
          case 'number':
            console.log('triggered number')
            return { validator: is.number, getter: self.getNumber.bind(self) }
          case 'boolean':
            console.log('triggered boolean')
            return { validator: is.boolean, getter: self.getBool.bind(self) }
          default:
            console.log('i thould throw\n')
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
          const type = item[key].type
          const validator = item[key].ok

          if (type && !validType(type)) {
            throw Error(`Invalid expected type "${type}"`)
          } else {
            const kit = getKit(type)
            const val = kit.getter(key)
            const result = kit.validator(val)
            if (!result) {
              throw Error(`Unexpected result for key="${key}". It may not exist or may not be a valid "${type}"`)
            }

            if (validator && is.function(validator)) {
              const valid = validator(val)
              if (!valid) {
                throw Error(`Value ${val} did not pass validator function for key "${key}"`)
              }
            }
            return true
          }
        } else {
          throw Error(`Invalid key ${item}`)
        }
      })
    },

    /**
     * @description Fetches the value at the given key and attempts to coerce
     * it into a boolean
     *
     * @param {string} key - A unique key
     * @param {boolean} defaultVal - The default value
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
     * @param {string} key - A unique key
     * @param {boolean} defaultVal - The default value if none exists
     *
     */
    bool (key, defaultVal) {
      return this.getBool(key, defaultVal)
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into an integer
     *
     * @param {string} key - A unique key
     * @param {number} defaultVal - The default value
     *
     */
    getNumber (key, defaultVal) {
      const value = this.get(key, defaultVal)
      const intVal = parseInt(value, 10)
      const valIsInt = is.integer(intVal)

      if (value === defaultVal) {
        return value
      } else if (valIsInt) {
        return intVal
      }
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
     * @param {string} key - A unique key
     * @param {object} options
     *
     */
    getList (key, opts = { dilim: ',', cast: null }) {
      const { dilim, cast } = opts
      const value = this.get(key, [])

      if (!is.array(value)) {
        let ret = value.split(dilim).map(i => i.trim())
        if (cast && cast === 'number') {
          ret = mapNums(ret)
        }
        return ret
      } else {
        return value
      }
    },

    /**
     * @description An alias function for getList()
     *
     * @param {string} key - A unique key
     * @param {object} options
     *
     */
    list (key, opts) {
      return this.getList(key, opts)
    }
  })

const parse = (items, converter) => items.map(t => converter(t, 10))
const mapNums = items => parse(items, parseInt)
const validType = item => ['number', 'boolean', 'string'].includes(item)
