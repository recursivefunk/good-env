'use strict'

const is = require('is_js')
const component = require('stampit')
const ok = is.existy
const cache = {}

const Env = component()

  .methods({

    /**
     * @description Fetches the env var with the given key. If no env var
     * with the specified key exists, the default value is returned if it is
     * provided else it returns undefined
     *
     */
    get(keyObj, defaultVal) {
      let keys
      let value

      if (is.string(keyObj)) {
        keys = [keyObj]
      } else if (is.array(keyObj)){
        keys = keyObj.map(k => k.trim())
      } else {
        throw new Error(`Invalid key(s) ${keyObj}`)
      }

      keys.some((key) => {
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
     * @description Determines whether or not the value at the given key is
     * truthy
     *
     */
    ok(key) {
      return ok(process.env[key])
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into a boolean
     *
     */
    getBool(key) {
      let value

      if (ok(cache[key])) {
        return cache[key]
      }

      value = process.env[key]

      if (ok(value)) {
        let ret
        value = value.toLowerCase().trim()
        if (value === 'true') {
          ret = true
        } else if (value === 'false') {
          ret = false
        }
        cache[key] = ret
        return ret
      }

      return false
    },

    /**
     * @description An alias function for getBool()
     *
     */
    bool(key) {
      return this.getBool(key)
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into an integer
     *
     */
    getInt(key, defaultVal) {
      let value
      let intVal
      let valIsInt

      if (ok(cache[key])) {
        return cache[key]
      }

      value = this.get(key, defaultVal)
      intVal = parseInt(value, 10)
      valIsInt = is.integer(intVal)

      if (value === defaultVal) {
        cache[key] = value
        return value
      } else if (valIsInt) {
        cache[key] = intVal
        return intVal
      }
    },

    /**
     * @description An alias function for getInt()
     *
     */
    int(key, defaultVal) {
      return this.getInt(key, defaultVal)
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into a list of literal values
     *
     */
    getList(key, opts) {
    opts = opts || {}
      let value

      if (ok(cache[key])) {
        return cache[key]
      }

      value = this.get(key, [])

      if (!is.array(value)) {
        const dilim = opts.dilim || ','
        let ret = value.split(dilim).map(i => i.trim())
        if (opts.cast === 'int') {
          ret = mapInts(ret)
        } else if (opts.cast === 'float') {
          ret = mapFloats(ret)
        }
        cache[key] = ret
        return ret
      } else {
        cache[key] = value
        return value
      }

    },

    /**
     * @description An alias function for getList()
     *
     */
    list(key, opts) {
			opts = opts || {}
      return this.getList(key, opts)
    }
  })

module.exports = Env.create()

function mapFloats(items) {
  return items.map((t) => parseFloat(t, 10))
}

function mapInts(items) {
  return items.map((t) => parseInt(t, 10))
}
