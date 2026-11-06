const sodium = require('libsodium-wrappers');

/**
 * Encryption Module
 * Handles message encryption using libsodium crypto_box
 */

async function initializeSodium() {
  if (!sodium.ready) {
    await sodium.ready;
  }
}

/**
 * Encrypt a message using recipient's public key and sender's private key
 * @param {Object} params - Encryption parameters
 * @param {string} params.message - Plain text message to encrypt
 * @param {string} params.receiverPublicKey - Base64 encoded recipient public key
 * @param {string} params.senderPrivateKey - Base64 encoded sender private key
 * @returns {Promise<{ciphertext: string, nonce: string}>} Encrypted data
 */
async function encryptMessage({ message, receiverPublicKey, senderPrivateKey }) {
  await initializeSodium();
  
  try {
    // Validate inputs
    if (!message || typeof message !== 'string') {
      throw new Error('Message must be a non-empty string');
    }
    
    if (!receiverPublicKey || !senderPrivateKey) {
      throw new Error('Both receiver public key and sender private key are required');
    }
    
    // Convert keys from Base64
    const recipientPublicKeyBytes = sodium.from_base64(receiverPublicKey);
    const senderPrivateKeyBytes = sodium.from_base64(senderPrivateKey);
    
    // Validate key lengths
    if (recipientPublicKeyBytes.length !== sodium.crypto_box_PUBLICKEYBYTES) {
      throw new Error('Invalid recipient public key length');
    }
    
    if (senderPrivateKeyBytes.length !== sodium.crypto_box_SECRETKEYBYTES) {
      throw new Error('Invalid sender private key length');
    }
    
    // Generate a unique nonce for this message
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    
    // Convert message to bytes
    const messageBytes = sodium.from_string(message);
    
    // Encrypt the message using crypto_box_easy (asymmetric encryption)
    const ciphertext = sodium.crypto_box_easy(
      messageBytes,
      nonce,
      recipientPublicKeyBytes,
      senderPrivateKeyBytes
    );
    
    return {
      ciphertext: sodium.to_base64(ciphertext),
      nonce: sodium.to_base64(nonce)
    };
    
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Encrypt a message using a symmetric session key (crypto_secretbox)
 * @param {Object} params - Encryption parameters
 * @param {string} params.message - Plain text message to encrypt
 * @param {string} params.sessionKey - Base64 encoded session key (32 bytes)
 * @returns {Promise<{ciphertext: string, nonce: string}>} Encrypted data
 */
async function encryptMessageSymmetric({ message, sessionKey }) {
  await initializeSodium();
  
  try {
    // Validate inputs
    if (!message || typeof message !== 'string') {
      throw new Error('Message must be a non-empty string');
    }
    
    if (!sessionKey) {
      throw new Error('Session key is required');
    }
    
    // Convert session key from Base64
    const sessionKeyBytes = sodium.from_base64(sessionKey);
    
    // Validate key length (must be 32 bytes for crypto_secretbox)
    if (sessionKeyBytes.length !== sodium.crypto_secretbox_KEYBYTES) {
      throw new Error('Invalid session key length (must be 32 bytes)');
    }
    
    // Generate a unique nonce for this message
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    
    // Convert message to bytes
    const messageBytes = sodium.from_string(message);
    
    // Encrypt the message using crypto_secretbox_easy (symmetric encryption)
    const ciphertext = sodium.crypto_secretbox_easy(
      messageBytes,
      nonce,
      sessionKeyBytes
    );
    
    return {
      ciphertext: sodium.to_base64(ciphertext),
      nonce: sodium.to_base64(nonce)
    };
    
  } catch (error) {
    throw new Error(`Symmetric encryption failed: ${error.message}`);
  }
}

/**
 * Generate a random session key for symmetric encryption
 * @returns {Promise<string>} Base64 encoded 32-byte session key
 */
async function generateSessionKey() {
  await initializeSodium();
  
  try {
    const sessionKey = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    return sodium.to_base64(sessionKey);
  } catch (error) {
    throw new Error(`Failed to generate session key: ${error.message}`);
  }
}

module.exports = {
  encryptMessage,
  encryptMessageSymmetric,
  generateSessionKey
};
