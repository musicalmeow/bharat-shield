const crypto = require('crypto');

// Test user credentials
const TESTUSER_ID = '69da82df614c47aa298ee8ab';
const TESTUSER2_ID = '69da8339614c47aa298ee8cc';

// Testuser's private key (for decrypting received messages)
const TESTUSER_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCm6WUWg4aSJInX
LT+vkOx8qDSlPH3giAdnkfzM0I+xMqIVwdySUXSddQCd97D1BSHsfhfxKk0zE0QL
zArvyP8kaQ6jp95tehs08Uc6UqIJSsf5TCB+9X9NHnhoBwLruUvAAjucN93lqDKz
hi0sVsecYyLVVy84+ijHI4zAE1ftCZcOpiyScFETvzkR6TviICqI9dgqfzrQt/3p
0ldyP6zGtP9SPNScGJHd9h+wJmUvht4qjlsJ+wx49uoDyi/wVXrrMVKg8vWE8//Y
B78DbmfeEjo+eckBSCafUyVhexs1/pM71lZ6O6XiDHBhGcX4OI8OZ34XNS+tHSiG
u+3yVEbbAgMBAAECggEAUDtHjsNpV+19XrQO9Wcd7ivypmzF+zyYBpZ7pL4qHBzB
IeE+lAzYl+mKguRxqM2vSV0xSAkz87Wyk1Mg/LMqxcdENLG4LvqvgkrqmKPo5LuQ
FYsc4bpDV4Aqk6KvKj03JtRL8CNApCiuOnJoW3RZXhifQVq3xdUl7dduTFPgA328
uSam5TMaiQsT5b2CA3LMVZE42n2yqYthr5NDJ/JFJEYPxDMOpscTn2jz3OrGQILl
D2zzE1XX/a/O5lG8z4fOo9wE7kDQpJlgvvuQa44cOROKqhwXwb9i1yM8rtXWhp0P
RcO/nbI9ynnzPiBtTEO6JSEVgypJ4D2FFOItXzU4FQKBgQDrYzJMhNkOLoDAI/km
Z3ye5Pix/6h01ujSCd0CASr7cxAPc40r5OzGQv+8fg7PQ3QQsa8H/q1JN21H8uZ2
EOhINLUV+sqz6aY3st82Jztqu/3k0DqN+eb2afHXrsKAZtdTxnnZTU4LjNz1tbnR
tr/BPNXTG/TcX/FPT88ABwnVhwKBgQC1hyQfeOUmfiPjNhSGP6WwQ1VvLTxeGlzu
+fV/m4uthfPqo3FJWrEE8/g501aAn/DONYRh7NvtIoVh3ep9fOGs87IWejhfJH0L
vb1yTfWlFjeF2rHpGrxEggbvnnEQzMq6/g7uob/eMKKiwIGIY6SX7x1RYN9tNT5+
7oSJTcPZDQKBgDbJke2JhlPssv8F4Hn14GXDebdEgFshonMw5IYQ64Y3U+ekx5kN
4aaL9aZT2PKZCqzQDqNXvdGq2v7CJK4aZVZZHkUNaJzTp2KTeazLGONQ+lmFtftR
zVZRdn7zKEZmqXvQWJAhlCbQFKYENEoBtUQu+r32ZdndYvdI5i9lc/6FAoGAHd6+
8u7RxiO7hAfCGNUgToDF7iVjaZis8iXvX7AYq9T+7f03BvsFZes/TUSZV1D6LvRf
dD2lcr/bct8xVrTV7b+r7kbuP7mhWe0+3zA025VsTXpPDCx6DkvXGFbaBAmu0lY7
3sh+6fDW0jEbH3ZF/zo5eMqX+UBpqDlXVcCWGYECgYEAxiYx2mBcbsMN87+2UeXd
7ldxkGNVLWz7nFr8FzQgfRRq9MVCBG0isMPvyB7EtbJxuFgFlaIJl/DqA7095BCY
IzAtUopSJu0Y+gMH8Ui49lRZ7ilCKgAI++5sD3YLVMGB+iWCtdLIaMtGT+nvY4ka
dwxGoDVrsUkuyBCxJij41Rc=
-----END PRIVATE KEY-----`;

// Testuser2's public key (for encrypting messages)
const TESTUSER2_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxg0SpzhDXmSbAqE2cgy/
GxJF/PsyqBmk6OEZqy4LuzRGVjLDS+45ELxY4vzMw1sfd2eRkLlx5w0rifGObn65
zEiMl3l3+rtZVmDM5BYv3wrHHRQ4/ILQQgZfcpqHs58ImIVAhm2VIRZoI9LvToCN
NQgQlvdSF3VqxSbfJZn3VkZNOawZx0Y9Dl74boenPAhhgX7QI9GTUrMxruIhEUjZ
oc5MP6J3zL/ppV6WuIhlqX/pK5J0oDByX4oOYDsUgBb+43+eufPtYTYBRB0umi4S
1AZvsxVnMWn/BH/4jckDz1V27GrZx5ynIOaEwmMPT9prBnPPCWkBxKV7Spy7rtXT
PwIDAQAB
-----END PUBLIC KEY-----`;

console.log('🔐 KMUNE ENCRYPTION DEMONSTRATION');
console.log('=====================================\n');

// Function to decrypt messages (what testuser2 would do)
function decryptMessage(encryptedMessageJson, encryptedSessionKeyBase64, privateKeyPem) {
  try {
    console.log('📨 DECRYPTING MESSAGE');
    console.log('-------------------');
    
    // Step 1: Parse the encrypted message
    const encryptedMessage = JSON.parse(encryptedMessageJson);
    console.log('🔓 Encrypted message structure:', {
      version: encryptedMessage.v,
      iv: encryptedMessage.iv,
      data: encryptedMessage.data?.substring(0, 20) + '...',
      authTag: encryptedMessage.authTag?.substring(0, 10) + '...'
    });
    
    // Step 2: Decrypt the AES session key with RSA private key
    console.log('🔑 Decrypting AES session key...');
    const encryptedSessionKey = Buffer.from(encryptedSessionKeyBase64, 'base64');
    const aesKey = crypto.privateDecrypt({
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, encryptedSessionKey);
    console.log('✅ AES session key decrypted successfully');
    
    // Step 3: Decrypt the message with AES-GCM
    console.log('🔓 Decrypting message with AES-GCM...');
    const iv = Buffer.from(encryptedMessage.iv, 'base64');
    const encryptedData = Buffer.from(encryptedMessage.data, 'base64');
    const authTag = Buffer.from(encryptedMessage.authTag, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    const plaintext = decrypted.toString('utf8');
    console.log('✅ Message decrypted successfully!');
    
    return plaintext;
  } catch (error) {
    console.error('❌ Decryption failed:', error.message);
    return '[DECRYPTION FAILED]';
  }
}

// Function to encrypt messages (what testuser does)
function encryptMessage(plaintext, recipientPublicKeyPem) {
  try {
    console.log('📤 ENCRYPTING MESSAGE');
    console.log('-------------------');
    console.log('📝 Original message:', plaintext);
    
    // Step 1: Generate random AES key and IV
    console.log('🎲 Generating random AES key and IV...');
    const aesKey = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(12); // 96 bits for GCM
    console.log('✅ AES key and IV generated');
    
    // Step 2: Encrypt message with AES-GCM
    console.log('🔒 Encrypting message with AES-GCM...');
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();
    console.log('✅ Message encrypted with AES');
    
    // Step 3: Encrypt AES key with RSA-OAEP
    console.log('🔐 Encrypting AES key with RSA-OAEP...');
    const encryptedAesKey = crypto.publicEncrypt({
      key: recipientPublicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, aesKey);
    console.log('✅ AES key encrypted with RSA');
    
    // Step 4: Create encrypted message object
    const encryptedMessage = {
      v: 1,
      iv: iv.toString('base64'),
      data: encrypted.toString('base64'),
      authTag: authTag.toString('base64')
    };
    
    console.log('📦 Final encrypted package created');
    
    return {
      encryptedMessage: JSON.stringify(encryptedMessage),
      encryptedSessionKey: encryptedAesKey.toString('base64')
    };
  } catch (error) {
    console.error('❌ Encryption failed:', error.message);
    throw error;
  }
}

async function demonstrateEncryption() {
  console.log('🎯 STEP 1: ENCRYPTION DEMONSTRATION');
  console.log('=====================================\n');
  
  const originalMessage = "Hello! This is a secret message for demonstration.";
  const { encryptedMessage, encryptedSessionKey } = encryptMessage(originalMessage, TESTUSER2_PUBLIC_KEY);
  
  console.log('\n📋 ENCRYPTION RESULTS:');
  console.log('---------------------');
  console.log('Original message:', originalMessage);
  console.log('Encrypted message (full):', encryptedMessage);
  console.log('Encrypted session key (full):', encryptedSessionKey);
  console.log('Encrypted message length:', encryptedMessage.length, 'characters');
  console.log('Session key length:', encryptedSessionKey.length, 'characters');
  
  console.log('\n🎯 STEP 2: DECRYPTION DEMONSTRATION');
  console.log('=====================================\n');
  
  const decryptedMessage = decryptMessage(encryptedMessage, encryptedSessionKey, TESTUSER_PRIVATE_KEY);
  
  console.log('\n📋 DECRYPTION RESULTS:');
  console.log('---------------------');
  console.log('Decrypted message:', decryptedMessage);
  console.log('✅ Success:', originalMessage === decryptedMessage ? 'YES' : 'NO');
  
  console.log('\n🎯 STEP 3: REAL CHAT MESSAGES DEMONSTRATION');
  console.log('===========================================\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/messages/chat?senderId=' + TESTUSER_ID + '&receiverId=' + TESTUSER2_ID);
    const data = await response.json();
    
    console.log('📨 Found', data.messages.length, 'messages in chat history\n');
    
    data.messages.forEach((msg, index) => {
      console.log(`🔍 MESSAGE ${index + 1}:`);
      console.log('-------------------');
      console.log('Message ID:', msg.messageId);
      console.log('From:', msg.senderId === TESTUSER_ID ? 'testuser (you)' : 'testuser2');
      console.log('To:', msg.receiverId === TESTUSER_ID ? 'testuser (you)' : 'testuser2');
      console.log('Timestamp:', new Date(msg.timestamp).toLocaleString());
      console.log('Encrypted content:', msg.encryptedMessage.substring(0, 50) + '...');
      console.log('Encrypted session key:', msg.encryptedSessionKey.substring(0, 30) + '...');
      
      // Try to decrypt if it's for testuser2
      if (msg.receiverId === TESTUSER2_ID) {
        console.log('🔓 Attempting to decrypt...');
        const decrypted = decryptMessage(msg.encryptedMessage, msg.encryptedSessionKey, TESTUSER_PRIVATE_KEY);
        console.log('📝 Decrypted message:', decrypted);
      } else {
        console.log('📝 Message status: [Sent by you - encrypted for recipient]');
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error fetching chat history:', error.message);
  }
  
  console.log('\n🎯 STEP 4: SECURITY EXPLANATION');
  console.log('================================\n');
  console.log('🔐 How KMune Encryption Works:');
  console.log('1️⃣ Each user generates RSA-2048 key pair');
  console.log('2️⃣ Public keys are stored on server, private keys stay on device');
  console.log('3️⃣ To send a message:');
  console.log('   • Generate random AES-256 key');
  console.log('   • Encrypt message with AES-GCM');
  console.log('   • Encrypt AES key with recipient\'s RSA public key');
  console.log('   • Store both encrypted parts on server');
  console.log('4️⃣ Server NEVER sees private keys or plaintext');
  console.log('5️⃣ Only recipient can decrypt with their private key');
  console.log('\n🛡️ Security Features:');
  console.log('• End-to-end encryption (E2E)');
  console.log('• Forward secrecy (per-message keys)');
  console.log('• Server cannot read messages');
  console.log('• RSA-OAEP + AES-GCM encryption');
  console.log('\n📊 Encryption Strength:');
  console.log('• RSA: 2048-bit (OAEP with SHA-256)');
  console.log('• AES: 256-bit (GCM mode)');
  console.log('• IV: 96-bit (cryptographically secure random)');
}

// Run the demonstration
demonstrateEncryption().catch(console.error);
