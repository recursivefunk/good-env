'use strict';
const { isIP } = require('node:net');
const { URL } = require('node:url');
const { makeGoodUrl } = require('./lib/url-types');
const ok = x => !!x;
const isArray = Array.isArray;
const is = x => Object.prototype.toString.call(x);
const isString = x => is(x) === '[object String]';
const isNumber = x => is(x) === '[object Number]';
const isBoolean = x => is(x) === '[object Boolean]';
const isObject = x => is(x) === '[object Object]';
const isFunction = x => is(x) === '[object Function]';
const parse = (items, converter) => items.map(t => converter(t, 10));
const mapNums = items => parse(items, parseInt);
const validType = item => ['number', 'boolean', 'string'].includes(item);

module.exports = Object
  .create({
    /**
     * @description Fetches an IP address from the environment. If the value found under the specified key is not a valid IPv4
     * or IPv6 IP and there's no default value, null is returned. If a default value is provided and it is a valid IPv4 or IPv6
     * IP, the default value is retruned. If the default value is not valid, null is returned. This function won't return a value
     * that is not a valid IP address.
     * @param {string} key - A unique key that points to the IP address
     * @param {string} defaultVal - The default IP address to be used if the key isn't found
     * @returns
     */
    getIP (key, defaultVal) {
      const strIP = this.get(key);

      if (!strIP) {
        if (!isIP(defaultVal)) {
          return null;
        } else {
          return defaultVal;
        }
      }

      if (isIP(strIP)) return strIP;
      if (isIP(defaultVal)) return defaultVal;
      return null;
    },
    /**
     * @description Fetches three commonly used AWS environment variables - access key id, secret access key and region.
     * Note: You can only pass in a default region. No defaults for access key id or access key will be honored. This also
     * function assumes the standard AWS naming convention being used.
     * @param {object} defaults
     * @returns {object}
     */
    getAWS ({ region } = {}) {
      const {
        AWS_ACCESS_KEY_ID: awsKeyId,
        AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
        AWS_REGION: awsRegion
      } = this.getAll({
        AWS_ACCESS_KEY_ID: null,
        AWS_SECRET_ACCESS_KEY: null,
        AWS_REGION: region
      });

      return {
        awsKeyId,
        awsSecretAccessKey,
        awsRegion
      };
    },
    /**
     * @description Finds the URL string in the environment associated with the given key. If
     * it's found, the function tries to construct a URL object. If the URL is invalid, return null.
     * If the URL is valid, return the URL object. If the key is not found and a default value is
     * passed, we try to construct a URL using the default value. If anything goes wrong with the
     * construction of the URL, return null.
     *
     * @param {string} key - A unique key that points to the URL
     * @param {string} defaultVal - The default URL to be used if the key isn't found
     * @returns {object}
     */
    getUrl (key, defaultVal) {
      let urlStr = this.get(key, defaultVal);

      if (urlStr === defaultVal) {
        urlStr = defaultVal;
      }

      try {
        return makeGoodUrl({ url: new URL(urlStr) });
      } catch (e) {
        return null;
      }
    },

    /**
     * @description This is the shortcut function for the getUrl function
     * @returns {object}
     */
    url (key, defaultVal) {
      return this.getUrl(key, defaultVal);
    },

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
      let keys;
      let value;

      if (isString(keyObj)) {
        keys = [keyObj];
      } else if (isArray(keyObj)) {
        keys = keyObj.map(k => k.trim());
      } else {
        throw Error(`Invalid key(s) ${keyObj}`);
      }

      keys.some(key => {
        if (ok(process.env[key])) {
          value = process.env[key];
          return true;
        }
        return false;
      });

      if (!ok(value) && typeof ok(defaultVal)) {
        value = defaultVal;
      }

      return (isString(value)) ? value.trim() : value;
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
          prev[next] = getter(next, obj[next]);
          return prev;
        }, {})
      );

      const arrMapper = (keys, getter) => items.map(key => getter(key));

      if (isArray(items)) {
        return arrMapper(items, this.get);
      } else if (isObject(items)) {
        return objReducer(items, this.get);
      } else {
        throw Error(`Invalid arg ${items}`);
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
      const self = this;
      const getKit = item => {
        switch (item) {
          case 'string':
            return { validator: isString, getter: self.get.bind(self) };
          case 'number':
            return { validator: isNumber, getter: self.getNumber.bind(self) };
          case 'boolean':
            return { validator: isBoolean, getter: self.getBool.bind(self) };
          /* istanbul ignore next */
          default:
            throw Error(`Invalid type "${item}"`);
        }
      };

      return items.every(item => {
        if (isString(item)) {
          if (this.ok(item)) {
            return true;
          } else {
            throw Error(`No environment configuration for var "${item}"`);
          }
        } else if (isObject(item)) {
          const key = Object.keys(item)[0];
          const type = item[key].type;
          const validator = item[key].ok;

          /* istanbul ignore if */
          if (type && !validType(type)) {
            throw Error(`Invalid expected type "${type}"`);
          } else {
            const kit = getKit(type);
            const val = kit.getter(key);
            const result = kit.validator(val);
            if (!result) {
              throw Error(`Unexpected result for key="${key}". It may not exist or may not be a valid "${type}"`);
            }

            if (validator && isFunction(validator)) {
              const valid = validator(val);
              if (!valid) {
                throw Error(`Value ${val} did not pass validator function for key "${key}"`);
              }
            }
            return true;
          }
        } else {
          throw Error(`Invalid key ${item}`);
        }
      });
    },

    /**
     * An alias for .ensure()
     */
    assert (...items) {
      return this.ensure(...items);
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
      let value;

      value = process.env[key];

      if (ok(value)) {
        value = value.toLowerCase().trim();
        if (value === 'true') {
          return true;
        } else if (value === 'false') {
          return false;
        }
        throw new Error(`${value} is not a boolean`);
      } else if (defaultVal === true || defaultVal === false) {
        return defaultVal;
      }

      return false;
    },

    /**
     * @description An alias function for getBool()
     *
     * @param {string} key - A unique key
     * @param {boolean} defaultVal - The default value if none exists
     *
     */
    bool (key, defaultVal) {
      return this.getBool(key, defaultVal);
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coerce it into an integer
     *
     * @param {string} key - A unique key
     * @param {number} defaultVal - The default value
     *
     */
    getNumber (key, defaultVal) {
      const value = this.get(key, defaultVal);
      const intVal = parseInt(value, 10);
      const valIsInt = Number.isInteger(intVal);

      if (value === defaultVal) {
        return value;
      } else if (valIsInt) {
        return intVal;
      }
    },

    /**
     * @description An alias function for getNumber()
     *
     */
    num (key, defaultVal) {
      return this.getNumber(key, defaultVal);
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coerce it into a list of literal values
     *
     * @param {string} key - A unique key
     * @param {object} options
     *
     */
    getList (key, opts = { dilim: ',', cast: null }) {
      const { dilim, cast } = opts;
      const value = this.get(key, []);

      if (!isArray(value)) {
        let ret = value.split(dilim).map(i => i.trim());
        if (cast && cast === 'number') {
          ret = mapNums(ret);
        }
        return ret;
      } else {
        return value;
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
      return this.getList(key, opts);
    }
  });
