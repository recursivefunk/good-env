
const is = require('is_js')
const component = require('stampit')
const ok = is.existy
const cache = {}

const Env = component()

  .methods({
    get(key, defaultVal) {
      let value = process.env[key]

      if (!ok(value) && typeof ok(defaultVal)) {
        value = defaultVal
      }

      return value
    },

    ok(key) {
      return ok(process.env[key])
    },

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

    getList(key, defaultVal, opts = {}) {
      let value

      if (ok(key[cache])) {
        return cache[key]
      }

      value = this.get(key, defaultVal)

      if (ok(value)) {
        if (!is.array(value)) {
          const dilim = opts.dilim || ','
          const ret = value.split(dilim)
          cache[key] = ret
          return ret
        } else {
          cache[key] = value
          return value
        }
      }
    }
  })

module.exports = Env.create()

