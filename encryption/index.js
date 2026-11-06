/**
 * KMune Encryption Module
 * Main entry point for all encryption functionality
 */

const { generateKeyPair, getPublicKey, getPrivateKeyBytes, validateKey } = require('./keyManager');
const { encryptMessage, encryptMessageSymmetric, generateSessionKey } = require('./encrypt');
const { decryptMessage, decryptMessageSymmetric, verifyMessage } = require('./decrypt');
const { deriveNextKey, deriveRootKey, deriveChainKey, deriveMessageKey, createRatchetState, RatchetState } = require('./ratchet');
const { savePrivateKey, getPrivateKey, deletePrivateKey, hasPrivateKey, encryptForStorage, decryptFromStorage, SecureStorage } = require('./storage');

/**
 * Complete encryption workflow for sending messages
 * @param {Object} params - Workflow parameters
 * @param {string} params.message - Plain text message
 * @param {string} params.receiverPublicKey - Recipient's public key
 * @param {string} params.senderPrivateKey - Sender's private key
 * @param {boolean} [params.useSymmetric=false] - Use symmetric encryption
 * @returns {Promise<Object>} Encrypted message data
 */
async function encryptWorkflow({ message, receiverPublicKey, senderPrivateKey, useSymmetric = false }) {
  try {
    if (useSymmetric) {
      // Symmetric encryption workflow
      const sessionKey = await generateSessionKey();
      const encrypted = await encryptMessageSymmetric({ message, sessionKey });
      
      return {
        type: 'symmetric',
        sessionKey,
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce
      };
    } else {
      // Asymmetric encryption workflow
      const encrypted = await encryptMessage({ message, receiverPublicKey, senderPrivateKey });
      
      return {
        type: 'asymmetric',
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce
      };
    }
  } catch (error) {
    throw new Error(`Encryption workflow failed: ${error.message}`);
  }
}

/**
 * Complete decryption workflow for receiving messages
 * @param {Object} params - Workflow parameters
 * @param {Object} params.encryptedData - Encrypted message data
 * @param {string} params.encryptedData.type - Encryption type ('symmetric' or 'asymmetric')
 * @param {string} params.encryptedData.ciphertext - Encrypted message
 * @param {string} params.encryptedData.nonce - Nonce
 * @param {string} [params.encryptedData.sessionKey] - Session key for symmetric encryption
 * @param {string} params.senderPublicKey - Sender's public key
 * @param {string} params.receiverPrivateKey - Receiver's private key
 * @returns {Promise<string>} Decrypted plain text message
 */
async function decryptWorkflow({ encryptedData, senderPublicKey, receiverPrivateKey }) {
  try {
    if (encryptedData.type === 'symmetric') {
      // Symmetric decryption workflow
      return await decryptMessageSymmetric({
        ciphertext: encryptedData.ciphertext,
        nonce: encryptedData.nonce,
        sessionKey: encryptedData.sessionKey
      });
    } else {
      // Asymmetric decryption workflow
      return await decryptMessage({
        ciphertext: encryptedData.ciphertext,
        nonce: encryptedData.nonce,
        senderPublicKey,
        receiverPrivateKey
      });
    }
  } catch (error) {
    throw new Error(`Decryption workflow failed: ${error.message}`);
  }
}

/**
 * Initialize user encryption setup
 * @param {string} userId - User identifier
 * @param {string} [password] - Optional password for key storage
 * @returns {Promise<Object>} User encryption setup
 */
async function initializeUser(userId, password = null) {
  try {
    // Generate key pair
    const keyPair = await generateKeyPair();
    
    // Save private key securely
    await savePrivateKey(keyPair.privateKey, userId, password);
    
    return {
      userId,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey, // Return for immediate use (caller should handle securely)
      hasSecureStorage: true
    };
  } catch (error) {
    throw new Error(`User initialization failed: ${error.message}`);
  }
}

/**
 * Setup secure messaging session between two users
 * @param {Object} params - Session setup parameters
 * @param {string} params.user1Id - First user ID
 * @param {string} params.user1PrivateKey - First user's private key
 * @param {string} params.user2PublicKey - Second user's public key
 * @returns {Promise<Object>} Session setup data
 */
async function setupSecureSession({ user1Id, user1PrivateKey, user2PublicKey }) {
  try {
    // Create ratchet state for forward secrecy
    const initialKey = await generateSessionKey();
    const ratchetState = await createRatchetState(initialKey);
    
    // Get first message key
    const messageKey = await ratchetState.getNextMessageKey(0);
    
    return {
      sessionId: `${user1Id}-${Date.now()}`,
      ratchetState,
      currentMessageKey: messageKey,
      recipientPublicKey: user2PublicKey
    };
  } catch (error) {
    throw new Error(`Session setup failed: ${error.message}`);
  }
}

// Export all modules
module.exports = {
  // Key management
  generateKeyPair,
  getPublicKey,
  getPrivateKeyBytes,
  validateKey,
  
  // Encryption
  encryptMessage,
  encryptMessageSymmetric,
  generateSessionKey,
  
  // Decryption
  decryptMessage,
  decryptMessageSymmetric,
  verifyMessage,
  
  // Ratchet
  deriveNextKey,
  deriveRootKey,
  deriveChainKey,
  deriveMessageKey,
  createRatchetState,
  RatchetState,
  
  // Storage
  savePrivateKey,
  getPrivateKey,
  deletePrivateKey,
  hasPrivateKey,
  encryptForStorage,
  decryptFromStorage,
  SecureStorage,
  
  // High-level workflows
  encryptWorkflow,
  decryptWorkflow,
  initializeUser,
  setupSecureSession
};
