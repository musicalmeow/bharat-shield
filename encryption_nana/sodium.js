/** Small randomness helper (no libsodium dependency in browser). */
function randomBytes(length) {
  const out = new Uint8Array(length);
  globalThis.crypto.getRandomValues(out);
  return out;
}

function randomHex(bytes = 16) {
  return Array.from(randomBytes(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

module.exports = { randomBytes, randomHex };
