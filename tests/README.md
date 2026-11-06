# KMune Test Suite

This directory contains all test files and demonstration utilities for the KMune encrypted messaging application.

## 📋 Test Categories

### 🧪 HTML Test Files
- **evaluator_demo.html** - Comprehensive demo for evaluators showing encryption, persistence, and features
- **final_delete_test.html** - Final test for delete functionality verification
- **fix_existing_users.html** - Tool to generate encryption keys for existing users
- **test_contacts_filter.html** - Test contacts filtering functionality
- **test_delete_chat.html** - Test chat deletion feature
- **test_delete_persistence.html** - Test delete persistence across navigation
- **test_end_to_end.html** - End-to-end encryption test
- **test_frontend.html** - General frontend functionality test
- **test_message_persistence.html** - Test message persistence across refresh
- **test_permanent_deletion.html** - Test permanent user-level deletion
- **test_sender_only_deletion.html** - Test sender-only deletion feature
- **test_server_deletion.html** - Test server-side deletion
- **test_socket_messaging.html** - Test real-time socket messaging

### 🔧 JavaScript Test Files
- **encryption_demo.js** - Node.js encryption demonstration
- **test_encryption_fix.js** - Test encryption/decryption fixes
- **test_message.js** - Test message sending functionality
- **test_tampering.js** - Test tampering detection

## 🚀 Usage

### Running HTML Tests
1. Open any HTML file in a web browser
2. Follow the on-screen instructions
3. Check browser console for debugging information

### Running JavaScript Tests
```bash
# From project root
node tests/encryption_demo.js
node tests/test_message.js
node tests/test_tampering.js
```

## 📊 Test Coverage

- ✅ **Encryption/Decryption** - AES-GCM with RSA-OAEP
- ✅ **Message Persistence** - LocalStorage caching
- ✅ **Real-time Messaging** - Socket.IO integration
- ✅ **User Management** - Login, registration, contacts
- ✅ **Chat Deletion** - Individual and permanent deletion
- ✅ **Security** - Tampering detection, integrity verification
- ✅ **UI/UX** - Responsive design, error handling

## 🔍 Debugging

All tests include comprehensive console logging:
- 🔌 Socket connection status
- 📨 Message sending/receiving
- 🗑️ Deletion operations
- 🔐 Encryption/decryption process
- ❌ Error handling and recovery

## 📝 Notes

- Tests are designed to work with the development environment
- Backend should be running on `http://localhost:3000`
- Frontend should be running on `http://localhost:3001`
- Some tests require multiple browser windows for user simulation
