// Preload into the isolated Next process. No hosted project is reachable.
const net = require('node:net');
const originalConnect = net.Socket.prototype.connect;
const allowed = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
net.Socket.prototype.connect = function (...args) {
  let options = args[0];
  if (Array.isArray(options)) options = options[0];
  const host = options && typeof options === 'object' ? options.host : typeof args[1] === 'string' ? args[1] : 'localhost';
  if (host && !allowed.has(host)) throw new Error('PRICING_FIXTURE_EXTERNAL_NETWORK_BLOCKED');
  return originalConnect.apply(this, args);
};
const originalFetch = globalThis.fetch;
globalThis.fetch = function (input, options) {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (!allowed.has(url.hostname)) throw new Error('PRICING_FIXTURE_EXTERNAL_NETWORK_BLOCKED');
  return originalFetch(input, options);
};
