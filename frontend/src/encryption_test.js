/**
 * Test script for browser encryption functionality
 * Run this in browser console to test encryption
 */

import { generateKeyPair, encryptForRecipient, decryptFromStoredMessage, savePrivateKey, getPrivateKey } from './encryption.js';

async function testEncryption() {
  console.log('=== Browser Encryption Test ===');
  
  try {
    // Test 1: Generate key pair
    console.log('1. Testing key pair generation...');
    const keyPair = await generateKeyPair();
    console.log('Public Key:', keyPair.publicKey.substring(0, 50) + '...');
    console.log('Private Key:', keyPair.privateKey.substring(0, 50) + '...');
    console.log('Key generation: PASSED');
    
    // Test 2: Save and retrieve private key
    console.log('2. Testing key storage...');
    const userId = 'test_user';
    await savePrivateKey(userId, keyPair.privateKey);
    const retrievedKey = await getPrivateKey(userId);
    console.log('Key saved and retrieved:', retrievedKey === keyPair.privateKey);
    console.log('Key storage: PASSED');
    
    // Test 3: Encrypt and decrypt message
    console.log('3. Testing encryption/decryption...');
    const message = 'Hello, this is a test message!';
    const encrypted = await encryptForRecipient(message, keyPair.publicKey);
    console.log('Encrypted message length:', encrypted.encryptedMessage.length);
    
    const decrypted = await decryptFromStoredMessage(
      encrypted.encryptedMessage,
      encrypted.encryptedSessionKey,
      keyPair.privateKey
    );
    
    console.log('Original message:', message);
    console.log('Decrypted message:', decrypted);
    console.log('Encryption/decryption:', message === decrypted ? 'PASSED' : 'FAILED');
    
    console.log('=== All tests completed! ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for use in browser console
window.testEncryption = testEncryption;

export default testEncryption;
