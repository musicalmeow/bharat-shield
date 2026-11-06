const sodium = require('libsodium-wrappers');

/**
 * Key Ratchet Module
 * Implements forward secrecy through key rotation
 */

async function initializeSodium() {
  if (!sodium.ready) {
    await sodium.ready;
  }
}

/**
 * Derive the next key in the ratchet chain
 * Uses hash-based key derivation for forward secrecy
 * @param {string} previousKey - Base64 encoded previous key
 * @param {string} [context] - Optional context string for additional entropy
 * @returns {Promise<string>} Base64 encoded new key
 */
async function deriveNextKey(previousKey, context = '') {
  await initializeSodium();
  
  try {
    // Validate input
    if (!previousKey || typeof previousKey !== 'string') {
      throw new Error('Previous key is required and must be a string');
    }
    
    // Convert previous key from Base64
    const previousKeyBytes = sodium.from_base64(previousKey);
    
    // Create context for additional entropy
    const contextBytes = sodium.from_string(context);
    const timestampBytes = sodium.from_string(Date.now().toString());
    
    // Combine previous key, context, and timestamp
    const combinedData = new Uint8Array(
      previousKeyBytes.length + contextBytes.length + timestampBytes.length
    );
    combinedData.set(previousKeyBytes, 0);
    combinedData.set(contextBytes, previousKeyBytes.length);
    combinedData.set(timestampBytes, previousKeyBytes.length + contextBytes.length);
    
    // Hash the combined data to derive new key
    const newKeyHash = sodium.crypto_generichash(32, combinedData);
    
    return sodium.to_base64(newKeyHash);
    
  } catch (error) {
    throw new Error(`Key derivation failed: ${error.message}`);
  }
}

/**
 * Derive a root key from an initial key
 * Used for initializing the ratchet chain
 * @param {string} initialKey - Base64 encoded initial key
 * @returns {Promise<string>} Base64 encoded root key
 */
async function deriveRootKey(initialKey) {
  await initializeSodium();
  
  try {
    // Validate input
    if (!initialKey || typeof initialKey !== 'string') {
      throw new Error('Initial key is required and must be a string');
    }
    
    // Convert initial key from Base64
    const initialKeyBytes = sodium.from_base64(initialKey);
    
    // Add root key context
    const contextBytes = sodium.from_string('root_key');
    
    // Combine initial key with context
    const combinedData = new Uint8Array(initialKeyBytes.length + contextBytes.length);
    combinedData.set(initialKeyBytes, 0);
    combinedData.set(contextBytes, initialKeyBytes.length);
    
    // Hash to derive root key
    const rootKeyHash = sodium.crypto_generichash(32, combinedData);
    
    return sodium.to_base64(rootKeyHash);
    
  } catch (error) {
    throw new Error(`Root key derivation failed: ${error.message}`);
  }
}

/**
 * Derive a chain key from a root key
 * Used for message-specific keys
 * @param {string} rootKey - Base64 encoded root key
 * @param {number} chainIndex - Index in the chain (for multiple chains)
 * @returns {Promise<string>} Base64 encoded chain key
 */
async function deriveChainKey(rootKey, chainIndex = 0) {
  await initializeSodium();
  
  try {
    // Validate input
    if (!rootKey || typeof rootKey !== 'string') {
      throw new Error('Root key is required and must be a string');
    }
    
    if (typeof chainIndex !== 'number' || chainIndex < 0) {
      throw new Error('Chain index must be a non-negative number');
    }
    
    // Convert root key from Base64
    const rootKeyBytes = sodium.from_base64(rootKey);
    
    // Create chain context
    const contextBytes = sodium.from_string(`chain_${chainIndex}`);
    
    // Combine root key with chain context
    const combinedData = new Uint8Array(rootKeyBytes.length + contextBytes.length);
    combinedData.set(rootKeyBytes, 0);
    combinedData.set(contextBytes, rootKeyBytes.length);
    
    // Hash to derive chain key
    const chainKeyHash = sodium.crypto_generichash(32, combinedData);
    
    return sodium.to_base64(chainKeyHash);
    
  } catch (error) {
    throw new Error(`Chain key derivation failed: ${error.message}`);
  }
}

/**
 * Derive a message key from a chain key
 * Used for individual message encryption
 * @param {string} chainKey - Base64 encoded chain key
 * @param {number} messageIndex - Index of the message in the chain
 * @returns {Promise<string>} Base64 encoded message key
 */
async function deriveMessageKey(chainKey, messageIndex = 0) {
  await initializeSodium();
  
  try {
    // Validate input
    if (!chainKey || typeof chainKey !== 'string') {
      throw new Error('Chain key is required and must be a string');
    }
    
    if (typeof messageIndex !== 'number' || messageIndex < 0) {
      throw new Error('Message index must be a non-negative number');
    }
    
    // Convert chain key from Base64
    const chainKeyBytes = sodium.from_base64(chainKey);
    
    // Create message context
    const contextBytes = sodium.from_string(`message_${messageIndex}`);
    
    // Combine chain key with message context
    const combinedData = new Uint8Array(chainKeyBytes.length + contextBytes.length);
    combinedData.set(chainKeyBytes, 0);
    combinedData.set(contextBytes, chainKeyBytes.length);
    
    // Hash to derive message key
    const messageKeyHash = sodium.crypto_generichash(32, combinedData);
    
    return sodium.to_base64(messageKeyHash);
    
  } catch (error) {
    throw new Error(`Message key derivation failed: ${error.message}`);
  }
}

/**
 * Ratchet state management
 * Tracks the current state of the ratchet chain
 */
class RatchetState {
  constructor(rootKey) {
    this.rootKey = rootKey;
    this.chainKeys = new Map(); // chainIndex -> chainKey
    this.messageIndices = new Map(); // chainIndex -> messageIndex
    this.nextChainIndex = 0;
  }

  /**
   * Get or create a chain key for the given index
   * @param {number} chainIndex - Chain index
   * @returns {Promise<string>} Chain key
   */
  async getChainKey(chainIndex) {
    if (this.chainKeys.has(chainIndex)) {
      return this.chainKeys.get(chainIndex);
    }

    const chainKey = await deriveChainKey(this.rootKey, chainIndex);
    this.chainKeys.set(chainIndex, chainKey);
    this.messageIndices.set(chainIndex, 0);
    return chainKey;
  }

  /**
   * Get the next message key for the given chain
   * @param {number} chainIndex - Chain index
   * @returns {Promise<string>} Message key
   */
  async getNextMessageKey(chainIndex) {
    const chainKey = await this.getChainKey(chainIndex);
    const messageIndex = this.messageIndices.get(chainIndex) || 0;
    
    const messageKey = await deriveMessageKey(chainKey, messageIndex);
    
    // Update message index
    this.messageIndices.set(chainIndex, messageIndex + 1);
    
    return messageKey;
  }

  /**
   * Advance to the next chain
   * @returns {Promise<string>} New chain key
   */
  async advanceChain() {
    const chainIndex = this.nextChainIndex++;
    return await this.getChainKey(chainIndex);
  }
}

/**
 * Create a new ratchet state
 * @param {string} initialKey - Base64 encoded initial key
 * @returns {Promise<RatchetState>} Ratchet state instance
 */
async function createRatchetState(initialKey) {
  const rootKey = await deriveRootKey(initialKey);
  return new RatchetState(rootKey);
}

module.exports = {
  deriveNextKey,
  deriveRootKey,
  deriveChainKey,
  deriveMessageKey,
  createRatchetState,
  RatchetState
};
