# KMune Contact Management System

A secure, consent-based contact management system for end-to-end encrypted messaging.

## Overview

The contact management system ensures that users can only communicate with mutually accepted contacts, maintaining privacy and security while preventing unauthorized messaging.

## Security Features

- **Mutual Consent**: Contact requests require explicit acceptance
- **No Auto-adding**: Users cannot be automatically added as contacts
- **Request Validation**: Prevents duplicate and self-requests
- **Minimal Data Exposure**: Only essential user information shared
- **User-Specific**: Only messaging between accepted contacts
- **Clean Separation**: Contact system separate from encryption logic

## Database Schema

### ContactRequest Model

```javascript
{
  fromUser: ObjectId,     // Who sent the request
  toUser: ObjectId,       // Who received the request
  status: String,         // "pending" | "accepted" | "rejected"
  createdAt: Date         // When request was sent
}
```

### Updated User Model

```javascript
{
  username: String,
  publicKey: String,
  contacts: [ObjectId],  // Array of contact user IDs
  createdAt: Date,
  lastSeen: Date,
  isOnline: Boolean
}
```

## API Endpoints

### Send Contact Request
```
POST /api/contacts/request
{
  "fromUserId": "user123",
  "toUserId": "user456"
}
```

**Validations:**
- Both users must exist
- Cannot send to self
- No duplicate requests
- Users not already contacts

### Accept Contact Request
```
POST /api/contacts/accept
{
  "requestId": "req789"
}
```

**Actions:**
- Updates request status to "accepted"
- Adds both users to each other's contacts list

### Reject Contact Request
```
POST /api/contacts/reject
{
  "requestId": "req789"
}
```

**Actions:**
- Updates request status to "rejected"
- No contact relationship established

### Get Contacts List
```
GET /api/contacts/list/:userId
```

**Returns:**
```javascript
{
  "success": true,
  "contacts": [
    {
      "_id": "user456",
      "username": "bob",
      "publicKey": "base64publickey..."
    }
  ]
}
```

### Get Pending Requests
```
GET /api/contacts/pending/:userId
```

**Returns:**
```javascript
{
  "success": true,
  "requests": [
    {
      "requestId": "req789",
      "fromUser": "alice",
      "createdAt": "2023-12-07T10:30:00.000Z"
    }
  ]
}
```

## Contact Request Flow

1. **Initiation**: User A sends request to User B
2. **Validation**: System validates request (users exist, not duplicates, etc.)
3. **Notification**: User B receives pending request
4. **Decision**: User B accepts or rejects request
5. **Establishment**: If accepted, both users added to contacts
6. **Messaging**: Both users can now message each other

## Security Constraints

### Input Validation
- All required fields validated
- ObjectId format validation
- User existence verification
- Duplicate request prevention

### Authorization
- Users can only manage their own requests
- Contact requests require recipient's action
- No automatic contact creation

### Data Protection
- Only username and publicKey exposed in contacts
- No plaintext messages in contact system
- Minimal user data shared
- Clean separation of concerns

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created (contact request sent)
- `400` - Bad Request (validation errors)
- `403` - Forbidden (authorization errors)
- `404` - Not Found (user/request not found)
- `500` - Internal Server Error

### Error Responses
```javascript
{
  "success": false,
  "message": "Descriptive error message"
}
```

## Database Indexes

For optimal performance:
```javascript
// ContactRequest indexes
contactRequestSchema.index({ fromUser: 1, toUser: 1 });
contactRequestSchema.index({ toUser: 1, status: 1 });
contactRequestSchema.index({ fromUser: 1, status: 1 });
```

## Usage Examples

### Send Contact Request
```javascript
const response = await fetch('/api/contacts/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fromUserId: 'alice123',
    toUserId: 'bob456'
  })
});

const result = await response.json();
// result: { success: true, requestId: "req789" }
```

### Accept Contact Request
```javascript
const response = await fetch('/api/contacts/accept', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestId: 'req789'
  })
});

const result = await response.json();
// result: { success: true }
```

### Get Contacts
```javascript
const response = await fetch('/api/contacts/list/alice123');
const result = await response.json();
// result: { success: true, contacts: [...] }
```

## Integration with Messaging System

Once contacts are established:
1. **Contact Validation**: Messaging system checks if recipient is in contacts
2. **Permission Check**: Only allows messaging between accepted contacts
3. **Security Enforcement**: Prevents unauthorized messaging
4. **Privacy Protection**: Users control who can message them

## Testing

### Test Scenarios
1. **Successful Request**: Send → Accept → Contact established
2. **Rejected Request**: Send → Reject → No contact
3. **Duplicate Prevention**: Multiple attempts → Error
4. **Self-Request Prevention**: Send to self → Error
5. **Invalid User**: Non-existent user → Error

### Security Testing
1. **Authorization Tests**: Try to manage other's requests
2. **Input Validation**: Invalid IDs, missing fields
3. **Edge Cases**: Maximum requests, concurrent requests
4. **Data Exposure**: Ensure minimal data leakage

## Files Structure

```
backend/
├── models/
│   ├── User.js (updated with contacts field)
│   └── ContactRequest.js (new)
├── controllers/
│   └── contactController.js (new)
├── routes/
│   └── contactRoutes.js (new)
└── server.js (updated with contact routes)
```

## Future Enhancements

1. **Contact Groups**: Group messaging capabilities
2. **Contact Blocking**: User-initiated blocking
3. **Contact Search**: Find users by username/email
4. **Request Expiration**: Auto-expire old requests
5. **Contact Categories**: Organize contacts into groups
6. **Activity Status**: Show when contacts were last active

---

**The contact management system provides a secure foundation for controlled, consent-based messaging while maintaining user privacy and data protection.**
