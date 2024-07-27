'use strict';

function httpUrl({ url }) {
  return Object.freeze({
    httpOk: true,
    redisOk: false,
    pgOk: false,
    href: url.href,
    raw: url,
  });
}

function redisUrl({ url }) {
  return Object.freeze({
    redisOk: true,
    httpOk: false,
    pgOk: false,
    href: url.href,
    raw: url,
  });
}

function pgUrl({ url }) {
  return Object.freeze({
    pgOk: true,
    redisOk: false,
    httpOk: false,
    href: url.href,
    raw: url,
  });
}

function makeGoodUrl({ url }) {
  if (url.protocol.startsWith('redis')) {
    return redisUrl({ url });
  } else if (url.protocol.startsWith('postgresql')) {
    return pgUrl({ url });
  } else if (url.protocol.startsWith('http')) {
    return httpUrl({ url });
  }

  return null;
}

module.exports = { makeGoodUrl };
