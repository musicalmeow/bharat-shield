const sodium = require('libsodium-wrappers');

/**
 * Decryption Module
 * Handles message decryption using libsodium
 */

async function initializeSodium() {
  if (!sodium.ready) {
    await sodium.ready;
  }
}

/**
 * Decrypt a message using sender's public key and receiver's private key
 * @param {Object} params - Decryption parameters
 * @param {string} params.ciphertext - Base64 encoded ciphertext
 * @param {string} params.nonce - Base64 encoded nonce
 * @param {string} params.senderPublicKey - Base64 encoded sender public key
 * @param {string} params.receiverPrivateKey - Base64 encoded receiver private key
 * @returns {Promise<string>} Decrypted plain text message
 */
async function decryptMessage({ ciphertext, nonce, senderPublicKey, receiverPrivateKey }) {
  await initializeSodium();
  
  try {
    // Validate inputs
    if (!ciphertext || !nonce || !senderPublicKey || !receiverPrivateKey) {
      throw new Error('All parameters (ciphertext, nonce, senderPublicKey, receiverPrivateKey) are required');
    }
    
    // Convert data from Base64
    const ciphertextBytes = sodium.from_base64(ciphertext);
    const nonceBytes = sodium.from_base64(nonce);
    const senderPublicKeyBytes = sodium.from_base64(senderPublicKey);
    const receiverPrivateKeyBytes = sodium.from_base64(receiverPrivateKey);
    
    // Validate data lengths
    if (nonceBytes.length !== sodium.crypto_box_NONCEBYTES) {
      throw new Error('Invalid nonce length');
    }
    
    if (senderPublicKeyBytes.length !== sodium.crypto_box_PUBLICKEYBYTES) {
      throw new Error('Invalid sender public key length');
    }
    
    if (receiverPrivateKeyBytes.length !== sodium.crypto_box_SECRETKEYBYTES) {
      throw new Error('Invalid receiver private key length');
    }
    
    // Decrypt the message using crypto_box_open_easy
    const decryptedBytes = sodium.crypto_box_open_easy(
      ciphertextBytes,
      nonceBytes,
      senderPublicKeyBytes,
      receiverPrivateKeyBytes
    );
    
    // Convert decrypted bytes back to string
    return sodium.to_string(decryptedBytes);
    
  } catch (error) {
    // crypto_box_open throws on authentication failure
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Decrypt a message using a symmetric session key (crypto_secretbox_open)
 * @param {Object} params - Decryption parameters
 * @param {string} params.ciphertext - Base64 encoded ciphertext
 * @param {string} params.nonce - Base64 encoded nonce
 * @param {string} params.sessionKey - Base64 encoded session key (32 bytes)
 * @returns {Promise<string>} Decrypted plain text message
 */
async function decryptMessageSymmetric({ ciphertext, nonce, sessionKey }) {
  await initializeSodium();
  
  try {
    // Validate inputs
    if (!ciphertext || !nonce || !sessionKey) {
      throw new Error('All parameters (ciphertext, nonce, sessionKey) are required');
    }
    
    // Convert data from Base64
    const ciphertextBytes = sodium.from_base64(ciphertext);
    const nonceBytes = sodium.from_base64(nonce);
    const sessionKeyBytes = sodium.from_base64(sessionKey);
    
    // Validate data lengths
    if (nonceBytes.length !== sodium.crypto_secretbox_NONCEBYTES) {
      throw new Error('Invalid nonce length');
    }
    
    if (sessionKeyBytes.length !== sodium.crypto_secretbox_KEYBYTES) {
      throw new Error('Invalid session key length (must be 32 bytes)');
    }
    
    // Decrypt the message using crypto_secretbox_open_easy
    const decryptedBytes = sodium.crypto_secretbox_open_easy(
      ciphertextBytes,
      nonceBytes,
      sessionKeyBytes
    );
    
    // Convert decrypted bytes back to string
    return sodium.to_string(decryptedBytes);
    
  } catch (error) {
    // crypto_secretbox_open throws on authentication failure
    throw new Error(`Symmetric decryption failed: ${error.message}`);
  }
}

/**
 * Verify message authenticity without decrypting (for additional security)
 * @param {Object} params - Verification parameters
 * @param {string} params.ciphertext - Base64 encoded ciphertext
 * @param {string} params.nonce - Base64 encoded nonce
 * @param {string} params.senderPublicKey - Base64 encoded sender public key
 * @param {string} params.receiverPrivateKey - Base64 encoded receiver private key
 * @returns {Promise<boolean>} True if message is authentic
 */
async function verifyMessage({ ciphertext, nonce, senderPublicKey, receiverPrivateKey }) {
  await initializeSodium();
  
  try {
    // Attempt decryption - if it succeeds, message is authentic
    await decryptMessage({ ciphertext, nonce, senderPublicKey, receiverPrivateKey });
    return true;
  } catch (error) {
    // Decryption failed - message is not authentic
    return false;
  }
}

module.exports = {
  decryptMessage,
  decryptMessageSymmetric,
  verifyMessage
};
