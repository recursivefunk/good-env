declare module "good-env" {
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
  export const get: (keyObj: any, defaultVal?: any) => any;
  /**
   * @description Determines whether or not all of the values given key is
   * truthy
   *
   * @param {(string|string[])} keys - A unique key or array of keys
   *
   */
  export const ok: (...keys: any[]) => boolean;
  /**
   * @description Gets all items specified in the object. If the item is an
   * array, the function will perform a standard get with no defaults. If the
   * item is an object {}, the function will use the values as defaults -
   * null values will be treated as no default specified
   *
   * @param {string[]} items - An array of keys
   *
   */
  export const getAll: (items: any) => any;
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
  export const ensure: (...items: any[]) => boolean;
  /**
   * @description Fetches the value at the given key and attempts to coerce
   * it into a boolean
   *
   * @param {string} key - A unique key
   * @param {boolean} defaultVal - The default value
   *
   */
  export const getBool: (key: any, defaultVal?: any) => any;
  /**
   * @description An alias function for getBool()
   *
   * @param {string} key - A unique key
   * @param {boolean} defaultVal - The default value if none exists
   *
   */
  export const bool: (key: any, defaultVal?: any) => any;
  /**
   * @description Fetches the value at the given key and attempts to
   * coherse it into an integer
   *
   * @param {string} key - A unique key
   * @param {number} defaultVal - The default value
   *
   */
  export const getNumber: (key: any, defaultVal?: any) => any;
  /**
   * @description An alias function for getNumber()
   *
   */
  export const num: (key: any, defaultVal?: any) => any;
  /**
   * @description Fetches the value at the given key and attempts to
   * coherse it into a list of literal values
   *
   * @param {string} key - A unique key
   * @param {object} options
   *
   */
  export const getList: (
    key: any,
    opts?: {
      dilim: string;
      cast: any;
    }
  ) => any;
  /**
   * @description An alias function for getList()
   *
   * @param {string} key - A unique key
   * @param {object} options
   *
   */
  export const list: (key: any, opts: any) => any;
}
