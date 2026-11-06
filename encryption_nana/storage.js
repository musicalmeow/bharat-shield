/**
 * Persist key material in localStorage (browser). Do not store private keys on the server.
 */
const PREFIX = 'kmune_keypair_';

function readRecord(userId) {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(PREFIX + userId);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function storeKeyPair(userId, privateKeyBase64, publicKeyBase64) {
  if (!userId) throw new Error('userId is required');
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    PREFIX + userId,
    JSON.stringify({ privateKeyBase64, publicKeyBase64 })
  );
}

async function getPrivateKey(userId) {
  const r = readRecord(userId);
  return r ? r.privateKeyBase64 : null;
}

async function getPublicKey(userId) {
  const r = readRecord(userId);
  return r ? r.publicKeyBase64 : null;
}

async function hasStoredKeyPair(userId) {
  return Boolean(userId && readRecord(userId)?.privateKeyBase64 && readRecord(userId)?.publicKeyBase64);
}

async function deleteKeyPair(userId) {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(PREFIX + userId);
}

module.exports = {
  storeKeyPair,
  getPrivateKey,
  getPublicKey,
  hasStoredKeyPair,
  deleteKeyPair,
};
