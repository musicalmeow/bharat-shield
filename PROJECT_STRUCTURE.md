# KMune Project Structure

This document outlines the organized structure of the KMune encrypted messaging application.

## 📁 Directory Structure

```
KMune/
├── 📁 backend/                 # Node.js backend server
│   ├── 📁 config/              # Database configuration
│   ├── 📁 controllers/         # API controllers
│   ├── 📁 models/              # MongoDB models
│   ├── 📁 routes/              # API routes
│   ├── 📁 socket/              # Socket.IO handlers
│   ├── 📄 server.js            # Main server entry point
│   └── 📄 package.json        # Backend dependencies
├── 📁 frontend/               # React frontend application
│   ├── 📁 public/              # Static assets
│   │   └── 📄 app.css        # Global styles
│   ├── 📁 src/                 # React source code
│   │   ├── 📁 api.js           # API utilities
│   │   ├── 📁 screens/         # React components
│   │   └── 📁 index.js         # App entry point
│   └── 📄 package.json        # Frontend dependencies
├── 📁 encryption/             # Encryption module
│   ├── 📄 encrypt.js          # Message encryption
│   ├── 📄 decrypt.js          # Message decryption
│   ├── 📄 keyManager.js       # Key management
│   ├── 📄 storage.js          # Local storage utilities
│   └── 📄 package.json        # Encryption dependencies
├── 📁 tests/                 # Test suite and demos
│   ├── 📄 README.md           # Test documentation
│   ├── 📄 *.html              # Browser-based tests
│   └── 📄 *.js               # Node.js tests
├── 📁 scripts/               # Development utilities
│   ├── 📄 README.md           # Scripts documentation
│   ├── 📄 create_test_user.js  # Test user creation
│   └── 📄 create_test_user2.js # Second test user
├── 📁 docs/                  # Documentation
├── 📁 data/                  # Data storage (MongoDB)
├── 📄 .env                   # Environment variables
├── 📄 .gitignore             # Git ignore rules
├── 📄 docker-compose.yml      # Docker configuration
├── 📄 package.json           # Root dependencies
└── 📄 README.md              # Project documentation
```

## 🎯 Component Overview

### Backend (`/backend`)
- **Express.js** server with REST API
- **MongoDB** database for message storage
- **Socket.IO** for real-time messaging
- **JWT** authentication system
- **RSA-OAEP** + **AES-GCM** encryption

### Frontend (`/frontend`)
- **React** single-page application
- **Socket.IO client** for real-time updates
- **LocalStorage** for message persistence
- **Responsive design** with mobile support
- **End-to-end encryption** in browser

### Encryption (`/encryption`)
- **Web Crypto API** for browser compatibility
- **AES-GCM** for symmetric encryption
- **RSA-OAEP** for key exchange
- **Authentication tags** for integrity verification
- **Base64 encoding** for storage/transmission

### Tests (`/tests`)
- **HTML-based tests** for browser testing
- **Node.js scripts** for backend testing
- **Integration tests** for end-to-end scenarios
- **Security tests** for encryption validation

### Scripts (`/scripts`)
- **User creation utilities** for development
- **Test data generators** for testing scenarios
- **Database seeding** for initial setup

## 🚀 Development Workflow

### 1. Environment Setup
```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../encryption && npm install
```

### 2. Development Servers
```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)
cd frontend && npm start

# Both servers will be running:
# Backend: http://localhost:3000
# Frontend: http://localhost:3001
```

### 3. Testing
```bash
# Run browser tests
open tests/evaluator_demo.html

# Run Node.js tests
node tests/encryption_demo.js

# Create test users
node scripts/create_test_user.js
node scripts/create_test_user2.js
```

## 🔧 Configuration

### Environment Variables (`.env`)
```
MONGODB_URI=mongodb://127.0.0.1:27017/kmune
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Frontend Configuration
- API base URL: `http://localhost:3000`
- Socket.IO URL: `http://localhost:3000`
- LocalStorage prefix: `chat_`

## 🛡️ Security Features

- **End-to-end encryption** with AES-GCM
- **RSA-OAEP** for secure key exchange
- **Authentication tags** for tampering detection
- **JWT-based authentication**
- **Input validation** and sanitization
- **CORS protection** on API endpoints

## 📱 Key Features

- **Real-time messaging** with Socket.IO
- **Message persistence** across sessions
- **Contact management** with filtering
- **Chat deletion** (individual and permanent)
- **User profiles** with photo uploads
- **Responsive design** for all devices
- **Encryption demonstration** for evaluators

## 🧪 Testing Coverage

- ✅ **Unit Tests** - Individual component testing
- ✅ **Integration Tests** - End-to-end scenarios
- ✅ **Security Tests** - Encryption and tampering
- ✅ **Performance Tests** - Message handling
- ✅ **UI Tests** - User interface validation
- ✅ **API Tests** - Backend endpoint testing

This organized structure ensures maintainability, scalability, and clear separation of concerns across the entire KMune application.
