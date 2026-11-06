const crypto = require('crypto');

// Test user IDs (from previous scripts)
const TESTUSER_ID = '69da82df614c47aa298ee8ab';
const TESTUSER2_ID = '69da8339614c47aa298ee8cc';

// Test user2's public key (from previous script)
const TESTUSER2_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxg0SpzhDXmSbAqE2cgy/
GxJF/PsyqBmk6OEZqy4LuzRGVjLDS+45ELxY4vzMw1sfd2eRkLlx5w0rifGObn65
zEiMl3l3+rtZVmDM5BYv3wrHHRQ4/ILQQgZfcpqHs58ImIVAhm2VIRZoI9LvToCN
NQgQlvdSF3VqxSbfJZn3VkZNOawZx0Y9Dl74boenPAhhgX7QI9GTUrMxruIhEUjZ
oc5MP6J3zL/ppV6WuIhlqX/pK5J0oDByX4oOYDsUgBb+43+eufPtYTYBRB0umi4S
1AZvsxVnMWn/BH/4jckDz1V27GrZx5ynIOaEwmMPT9prBnPPCWkBxKV7Spy7rtXT
PwIDAQAB
-----END PUBLIC KEY-----`;

// Test user's private key (from previous script)
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

function encryptForRecipient(plaintext, recipientPublicKeyPem) {
  // Generate random AES key
  const aesKey = crypto.randomBytes(32); // 256 bits
  const iv = crypto.randomBytes(12); // 96 bits for GCM
  
  // Encrypt message with AES-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  // Encrypt AES key with RSA-OAEP
  const encryptedAesKey = crypto.publicEncrypt({
    key: recipientPublicKeyPem,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  }, aesKey);
  
  // Create encrypted message object (similar to browser version)
  const encryptedMessage = JSON.stringify({
    v: 1,
    iv: iv.toString('base64'),
    data: encrypted.toString('base64'),
    authTag: authTag.toString('base64')
  });
  
  return {
    encryptedMessage,
    encryptedSessionKey: encryptedAesKey.toString('base64')
  };
}

async function sendTestMessage() {
  try {
    console.log('🔐 Encrypting test message...');
    const plaintext = 'Hello from testuser! This is a test message.';
    const { encryptedMessage, encryptedSessionKey } = encryptForRecipient(plaintext, TESTUSER2_PUBLIC_KEY);
    
    console.log('📤 Sending message...');
    const response = await fetch('http://localhost:3000/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderId: TESTUSER_ID,
        receiverId: TESTUSER2_ID,
        encryptedMessage,
        encryptedSessionKey,
        timestamp: new Date().toISOString()
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Message sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send message:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendTestMessage();
