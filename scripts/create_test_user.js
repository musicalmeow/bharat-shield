const crypto = require('crypto');

// Simulate the browser's generateKeyPair function
async function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Convert to base64 like the browser does
  const publicKeySpkiB64 = publicKey.replace(/-----BEGIN PUBLIC KEY-----\n|\n-----END PUBLIC KEY-----|\n/g, '');
  const privateKeyPkcs8B64 = privateKey.replace(/-----BEGIN PRIVATE KEY-----\n|\n-----END PRIVATE KEY-----|\n/g, '');

  return {
    publicKeySpkiB64,
    privateKeyPkcs8B64,
    publicKeyPem: publicKey,
    privateKeyPem: privateKey
  };
}

async function createTestUser() {
  try {
    console.log('Generating RSA key pair...');
    const { publicKeySpkiB64, privateKeyPkcs8B64, publicKeyPem, privateKeyPem } = await generateKeyPair();
    
    console.log('Registering user "testuser"...');
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        publicKey: publicKeySpkiB64
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ User created successfully!');
      console.log('User ID:', result.userId);
      console.log('Username: testuser');
      console.log('\n📝 Save these keys for testing:');
      console.log('Public Key (base64):', publicKeySpkiB64.substring(0, 50) + '...');
      console.log('Private Key (base64):', privateKeyPkcs8B64.substring(0, 50) + '...');
      console.log('\n🔐 Full Public Key PEM:');
      console.log(publicKeyPem);
      console.log('\n🔐 Full Private Key PEM:');
      console.log(privateKeyPem);
    } else {
      console.error('❌ Failed to create user:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();
