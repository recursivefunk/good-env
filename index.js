'use strict'

const is = require('is_js')
const component = require('stampit')
const ok = is.existy

const Env = component()
  .methods({
    getAll(items) {
      let itemsArr
      if (is.array(items)) {
        itemsArr = items.map((key) => this.get(key))
        return itemsArr.reduce((prev, next, index) => {
          prev[items[index]] = itemsArr[index]
          return prev
        }, {})
      } else if (is.json(items)) {
        // deal with it
      } else {
        throw Error(`Invalid arg ${items}`)
      }
    },
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
    ok (key) {
      return ok(process.env[key])
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into a boolean
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
    getInt (key, defaultVal) {
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
     * @description An alias function for getInt()
     *
     */
    int (key, defaultVal) {
      return this.getInt(key, defaultVal)
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into a list of literal values
     *
     */
    getList (key, opts) {
      opts = opts || {}
      let value

      value = this.get(key, [])

      if (!is.array(value)) {
        const dilim = opts.dilim || ','
        let ret = value.split(dilim).map(i => i.trim())
        if (opts.cast === 'int') {
          ret = mapInts(ret)
        } else if (opts.cast === 'float') {
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
      opts = opts || {}
      return this.getList(key, opts)
    }
  })

module.exports = Env.create()

function mapFloats (items) {
  return items.map((t) => parseFloat(t, 10))
}

function mapInts (items) {
  return items.map((t) => parseInt(t, 10))
}
