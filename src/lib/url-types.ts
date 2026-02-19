export interface GoodUrl {
  readonly httpOk: boolean;
  readonly redisOk: boolean;
  readonly pgOk: boolean;
  readonly href: string;
  readonly raw: URL;
}

interface UrlInput {
  url: URL;
}

function httpUrl ({ url }: UrlInput): Readonly<GoodUrl> {
  return Object.freeze({
    httpOk: true,
    redisOk: false,
    pgOk: false,
    href: url.href,
    raw: url
  });
}

function redisUrl ({ url }: UrlInput): Readonly<GoodUrl> {
  return Object.freeze({
    redisOk: true,
    httpOk: false,
    pgOk: false,
    href: url.href,
    raw: url
  });
}

function pgUrl ({ url }: UrlInput): Readonly<GoodUrl> {
  return Object.freeze({
    pgOk: true,
    redisOk: false,
    httpOk: false,
    href: url.href,
    raw: url
  });
}

export function makeGoodUrl ({ url }: UrlInput): Readonly<GoodUrl> | null {
  if (url.protocol.startsWith('redis')) {
    return redisUrl({ url });
  } else if (url.protocol.startsWith('postgresql')) {
    return pgUrl({ url });
  } else if (url.protocol.startsWith('http')) {
    return httpUrl({ url });
  }

  return null;
}
