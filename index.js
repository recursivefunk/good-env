
const is = require('is_js')
const component = require('stampit')

const Env = component()

  .methods({
    get(key, defaultVal) {
      let value = process.env[key]

      if (!value && typeof defaultVal !== 'undefined') {
        value = defaultVal
      }
      return value
    },

    getInt(key, defaultVal) {
      let value = this.get(key, defaultVal)
      const intVal = parseInt(value, 10)
      const valIsInt = is.integer(intVal)

      if (value === defaultVal) {
        return value
      } else if (valIsInt) {
        return intVal
      }

    }

  })

module.exports = Env.create()

