const subtle = globalThis.crypto?.subtle;
const { importPrivateKeyFromPkcs8B64, b64ToAb } = require('./keyManager');

const td = new TextDecoder();

/**
 * Decrypt payload produced by encryptForRecipient using recipient PKCS#8 private key.
 */
async function decryptFromStoredMessage(encryptedMessageJson, encryptedSessionKeyB64, privateKeyPkcs8B64) {
  if (!subtle) throw new Error('Web Crypto unavailable');
  const privateKey = await importPrivateKeyFromPkcs8B64(privateKeyPkcs8B64);
  const wrapped = b64ToAb(encryptedSessionKeyB64);
  const rawAes = await subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, wrapped);
  const aesKey = await subtle.importKey('raw', rawAes, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);

  const { iv, data } = JSON.parse(encryptedMessageJson);
  const ivBuf = new Uint8Array(b64ToAb(iv));
  const dataBuf = b64ToAb(data);
  
  // Decrypt the full ciphertext (includes auth tag)
  const plainBuf = await subtle.decrypt({ 
    name: 'AES-GCM', 
    iv: ivBuf
  }, aesKey, dataBuf);
  return td.decode(plainBuf);
}

module.exports = { decryptFromStoredMessage };
