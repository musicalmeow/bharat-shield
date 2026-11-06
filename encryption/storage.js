const sodium = require('libsodium-wrappers');

/**
 * Secure Storage Module
 * Handles secure storage and retrieval of private keys
 */

async function initializeSodium() {
  if (!sodium.ready) {
    await sodium.ready;
  }
}

/**
 * In-memory secure storage cache
 * In production, this should be replaced with platform-specific secure storage
 */
const secureCache = new Map();

/**
 * Encrypt data for secure storage
 * @param {string} data - Data to encrypt
 * @param {string} password - Password for encryption (used as key)
 * @returns {Promise<string>} Base64 encrypted data
 */
async function encryptForStorage(data, password) {
  await initializeSodium();
  
  try {
    if (!data || !password) {
      throw new Error('Data and password are required');
    }
    
    // Simple key derivation from password (hash it to get 32 bytes)
    const passwordBytes = sodium.from_string(password);
    const key = sodium.crypto_generichash(32, passwordBytes);
    
    // Generate nonce
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    
    // Encrypt data
    const dataBytes = sodium.from_string(data);
    const encrypted = sodium.crypto_secretbox_easy(dataBytes, nonce, key);
    
    // Combine nonce + encrypted data
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce, 0);
    combined.set(encrypted, nonce.length);
    
    return sodium.to_base64(combined);
    
  } catch (error) {
    throw new Error(`Storage encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt data from secure storage
 * @param {string} encryptedData - Base64 encrypted data
 * @param {string} password - Password for decryption
 * @returns {Promise<string>} Decrypted data
 */
async function decryptFromStorage(encryptedData, password) {
  await initializeSodium();
  
  try {
    if (!encryptedData || !password) {
      throw new Error('Encrypted data and password are required');
    }
    
    // Parse combined data
    const combined = sodium.from_base64(encryptedData);
    
    // Extract nonce and encrypted data
    const nonceBytes = sodium.crypto_secretbox_NONCEBYTES;
    
    const nonce = combined.slice(0, nonceBytes);
    const encrypted = combined.slice(nonceBytes);
    
    // Simple key derivation from password (same as encryption)
    const passwordBytes = sodium.from_string(password);
    const key = sodium.crypto_generichash(32, passwordBytes);
    
    // Decrypt data
    const decrypted = sodium.crypto_secretbox_open_easy(encrypted, nonce, key);
    
    return sodium.to_string(decrypted);
    
  } catch (error) {
    throw new Error(`Storage decryption failed: ${error.message}`);
  }
}

/**
 * Save private key securely
 * @param {string} privateKey - Base64 encoded private key
 * @param {string} userId - User identifier
 * @param {string} [password] - Optional password for encryption
 * @returns {Promise<boolean>} True if saved successfully
 */
async function savePrivateKey(privateKey, userId, password = null) {
  try {
    if (!privateKey || !userId) {
      throw new Error('Private key and user ID are required');
    }
    
    let dataToStore = privateKey;
    
    // Encrypt if password provided
    if (password) {
      dataToStore = await encryptForStorage(privateKey, password);
    }
    
    // In production, use platform-specific secure storage
    // For now, we'll use in-memory storage (not secure for production)
    secureCache.set(`private_key_${userId}`, dataToStore);
    
    // Simulate persistent storage (in production, use secure platform storage)
    if (typeof localStorage !== 'undefined') {
      // WARNING: This is NOT secure for production!
      // Only for development/testing
      localStorage.setItem(`secure_private_key_${userId}`, dataToStore);
    }
    
    return true;
    
  } catch (error) {
    console.error('Failed to save private key:', error);
    return false;
  }
}

/**
 * Retrieve private key securely
 * @param {string} userId - User identifier
 * @param {string} [password] - Optional password for decryption
 * @returns {Promise<string|null>} Base64 encoded private key or null if not found
 */
async function getPrivateKey(userId, password = null) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Try in-memory cache first
    let storedData = secureCache.get(`private_key_${userId}`);
    
    // Fallback to localStorage (development only)
    if (!storedData && typeof localStorage !== 'undefined') {
      storedData = localStorage.getItem(`secure_private_key_${userId}`);
    }
    
    if (!storedData) {
      return null;
    }
    
    // Decrypt if password provided
    if (password) {
      return await decryptFromStorage(storedData, password);
    }
    
    return storedData;
    
  } catch (error) {
    console.error('Failed to retrieve private key:', error);
    return null;
  }
}

/**
 * Delete private key from storage
 * @param {string} userId - User identifier
 * @returns {Promise<boolean>} True if deleted successfully
 */
async function deletePrivateKey(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Remove from in-memory cache
    secureCache.delete(`private_key_${userId}`);
    
    // Remove from localStorage (development only)
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`secure_private_key_${userId}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Failed to delete private key:', error);
    return false;
  }
}

/**
 * Check if private key exists for user
 * @param {string} userId - User identifier
 * @returns {Promise<boolean>} True if key exists
 */
async function hasPrivateKey(userId) {
  try {
    if (!userId) {
      return false;
    }
    
    // Check in-memory cache
    if (secureCache.has(`private_key_${userId}`)) {
      return true;
    }
    
    // Check localStorage (development only)
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(`secure_private_key_${userId}`) !== null;
    }
    
    return false;
    
  } catch (error) {
    console.error('Failed to check private key existence:', error);
    return false;
  }
}

/**
 * Platform-specific secure storage abstraction
 * In production, implement platform-specific secure storage here
 */
const SecureStorage = {
  /**
   * Initialize secure storage for the platform
   * @returns {Promise<void>}
   */
  async initialize() {
    // Platform-specific initialization
    // - iOS: Keychain Services
    // - Android: Android Keystore
    // - Web: IndexedDB with encryption
    // - Node.js: File system with encryption
    
    console.log('Secure storage initialized (development mode)');
  },

  /**
   * Store data securely
   * @param {string} key - Storage key
   * @param {string} data - Data to store
   * @returns {Promise<boolean>} Success status
   */
  async set(key, data) {
    // Platform-specific secure storage implementation
    return await savePrivateKey(data, key);
  },

  /**
   * Retrieve data securely
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} Retrieved data
   */
  async get(key) {
    // Platform-specific secure storage implementation
    return await getPrivateKey(key);
  },

  /**
   * Delete data securely
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    // Platform-specific secure storage implementation
    return await deletePrivateKey(key);
  }
};

module.exports = {
  savePrivateKey,
  getPrivateKey,
  deletePrivateKey,
  hasPrivateKey,
  encryptForStorage,
  decryptFromStorage,
  SecureStorage
};
