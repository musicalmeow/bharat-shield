# KMune Scripts

This directory contains utility scripts for KMune development and testing.

## 📋 Available Scripts

### 👤 User Creation Scripts

#### create_test_user.js
Creates a test user with RSA encryption keys for development testing.

**Usage:**
```bash
node scripts/create_test_user.js
```

**Features:**
- Generates 2048-bit RSA key pair
- Registers user with backend API
- Stores private key in browser localStorage format
- Outputs user credentials for testing

#### create_test_user2.js
Creates a second test user for messaging between two accounts.

**Usage:**
```bash
node scripts/create_test_user2.js
```

**Features:**
- Same functionality as create_test_user.js
- Creates different user for two-user testing scenarios
- Enables end-to-end messaging tests

## 🚀 Quick Setup

### Creating Test Users
1. Start the backend server:
```bash
cd backend && npm run dev
```

2. Create test users:
```bash
node scripts/create_test_user.js
node scripts/create_test_user2.js
```

3. Start the frontend:
```bash
cd frontend && npm start
```

4. Use the generated credentials to test the application.

## 📝 Output Format

Both scripts output:
```
✅ Test user created successfully!
Username: testuser
User ID: 69da82df614c47aa298ee8ab
Private Key: [Base64 encoded key]
Public Key: [Base64 encoded key]

📝 To use this user:
1. Open http://localhost:3001
2. Click "Sign Up"
3. Use the credentials above
4. The encryption keys will be automatically stored
```

## 🔧 Requirements

- Node.js runtime
- Backend server running on `http://localhost:3000`
- Internet connection for API calls

## 🛡️ Security Notes

- These scripts generate real RSA keys for testing
- Keys are output in base64 format for browser compatibility
- Never use these keys in production environments
- Test users should be deleted after development
