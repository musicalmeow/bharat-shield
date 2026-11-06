# KMune Encryption Module

A secure end-to-end encryption module for the KMune messaging application, built with libsodium-wrappers for maximum security and compatibility.

## Features

- **Asymmetric Encryption** - Public/private key cryptography using X25519
- **Symmetric Encryption** - AES-256-GCM equivalent using XChaCha20-Poly1305
- **Key Ratchet** - Forward secrecy through key rotation
- **Secure Storage** - Encrypted key storage with password protection
- **Message Verification** - Authentication and integrity checking
- **Base64 Encoding** - Safe transport and storage format

## Security Features

- **Zero Knowledge** - Private keys never exposed unnecessarily
- **Perfect Forward Secrecy** - Key rotation ensures past messages remain secure
- **Authentication** - All messages are authenticated and tamper-proof
- **Secure Random** - Cryptographically secure random number generation
- **Constant-time** - Operations designed to prevent timing attacks

## Installation

```bash
npm install libsodium-wrappers
```

## Usage

### Basic Key Management

```javascript
const crypto = require('./index.js');

// Generate key pair
const keyPair = await crypto.generateKeyPair();
console.log('Public Key:', keyPair.publicKey);
console.log('Private Key:', keyPair.privateKey); // Keep this secret!

// Validate keys
const isValid = await crypto.validateKey(keyPair.publicKey, 'public');
```

### Asymmetric Encryption

```javascript
// Alice sends message to Bob
const encrypted = await crypto.encryptMessage({
  message: 'Hello Bob!',
  receiverPublicKey: bobPublicKey,
  senderPrivateKey: alicePrivateKey
});

// Bob decrypts message
const decrypted = await crypto.decryptMessage({
  ciphertext: encrypted.ciphertext,
  nonce: encrypted.nonce,
  senderPublicKey: alicePublicKey,
  receiverPrivateKey: bobPrivateKey
});
```

### Symmetric Encryption

```javascript
// Generate session key
const sessionKey = await crypto.generateSessionKey();

// Encrypt with session key
const encrypted = await crypto.encryptMessageSymmetric({
  message: 'Secret message',
  sessionKey
});

// Decrypt with session key
const decrypted = await crypto.decryptMessageSymmetric({
  ciphertext: encrypted.ciphertext,
  nonce: encrypted.nonce,
  sessionKey
});
```

### Key Ratchet (Forward Secrecy)

```javascript
// Create ratchet state
const ratchetState = await crypto.createRatchetState(initialKey);

// Derive next key
const nextKey = await crypto.deriveNextKey(currentKey);

// Get message key from ratchet
const messageKey = await ratchetState.getNextMessageKey(0);
```

### Secure Storage

```javascript
// Save private key securely
await crypto.savePrivateKey(privateKey, userId, password);

// Retrieve private key
const retrievedKey = await crypto.getPrivateKey(userId, password);

// Check if key exists
const hasKey = await crypto.hasPrivateKey(userId);
```

### Complete Workflow

```javascript
// Initialize user
const userSetup = await crypto.initializeUser(userId, password);

// Setup secure session
const session = await crypto.setupSecureSession({
  user1Id: 'alice',
  user1PrivateKey: alicePrivateKey,
  user2PublicKey: bobPublicKey
});

// Encrypt and decrypt in workflow
const encryptedWorkflow = await crypto.encryptWorkflow({
  message: 'Secret message',
  receiverPublicKey: bobPublicKey,
  senderPrivateKey: alicePrivateKey
});

const decryptedWorkflow = await crypto.decryptWorkflow({
  encryptedData: encryptedWorkflow,
  senderPublicKey: alicePublicKey,
  receiverPrivateKey: bobPrivateKey
});
```

## API Reference

### Key Management

- `generateKeyPair()` - Generate new public/private key pair
- `getPublicKey(privateKey)` - Extract public key from private key
- `validateKey(key, type)` - Validate key format
- `getPrivateKeyBytes(privateKey)` - Get private key as bytes

### Encryption

- `encryptMessage(params)` - Asymmetric encryption
- `encryptMessageSymmetric(params)` - Symmetric encryption
- `generateSessionKey()` - Generate random session key

### Decryption

- `decryptMessage(params)` - Asymmetric decryption
- `decryptMessageSymmetric(params)` - Symmetric decryption
- `verifyMessage(params)` - Verify message authenticity

### Key Ratchet

- `deriveNextKey(previousKey, context)` - Derive next key in chain
- `deriveRootKey(initialKey)` - Derive root key
- `deriveChainKey(rootKey, index)` - Derive chain key
- `deriveMessageKey(chainKey, index)` - Derive message key
- `createRatchetState(initialKey)` - Create ratchet state

### Storage

- `savePrivateKey(key, userId, password)` - Save private key securely
- `getPrivateKey(userId, password)` - Retrieve private key
- `deletePrivateKey(userId)` - Delete private key
- `hasPrivateKey(userId)` - Check if key exists

## Security Considerations

1. **Private Keys** - Never expose private keys in logs or client-side code
2. **Random Generation** - Always use cryptographically secure random generation
3. **Key Storage** - Use secure storage for private keys in production
4. **Forward Secrecy** - Implement key ratcheting for long-term conversations
5. **Message Verification** - Always verify message authenticity

## Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite covers:
- Key generation and validation
- Asymmetric encryption/decryption
- Symmetric encryption/decryption
- Key ratchet functionality
- Secure storage operations
- Complete workflows
- Error handling
- Message verification

## Dependencies

- `libsodium-wrappers` - Cryptographic library

## License

MIT License

## Security Audit

This module uses industry-standard cryptographic primitives:
- X25519 for key exchange
- XChaCha20-Poly1305 for symmetric encryption
- BLAKE2b for hashing
- Cryptographically secure random generation

All operations are constant-time where possible to prevent timing attacks.
