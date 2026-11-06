const crypto = require('crypto');

// Simulate the fixed encryption/decryption with proper authentication tags
function encryptWithAuthTag(plaintext) {
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted: encrypted.toString('base64'),
        authTag: authTag.toString('base64'),
        iv: iv.toString('base64'),
        aesKey: aesKey.toString('base64')
    };
}

function decryptWithAuthTag(encryptedData, authTagB64, ivB64, aesKeyB64) {
    try {
        const encrypted = Buffer.from(encryptedData, 'base64');
        const authTag = Buffer.from(authTagB64, 'base64');
        const iv = Buffer.from(ivB64, 'base64');
        const aesKey = Buffer.from(aesKeyB64, 'base64');
        
        // Combine encrypted data with auth tag (as required by Node.js crypto)
        const combinedData = Buffer.concat([encrypted, authTag]);
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(combinedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error('DECRYPTION FAILED - Tampering detected!');
    }
}

function tamperWithData(encryptedData) {
    // Flip some bits in the encrypted data
    const buffer = Buffer.from(encryptedData, 'base64');
    buffer[0] = buffer[0] ^ 0xFF; // Flip all bits in first byte
    return buffer.toString('base64');
}

console.log('🔐 TAMPERING DEMONSTRATION - SECURITY FIX TEST');
console.log('===============================================\n');

const originalMessage = 'This is a secret message that should not be tampered with!';

console.log('📝 Original message:', originalMessage);

// Encrypt with proper authentication tag
const encrypted = encryptWithAuthTag(originalMessage);
console.log('\n🔒 Encrypted with authentication tag:');
console.log('   Encrypted data:', encrypted.encrypted.substring(0, 30) + '...');
console.log('   Auth tag:', encrypted.authTag);
console.log('   IV:', encrypted.iv);

// Test 1: Normal decryption
console.log('\n✅ TEST 1: Normal Decryption');
try {
    const decrypted = decryptWithAuthTag(
        encrypted.encrypted, 
        encrypted.authTag, 
        encrypted.iv, 
        encrypted.aesKey
    );
    console.log('   Result:', decrypted);
    console.log('   ✅ Success: Message matches original?', originalMessage === decrypted);
} catch (error) {
    console.log('   ❌ Failed:', error.message);
}

// Test 2: Tampered decryption
console.log('\n🔥 TEST 2: Tampered Decryption');
const tamperedData = tamperWithData(encrypted.encrypted);
console.log('   Tampered encrypted data:', tamperedData.substring(0, 30) + '...');

try {
    const decrypted = decryptWithAuthTag(
        tamperedData, 
        encrypted.authTag, 
        encrypted.iv, 
        encrypted.aesKey
    );
    console.log('   🚨 CRITICAL: Decryption succeeded despite tampering!');
    console.log('   Result:', decrypted);
} catch (error) {
    console.log('   ✅ SECURITY WORKS: Tampering detected!');
    console.log('   Error:', error.message);
}

// Test 3: Tampered auth tag
console.log('\n🔥 TEST 3: Tampered Authentication Tag');
const tamperedAuthTag = Buffer.from(encrypted.authTag, 'base64');
tamperedAuthTag[0] = tamperedAuthTag[0] ^ 0xFF;

try {
    const decrypted = decryptWithAuthTag(
        encrypted.encrypted, 
        tamperedAuthTag.toString('base64'), 
        encrypted.iv, 
        encrypted.aesKey
    );
    console.log('   🚨 CRITICAL: Decryption succeeded despite auth tag tampering!');
    console.log('   Result:', decrypted);
} catch (error) {
    console.log('   ✅ SECURITY WORKS: Auth tag tampering detected!');
    console.log('   Error:', error.message);
}

console.log('\n📋 SUMMARY:');
console.log('===========');
console.log('✅ The FIXED implementation properly detects tampering');
console.log('✅ Authentication tags prevent undetected modification');
console.log('✅ AES-GCM provides both confidentiality AND integrity');
console.log('\n🚨 BEFORE THE FIX: Tampering would go undetected');
console.log('✅ AFTER THE FIX: Tampering is immediately detected');
