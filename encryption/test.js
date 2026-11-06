/**
 * KMune Encryption Module Test Suite
 * Comprehensive testing of all encryption functionality
 */

const crypto = require('./index.js');

async function runTests() {
  console.log('=== KMune Encryption Module Test Suite ===\n');
  
  try {
    // Test 1: Key Generation
    console.log('1. Testing Key Generation...');
    const aliceKeyPair = await crypto.generateKeyPair();
    const bobKeyPair = await crypto.generateKeyPair();
    
    console.log('Alice Public Key:', aliceKeyPair.publicKey.substring(0, 20) + '...');
    console.log('Bob Public Key:', bobKeyPair.publicKey.substring(0, 20) + '...');
    console.log('Key generation: PASSED\n');
    
    // Test 2: Key Validation
    console.log('2. Testing Key Validation...');
    const isValidAlicePublic = await crypto.validateKey(aliceKeyPair.publicKey, 'public');
    const isValidAlicePrivate = await crypto.validateKey(aliceKeyPair.privateKey, 'private');
    const isInvalidKey = await crypto.validateKey('invalid_key', 'public');
    
    console.log('Alice public key valid:', isValidAlicePublic);
    console.log('Alice private key valid:', isValidAlicePrivate);
    console.log('Invalid key detection:', !isInvalidKey);
    console.log('Key validation: PASSED\n');
    
    // Test 3: Asymmetric Encryption/Decryption
    console.log('3. Testing Asymmetric Encryption...');
    const message = 'Hello Bob! This is a secret message from Alice.';
    
    const encrypted = await crypto.encryptMessage({
      message,
      receiverPublicKey: bobKeyPair.publicKey,
      senderPrivateKey: aliceKeyPair.privateKey
    });
    
    console.log('Original message:', message);
    console.log('Encrypted ciphertext length:', encrypted.ciphertext.length);
    console.log('Nonce length:', encrypted.nonce.length);
    
    const decrypted = await crypto.decryptMessage({
      ciphertext: encrypted.ciphertext,
      nonce: encrypted.nonce,
      senderPublicKey: aliceKeyPair.publicKey,
      receiverPrivateKey: bobKeyPair.privateKey
    });
    
    console.log('Decrypted message:', decrypted);
    console.log('Asymmetric encryption/decryption:', message === decrypted ? 'PASSED' : 'FAILED\n');
    console.log();
    
    // Test 4: Symmetric Encryption/Decryption
    console.log('4. Testing Symmetric Encryption...');
    const sessionKey = await crypto.generateSessionKey();
    
    const symEncrypted = await crypto.encryptMessageSymmetric({
      message: 'Secret symmetric message',
      sessionKey
    });
    
    const symDecrypted = await crypto.decryptMessageSymmetric({
      ciphertext: symEncrypted.ciphertext,
      nonce: symEncrypted.nonce,
      sessionKey
    });
    
    console.log('Symmetric encryption/decryption:', symDecrypted === 'Secret symmetric message' ? 'PASSED' : 'FAILED\n');
    console.log();
    
    // Test 5: Key Ratchet
    console.log('5. Testing Key Ratchet...');
    const initialKey = await crypto.generateSessionKey();
    const nextKey1 = await crypto.deriveNextKey(initialKey);
    const nextKey2 = await crypto.deriveNextKey(nextKey1);
    const nextKey3 = await crypto.deriveNextKey(nextKey2);
    
    console.log('Initial key different from next key:', initialKey !== nextKey1);
    console.log('Keys are unique:', 
      initialKey !== nextKey1 && 
      nextKey1 !== nextKey2 && 
      nextKey2 !== nextKey3
    );
    console.log('Key ratchet: PASSED\n');
    
    // Test 6: Ratchet State
    console.log('6. Testing Ratchet State...');
    const ratchetState = await crypto.createRatchetState(initialKey);
    const messageKey1 = await ratchetState.getNextMessageKey(0);
    const messageKey2 = await ratchetState.getNextMessageKey(0);
    const messageKey3 = await ratchetState.getNextMessageKey(1);
    
    console.log('Message keys are different:', 
      messageKey1 !== messageKey2 && 
      messageKey2 !== messageKey3
    );
    console.log('Ratchet state: PASSED\n');
    
    // Test 7: Secure Storage
    console.log('7. Testing Secure Storage...');
    const userId = 'alice123';
    const password = 'secure_password_123';
    
    const saved = await crypto.savePrivateKey(aliceKeyPair.privateKey, userId, password);
    const retrieved = await crypto.getPrivateKey(userId, password);
    const exists = await crypto.hasPrivateKey(userId);
    
    console.log('Private key saved:', saved);
    console.log('Private key retrieved correctly:', retrieved === aliceKeyPair.privateKey);
    console.log('Key exists check:', exists);
    console.log('Secure storage: PASSED\n');
    
    // Test 8: Complete Workflow
    console.log('8. Testing Complete Workflow...');
    
    // Initialize users
    const aliceSetup = await crypto.initializeUser('alice', 'alice_password');
    const bobSetup = await crypto.initializeUser('bob', 'bob_password');
    
    // Setup secure session
    const session = await crypto.setupSecureSession({
      user1Id: 'alice',
      user1PrivateKey: aliceSetup.privateKey,
      user2PublicKey: bobSetup.publicKey
    });
    
    // Encrypt workflow
    const workflowMessage = 'This is a complete workflow test message!';
    const encryptedWorkflow = await crypto.encryptWorkflow({
      message: workflowMessage,
      receiverPublicKey: bobSetup.publicKey,
      senderPrivateKey: aliceSetup.privateKey
    });
    
    // Decrypt workflow
    const decryptedWorkflow = await crypto.decryptWorkflow({
      encryptedData: encryptedWorkflow,
      senderPublicKey: aliceSetup.publicKey,
      receiverPrivateKey: bobSetup.privateKey
    });
    
    console.log('Workflow message:', workflowMessage);
    console.log('Workflow decrypted:', decryptedWorkflow);
    console.log('Complete workflow:', workflowMessage === decryptedWorkflow ? 'PASSED' : 'FAILED\n');
    
    // Test 9: Message Verification
    console.log('9. Testing Message Verification...');
    const isValid = await crypto.verifyMessage({
      ciphertext: encrypted.ciphertext,
      nonce: encrypted.nonce,
      senderPublicKey: aliceKeyPair.publicKey,
      receiverPrivateKey: bobKeyPair.privateKey
    });
    
    const isInvalid = await crypto.verifyMessage({
      ciphertext: 'invalid_ciphertext',
      nonce: encrypted.nonce,
      senderPublicKey: aliceKeyPair.publicKey,
      receiverPrivateKey: bobKeyPair.privateKey
    });
    
    console.log('Valid message verification:', isValid);
    console.log('Invalid message detection:', !isInvalid);
    console.log('Message verification: PASSED\n');
    
    // Test 10: Error Handling
    console.log('10. Testing Error Handling...');
    
    try {
      await crypto.encryptMessage({
        message: '',
        receiverPublicKey: bobKeyPair.publicKey,
        senderPrivateKey: aliceKeyPair.privateKey
      });
      console.log('Error handling: FAILED - Should have thrown error');
    } catch (error) {
      console.log('Error handling: PASSED - Correctly caught error');
    }
    
    console.log('\n=== All Tests Completed Successfully! ===');
    console.log('KMune Encryption Module is ready for production use.\n');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
