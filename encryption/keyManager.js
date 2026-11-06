const sodium = require('libsodium-wrappers');

/**
 * Key Management Module
 * Handles secure key generation and management using libsodium
 */

async function initializeSodium() {
  await sodium.ready;
}

/**
 * Generate a new public/private key pair
 * @returns {Promise<{publicKey: string, privateKey: string}>} Base64 encoded key pair
 */
async function generateKeyPair() {
  await initializeSodium();
  
  try {
    // Check if method exists
    if (typeof sodium.crypto_box_keypair !== 'function') {
      throw new Error('crypto_box_keypair method not available');
    }
    
    const keyPair = sodium.crypto_box_keypair();
    
    return {
      publicKey: sodium.to_base64(keyPair.publicKey),
      privateKey: sodium.to_base64(keyPair.privateKey)
    };
  } catch (error) {
    throw new Error(`Failed to generate key pair: ${error.message}`);
  }
}

/**
 * Extract public key from a key pair
 * @param {string} privateKey - Base64 encoded private key
 * @returns {Promise<string>} Base64 encoded public key
 */
async function getPublicKey(privateKey) {
  await initializeSodium();
  
  try {
    const privateKeyBytes = sodium.from_base64(privateKey);
    const publicKey = sodium.crypto_scalarmult_base(privateKeyBytes);
    
    return sodium.to_base64(publicKey);
  } catch (error) {
    throw new Error(`Failed to extract public key: ${error.message}`);
  }
}

/**
 * Get private key securely (for internal use only)
 * @param {string} privateKey - Base64 encoded private key
 * @returns {Promise<Uint8Array>} Private key bytes (for internal crypto operations)
 */
async function getPrivateKeyBytes(privateKey) {
  await initializeSodium();
  
  try {
    return sodium.from_base64(privateKey);
  } catch (error) {
    throw new Error(`Failed to decode private key: ${error.message}`);
  }
}

/**
 * Validate if a key is properly formatted
 * @param {string} key - Base64 encoded key
 * @param {string} type - 'public' or 'private'
 * @returns {Promise<boolean>} True if valid
 */
async function validateKey(key, type = 'public') {
  await initializeSodium();
  
  try {
    const keyBytes = sodium.from_base64(key);
    
    if (type === 'public') {
      return keyBytes.length === sodium.crypto_box_PUBLICKEYBYTES;
    } else if (type === 'private') {
      return keyBytes.length === sodium.crypto_box_SECRETKEYBYTES;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateKeyPair,
  getPublicKey,
  getPrivateKeyBytes,
  validateKey
};
