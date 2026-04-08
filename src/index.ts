import { isIP } from 'node:net';
import { URL } from 'node:url';
import { makeGoodUrl, GoodUrl } from './lib/url-types';

type ValidType = 'number' | 'boolean' | 'string';

interface EnsureSpec {
  type: ValidType;
  ok?: (value: string | number | boolean) => boolean;
}

type EnsureItem = string | Record<string, EnsureSpec>;

interface GetListOptions {
  dilim?: string;
  cast?: 'number' | null;
}

interface AWSDefaults {
  region?: string;
}

interface AWSCredentials {
  awsKeyId: string | undefined;
  awsSecretAccessKey: string | undefined;
  awsSessionToken: string | undefined;
  awsRegion: string | undefined;
}

interface AWSSMResponse {
  SecretString: string;
}

interface AWSSMClient {
  send (cmd: unknown): Promise<AWSSMResponse>;
}

interface AWSSMModule {
  SecretsManagerClient: new (config: { region: string }) => AWSSMClient;
  GetSecretValueCommand: new (input: { SecretId: string; VersionStage: string }) => unknown;
}

const ok = (x: unknown): boolean => !!x;
const isArray = Array.isArray;
const is = (x: unknown): string => Object.prototype.toString.call(x);
const isString = (x: unknown): x is string => is(x) === '[object String]';
const isNumber = (x: unknown): x is number => is(x) === '[object Number]';
const isBoolean = (x: unknown): x is boolean => is(x) === '[object Boolean]';
const isObject = (x: unknown): x is Record<string, unknown> => is(x) === '[object Object]';
const isFunction = (x: unknown): x is Function => is(x) === '[object Function]';
const parse = (items: string[], converter: (s: string, radix: number) => number): number[] =>
  items.map(t => converter(t, 10));
const mapNums = (items: string[]): number[] => parse(items, parseInt);
const validType = (item: unknown): item is ValidType =>
  ['number', 'boolean', 'string'].includes(item as string);

const store: Record<string, string | undefined> = { ...process.env };

const env = {
  set (key: string, value: string): void {
    process.env[key] = value;
    store[key] = value;
  },

  async use (awsSecretsManager: AWSSMModule, secretId?: string): Promise<void> {
    const { SecretsManagerClient, GetSecretValueCommand } = awsSecretsManager;
    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });

    if (!secretId) {
      secretId = this.get(['AWS_SECRET_ID', 'SECRET_ID']) as string | undefined;
    }

    if (!secretId) {
      throw new Error('\'secretId\' was not specified, and it wasn\'t found as \'AWS_SECRET_ID\' or \'SECRET_ID\' in the environment.');
    }

    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretId,
        VersionStage: 'AWSCURRENT'
      })
    );
    const secretStr = response.SecretString;
    const secret = JSON.parse(secretStr) as Record<string, string>;
    Object.entries(secret).forEach(([key, value]) => {
      this.set(key, value);
    });
  },

  getIP (key: string, defaultVal?: string): string | null {
    const strIP = this.get(key) as string | undefined;

    if (!strIP) {
      if (!isIP(defaultVal as string)) {
        return null;
      } else {
        return defaultVal as string;
      }
    }

    if (isIP(strIP)) return strIP;
    if (isIP(defaultVal as string)) return defaultVal as string;
    return null;
  },

  getAWS ({ region }: AWSDefaults = {}): AWSCredentials {
    const {
      AWS_ACCESS_KEY_ID: awsKeyId,
      AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
      AWS_SESSION_TOKEN: awsSessionToken,
      AWS_REGION: awsRegion
    } = this.getAll({
      AWS_ACCESS_KEY_ID: null,
      AWS_SECRET_ACCESS_KEY: null,
      AWS_SESSION_TOKEN: null,
      AWS_REGION: region ?? null
    }) as Record<string, string | undefined>;

    return {
      awsKeyId,
      awsSecretAccessKey,
      awsSessionToken,
      awsRegion
    };
  },

  getUrl (key: string, defaultVal?: string): Readonly<GoodUrl> | null {
    let urlStr = this.get(key, defaultVal) as string | undefined;

    if (urlStr === defaultVal) {
      urlStr = defaultVal;
    }

    try {
      return makeGoodUrl({ url: new URL(urlStr as string) });
    } catch (e) {
      return null;
    }
  },

  url (key: string, defaultVal?: string): Readonly<GoodUrl> | null {
    return this.getUrl(key, defaultVal);
  },

  get (keyObj: string | string[], defaultVal?: unknown): unknown {
    let keys: string[];
    let value: unknown;

    if (isString(keyObj)) {
      keys = [keyObj];
    } else if (isArray(keyObj)) {
      keys = (keyObj as string[]).map(k => k.trim());
    } else {
      throw Error(`Invalid key(s) ${keyObj as string}`);
    }

    keys.some(key => {
      if (ok(store[key])) {
        value = store[key];
        return true;
      }
      return false;
    });

    if (!ok(value) && typeof ok(defaultVal)) {
      value = defaultVal;
    }

    return (isString(value)) ? value.trim() : value;
  },

  getAll (items: string[] | Record<string, string | null>): (string | undefined)[] | Record<string, string | undefined> {
    const boundGet = this.get.bind(this);

    const objReducer = (obj: Record<string, string | null>) =>
      Object.keys(obj).reduce<Record<string, string | undefined>>((prev, next) => {
        prev[next] = boundGet(next, obj[next]) as string | undefined;
        return prev;
      }, {});

    const arrMapper = (keys: string[]) => keys.map(key => boundGet(key) as string | undefined);

    if (isArray(items)) {
      return arrMapper(items);
    } else if (isObject(items)) {
      return objReducer(items as Record<string, string | null>);
    } else {
      throw Error(`Invalid arg ${items as string}`);
    }
  },

  ok: (...keys: string[]): boolean => keys.every(key => ok(store[key])),

  ensure (...items: EnsureItem[]): boolean {
    const self = this;

    interface Kit {
      validator: (x: unknown) => boolean;
      getter: (key: string) => unknown;
    }

    const getKit = (item: ValidType): Kit => {
      switch (item) {
        case 'string':
          return { validator: isString, getter: self.get.bind(self) };
        case 'number':
          return { validator: isNumber, getter: self.getNumber.bind(self) };
        case 'boolean':
          return { validator: isBoolean, getter: self.getBool.bind(self) };
        /* istanbul ignore next */
        default:
          throw Error(`Invalid type "${item as string}"`);
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
        const spec = (item as Record<string, EnsureSpec>)[key];
        const type = spec.type;
        const validator = spec.ok;

        /* istanbul ignore if */
        if (type && !validType(type)) {
          throw Error(`Invalid expected type "${type as string}"`);
        } else {
          const kit = getKit(type);
          const val = kit.getter(key);
          const result = kit.validator(val);
          if (!result) {
            throw Error(`Unexpected result for key="${key}". It may not exist or may not be a valid "${type}"`);
          }

          if (validator && isFunction(validator)) {
            const valid = validator(val as string | number | boolean);
            if (!valid) {
              throw Error(`Value ${val as string} did not pass validator function for key "${key}"`);
            }
          }
          return true;
        }
      } else {
        throw Error(`Invalid key ${item as string}`);
      }
    });
  },

  assert (...items: EnsureItem[]): boolean {
    return this.ensure(...items);
  },

  getBool (key: string, defaultVal?: boolean): boolean {
    let value: string | undefined = store[key];

    if (ok(value)) {
      const normalized = (value as string).toLowerCase().trim();
      if (normalized === 'true') {
        return true;
      } else if (normalized === 'false') {
        return false;
      }
      throw new Error(`${normalized} is not a boolean`);
    } else if (defaultVal === true || defaultVal === false) {
      return defaultVal;
    }

    return false;
  },

  bool (key: string, defaultVal?: boolean): boolean {
    return this.getBool(key, defaultVal);
  },

  getNumber (key: string | string[], defaultVal?: number): number | undefined {
    const value = this.get(key, defaultVal);
    if (value === defaultVal) return value as number | undefined;
    const num = parseFloat(value as string);
    if (!isNaN(num)) return num;
  },

  num (key: string | string[], defaultVal?: number): number | undefined {
    return this.getNumber(key, defaultVal);
  },

  getList (key: string, opts: GetListOptions = { dilim: ',', cast: null }): string[] | number[] {
    const { dilim = ',', cast } = opts;
    const value = this.get(key, []) as string | string[];

    if (!isArray(value)) {
      let ret: string[] = (value as string).split(dilim).map(i => i.trim());
      if (cast && cast === 'number') {
        return mapNums(ret);
      }
      return ret;
    } else {
      return value as string[];
    }
  },

  list (key: string, opts?: GetListOptions): string[] | number[] {
    return this.getList(key, opts);
  }
};

export = env;
