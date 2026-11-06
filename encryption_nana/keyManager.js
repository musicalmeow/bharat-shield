const subtle = globalThis.crypto?.subtle;

const RSA_PARAMS = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

function abToB64(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b64ToAb(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function generateKeyPair() {
  if (!subtle) throw new Error('Web Crypto unavailable');
  const pair = await subtle.generateKey(RSA_PARAMS, true, ['encrypt', 'decrypt']);
  const pubBuf = await subtle.exportKey('spki', pair.publicKey);
  const privBuf = await subtle.exportKey('pkcs8', pair.privateKey);
  return {
    publicKeySpkiB64: abToB64(pubBuf),
    privateKeyPkcs8B64: abToB64(privBuf),
  };
}

async function importPublicKeyFromSpkiB64(b64) {
  const buf = b64ToAb(b64);
  return subtle.importKey('spki', buf, RSA_PARAMS, false, ['encrypt']);
}

async function importPrivateKeyFromPkcs8B64(b64) {
  const buf = b64ToAb(b64);
  return subtle.importKey('pkcs8', buf, RSA_PARAMS, false, ['decrypt']);
}

module.exports = {
  generateKeyPair,
  importPublicKeyFromSpkiB64,
  importPrivateKeyFromPkcs8B64,
  abToB64,
  b64ToAb,
};
