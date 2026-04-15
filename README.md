# KMune - Secure End-to-End Encrypted Messaging Backend

A Node.js backend for secure end-to-end encrypted messaging with real-time capabilities.

## Security Architecture

**IMPORTANT**: This backend follows strict security principles:

- **NEVER decrypts messages** - All message content is treated as opaque encrypted data
- **NEVER stores or accesses private keys** - Only public keys are stored
- **Zero-knowledge architecture** - Backend cannot read message content

## Tech Stack

- Node.js with Express.js
- MongoDB with Mongoose ODM
- Socket.IO for real-time messaging
- JWT for authentication (optional)

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user with their public key.

**Request Body:**
```json
{
  "username": "alice",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "64a1b2c3d4e5f6789012345"
}
```

#### POST /api/auth/login
Login user and retrieve their public key.

**Request Body:**
```json
{
  "username": "alice"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "64a1b2c3d4e5f6789012345",
  "username": "alice",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

#### GET /api/auth/publickey/:userId
Get a user's public key by their ID.

**Response:**
```json
{
  "success": true,
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

### Messages

#### POST /api/messages/send
Store an encrypted message.

**Request Body:**
```json
{
  "senderId": "64a1b2c3d4e5f6789012345",
  "receiverId": "64a1b2c3d4e5f6789012346",
  "encryptedMessage": "base64-encoded-encrypted-content",
  "encryptedSessionKey": "base64-encoded-encrypted-session-key",
  "timestamp": "2023-07-01T12:00:00.000Z"
}
```

#### GET /api/messages?senderId=...&receiverId=...
Get all messages between two users.

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "messageId": "64a1b2c3d4e5f6789012347",
      "senderId": "64a1b2c3d4e5f6789012345",
      "receiverId": "64a1b2c3d4e5f6789012346",
      "encryptedMessage": "base64-encoded-encrypted-content",
      "encryptedSessionKey": "base64-encoded-encrypted-session-key",
      "timestamp": "2023-07-01T12:00:00.000Z",
      "isRead": false,
      "readAt": null
    }
  ]
}
```

## Socket.IO Events

### Client to Server

- `join` - Join with userId: `{ userId: "..." }`
- `sendMessage` - Send real-time message (same format as POST /api/messages/send)
- `typing` - Typing indicator: `{ receiverId: "...", isTyping: true }`

### Server to Client

- `newMessage` - New message received (same format as message object)
- `messageSent` - Message sent confirmation: `{ messageId: "...", timestamp: "..." }`
- `userTyping` - User typing indicator: `{ userId: "...", isTyping: true }`
- `error` - Error message: `{ message: "..." }`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (make sure it's running on localhost:27017 or update MONGODB_URI)

4. Start the server:
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

## Database Schema

### User Model
```javascript
{
  username: String (unique, required),
  publicKey: String (required),
  createdAt: Date,
  lastSeen: Date,
  isOnline: Boolean
}
```

### Message Model
```javascript
{
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  encryptedMessage: String (required),
  encryptedSessionKey: String (required),
  timestamp: Date (required),
  isRead: Boolean,
  readAt: Date
}
```

## Security Notes

- All message content is stored as encrypted blobs
- Backend has no access to private keys
- No decryption occurs on the server
- Public keys are only used for key exchange
- Implement client-side encryption/decryption

## Development

The server runs on port 3000 by default. Socket.IO enables real-time messaging between connected users.

## License

MIT
