const subtle = globalThis.crypto?.subtle;
const { importPublicKeyFromSpkiB64, abToB64 } = require('./keyManager');

const te = new TextEncoder();

/**
 * Encrypt plaintext for a recipient (RSA-OAEP wraps random AES-GCM key).
 * @param {string} plaintext
 * @param {string} recipientPublicKeySpkiB64
 */
async function encryptForRecipient(plaintext, recipientPublicKeySpkiB64) {
  if (!subtle) throw new Error('Web Crypto unavailable');
  const publicKey = await importPublicKeyFromSpkiB64(recipientPublicKeySpkiB64);

  const aesKey = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, te.encode(plaintext));
  const rawAes = await subtle.exportKey('raw', aesKey);
  const wrappedAes = await subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawAes);

  // Web Crypto API returns ciphertext + auth tag combined
  // We need to separate them for storage
  // For Web Crypto API, store the full ciphertext (data + auth tag)
  const encryptedMessage = JSON.stringify({
    v: 1,
    iv: abToB64(iv),
    data: abToB64(cipherBuf), // Store full ciphertext including auth tag
  });

  return {
    encryptedMessage,
    encryptedSessionKey: abToB64(wrappedAes),
  };
}

module.exports = { encryptForRecipient };
