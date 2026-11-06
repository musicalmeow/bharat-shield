// Test the fixed encryption/decryption
const { encryptForRecipient } = require('./encryption/encrypt');
const { decryptFromStoredMessage } = require('./encryption/decrypt');

async function testEncryptionDecryption() {
    console.log('🔐 Testing Encryption/Decryption Fix');
    console.log('=====================================\n');

    const testMessage = 'Hello! This is a test message for decryption verification.';
    console.log('📝 Original message:', testMessage);

    try {
        // Test with sample keys (in real app, these come from key generation)
        const samplePublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApullFoOGkiSJ1y0/r5DsfKg0pTx94IgHZ5H8zNCPsTKiFcHcklF0nXUAnfew9QUh7H4X8SpNMxNEC8wK78j/JGkOo6febXobNPFHOlKiCUrH+UwgfvV/TR54aAcC67lLwAI7nDfd5agys4YtLFbHnGMi1VcvOPooxyOMwBNX7QmXDqYsknBRE785Eek74iAqiPXYKn860Lf96dJXcj+sxrT/UjzUnBiR3fYfsCZlL4beKo5bCfsMePbqA8ov8FV66zFSoPL1hPP/2Ae/A25n3hI6PnnJAUgmn1MlYXsbNf6TO9ZWejul4gxwYRnF+DiPDmd+FzUvrR0ohrvt8lRG2wIDAQAB';
        
        console.log('\n🔒 Encrypting message...');
        const { encryptedMessage, encryptedSessionKey } = await encryptForRecipient(testMessage, samplePublicKey);
        
        console.log('✅ Encryption successful!');
        console.log('Encrypted message:', encryptedMessage.substring(0, 100) + '...');
        console.log('Encrypted session key:', encryptedSessionKey.substring(0, 50) + '...');

        // Test decryption
        console.log('\n🔓 Decrypting message...');
        const samplePrivateKey = 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCm6WUWg4aSJInXLT+vkOx8qDSlPH3giAdnkfzM0I+xMqIVwdySUXSddQCd97D1BSHsfhfxKk0zE0QLzArvyP8kaQ6jp95tehs08Uc6UqIJSsf5TCB+9X9NHnhoBwLruUvAAjucN93lqDKzhi0sVsecYyLVVy84+ijHI4zAE1ftCZcOpiyScFETvzkR6TviICqI9dgqfzrQt/3p0ldyP6zGtP9SPNScGJHd9h+wJmUvht4qjlsJ+wx49uoDyi/wVXrrMVKg8vWE8//YB78DbmfeEjo+eckBSCafUyVhexs1/pM71lZ6O6XiDHBhGcX4OI8OZ34XNS+tHSiGu+3yVEbbAgMBAAECggEAUDtHjsNpV+19XrQO9Wcd7ivypmzF+zyYBpZ7pL4qHBzBIeE+lAzYl+mKguRxqM2vSV0xSAkz87Wyk1Mg/LMqxcdENLG4LvqvgkrqmKPo5LuQFYsc4bpDV4Aqk6KvKj03JtRL8CNApCiuOnJoW3RZXhifQVq3xdUl7dduTFPgA328uSam5TMaiQsT5b2CA3LMVZE42n2yqYthr5NDJ/JFJEYPxDMOpscTn2jz3OrGQILlD2zzE1XX/a/O5lG8z4fOo9wE7kDQpJlgvvuQa44cOROKqhwXwb9i1yM8rtXWhp0PRcO/nbI9ynnzPiBtTEO6JSEVgypJ4D2FFOItXzU4FQKBgQDrYzJMhNkOLoDAI/kmZ3ye5Pix/6h01ujSCd0CASr7cxAPc40r5OzGQv+8fg7PQ3QQsa8H/q1JN21H8uZ2EOhINLUV+sqz6aY3st82Jztqu/3k0DqN+eb2afHXrsKAZtdTxnnZTU4LjNz1tbnRtr/BPNXTG/TcX/FPT88ABwnVhwKBgQC1hyQfeOUmfiPjNhSGP6WwQ1VvLTxeGlzu+fV/m4uthfPqo3FJWrEE8/g501aAn/DONYRh7NvtIoVh3ep9fOGs87IWejhfJH0Lvb1yTfWlFjeF2rHpGrxEggbvnnEQzMq6/g7uob/eMKKiwIGIY6SX7x1RYN9tNT5+7oSJTcPZDQKBgDbJke2JhlPssv8F4Hn14GXDebdEgFshonMw5IYQ64Y3U+ekx5kN4aaL9aZT2PKZCqzQDqNXvdGq2v7CJK4aZVZZHkUNaJzTp2KTeazLGONQ+lmFtftRzVZRdn7zKEZmqXvQWJAhlCbQFKYENEoBtUQu+r32ZdndYvdI5i9lc/6FAoGAHd6+8u7RxiO7hAfCGNUgToDF7iVjaZis8iXvX7AYq9T+7f03BvsFZes/TUSZV1D6LvRfdD2lcr/bct8xVrTV7b+r7kbuP7mhWe0+3zA025VsTXpPDCx6DkvXGFbaBAmu0lY73sh+6fDW0jEbH3ZF/zo5eMqX+UBpqDlXVcCWGYECgYEAxiYx2mBcbsMN87+2UeXd7ldxkGNVLWz7nFr8FzQgfRRq9MVCBG0isMPvyB7EtbJxuFgFlaIJl/DqA7095BCYIzAtUopSJu0Y+gMH8Ui49lRZ7ilCKgAI++5sD3YLVMGB+iWCtdLIaMtGT+nvY4kadwxGoDVrsUkuyBCxJij41Rc=';
        
        const decryptedMessage = await decryptFromStoredMessage(encryptedMessage, encryptedSessionKey, samplePrivateKey);
        
        console.log('✅ Decryption successful!');
        console.log('📝 Decrypted message:', decryptedMessage);
        
        // Verify the messages match
        const success = testMessage === decryptedMessage;
        console.log('\n🎯 VERIFICATION RESULT:');
        console.log('===================');
        console.log('✅ Success:', success ? 'YES - Messages match!' : '❌ NO - Messages differ!');
        
        if (success) {
            console.log('🎉 Encryption/Decryption fix is working correctly!');
        } else {
            console.log('🚨 There is still an issue with encryption/decryption');
            console.log('Expected:', testMessage);
            console.log('Got:     ', decryptedMessage);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testEncryptionDecryption();
