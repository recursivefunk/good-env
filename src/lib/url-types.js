'use strict';

function httpUrl({ url }) {
  return Object.freeze({
    httpOk: true,
    redisOk: false,
    pgOk: false,
    secure: url.protocol.startsWith('https') ? true : false,
    href: url.href,
    raw: url,
  });
}

function redisUrl({ url }) {
  return Object.freeze({
    redisOk: true,
    httpOk: false,
    pgOk: false,
    secure: url.protocol.startsWith('rediss') ? true : false,
    href: url.href,
    raw: url,
  });
}

function makeGoodUrl({ url }) {
  if (url.protocol.startsWith('redis')) {
    return redisUrl({ url });
  } else {
    return httpUrl({ url });
  }
}

module.exports = { makeGoodUrl };
