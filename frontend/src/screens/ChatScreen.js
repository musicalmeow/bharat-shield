import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { getApiBase, fetchPublicKey, sendMessageApi, fetchChat, deleteChatApi } from '../api';
import { encryptForRecipient, decryptFromStoredMessage, getPrivateKey } from '../encryption';

function ChatScreen({ currentUser, user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [animatingMessageId, setAnimatingMessageId] = useState(null);
  const socketRef = useRef(null);
  const peerKeyRef = useRef(null);

  const loadHistory = useCallback(async () => {
    console.log('Loading chat history:', { currentUser: currentUser?.userId, user: user?.id });
    if (!currentUser?.userId || !user?.id) return;
    
    const storageKey = `chat_${currentUser.userId}_${user.id}`;
    
    // Check if chat was deleted (localStorage missing)
    const isChatDeleted = !localStorage.getItem(storageKey) && localStorage.getItem(`${storageKey}_deleted`);
    if (isChatDeleted) {
      console.log('Chat was deleted, not loading from server');
      setMessages([]);
      return;
    }
    
    // Try to load from localStorage first for instant display
    const cachedMessages = localStorage.getItem(storageKey);
    if (cachedMessages) {
      try {
        const parsed = JSON.parse(cachedMessages);
        console.log('Loaded cached messages:', parsed);
        setMessages(parsed);
      } catch (e) {
        console.warn('Failed to parse cached messages:', e);
      }
    }
    
    try {
      const data = await fetchChat(currentUser.userId, user.id);
      console.log('Chat data received:', data);
      const rows = data.messages || [];
      console.log('Messages rows:', rows);
      const priv = await getPrivateKey(currentUser.userId);
      console.log('Private key found:', !!priv);
      const out = [];
      for (const m of rows) {
        let body = '';
        
        // Always show plain text if available, otherwise use fallback
        if (m.text) {
          body = m.text;
        } else {
          // Fallback for messages without plain text
          if (m.senderId === currentUser.userId) {
            body = 'You: Message sent';
          } else {
            body = 'Message received';
          }
        }
        
        out.push({
          id: m.messageId || m._id, // Ensure we have a valid ID
          text: body,
          own: m.senderId === currentUser.userId,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messageId: m.messageId || m._id, // Store message ID for deletion
        });
      }
      console.log('Processed messages:', out);
      setMessages(out);
      // Save to localStorage for persistence
      localStorage.setItem(storageKey, JSON.stringify(out));
      
      // Only clear deletion flag if there are existing messages
      if (out.length > 0) {
        localStorage.removeItem(`${storageKey}_deleted`);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Don't clear messages on error, keep what we have from cache
      if (!cachedMessages) {
        setMessages([]);
      }
    }
  }, [currentUser.userId, user.id]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const pk = await fetchPublicKey(user.id);
        if (!cancelled) peerKeyRef.current = pk.publicKey;
      } catch {
        peerKeyRef.current = null;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    loadHistory();
    const s = io(getApiBase(), { transports: ['websocket', 'polling'] });
    socketRef.current = s;
    
    // Add connection debugging
    s.on('connect', () => {
      console.log('🔌 Socket connected:', s.id);
      console.log('👤 User joining with ID:', currentUser.userId);
    });
    
    s.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });
    
    // Join the socket room
    s.emit('join', { userId: currentUser.userId });
    console.log('📡 Sent join event for user:', currentUser.userId);
    
    // Listen for incoming messages
    s.on('receive_message', (data) => {
      console.log('📨 Received message event:', data);
      loadHistory();
    });
    
    // Listen for join confirmation
    s.on('joined', (data) => {
      console.log('✅ Join confirmed:', data);
    });
    
    // Listen for delivery confirmations
    s.on('message_delivered', (data) => {
      console.log('📬 Message delivered:', data);
    });
    
    // Listen for errors
    s.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
    
    const id = setInterval(loadHistory, 15000);
    return () => {
      clearInterval(id);
      s.disconnect();
      socketRef.current = null;
    };
  }, [currentUser.userId, user.id, loadHistory]);

  if (!user) {
    return (
      <div style={{ padding: '20px', color: '#fff' }}>
        Loading chat…
      </div>
    );
  }

  const send = async () => {
    if (!text.trim() || !peerKeyRef.current) return;
    
    const messageText = text.trim();
    const ts = new Date().toISOString();
    const tempId = `local-${Date.now()}`;
    
    // Show message immediately in UI with WhatsApp-style animation
    const newMessage = { 
      id: tempId, 
      text: messageText, 
      own: true, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sending: true,
      animating: true, // Add animation flag
      messageId: tempId // Store message ID for deletion
    };
    
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      // Save to localStorage
      const storageKey = `chat_${currentUser.userId}_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      // Only clear deletion flag if there were existing messages (not a fresh start)
      if (prev.length > 0) {
        localStorage.removeItem(`${storageKey}_deleted`);
      }
      
      return updated;
    });
    
    // Remove animation flag after animation completes
    setTimeout(() => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === tempId ? { ...msg, animating: false } : msg
        )
      );
    }, 300);
    
    setText(''); // Clear input immediately
    
    try {
      // Encrypt and send in background
      const { encryptedMessage, encryptedSessionKey } = await encryptForRecipient(messageText, peerKeyRef.current);
      
      const response = await sendMessageApi({
        senderId: currentUser.userId,
        receiverId: user.id,
        encryptedMessage,
        encryptedSessionKey,
        timestamp: ts,
        text: messageText, // Add plain text for visibility
      });
      
      // Update message with actual server ID
      if (response.success && response.messageId) {
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === tempId ? { ...msg, sending: false, id: response.messageId, messageId: response.messageId } : msg
          )
        );
      } else {
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === tempId ? { ...msg, sending: false } : msg
          )
        );
      }
      
      socketRef.current?.emit('send_message', {
        senderId: currentUser.userId,
        receiverId: user.id,
        encryptedMessage,
        encryptedSessionKey,
        timestamp: ts,
        text: messageText, // Add plain text for visibility
      });
      
    } catch (error) {
      console.error('Send failed:', error);
      // Update message to show send failed
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === tempId ? { ...msg, text: 'Send failed', sending: false, error: true } : msg
        )
      );
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingMessageId(messageId);
      
      // Remove message from UI with animation
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, deleting: true } : msg
        )
      );
      
      // Call server to delete message permanently
      const response = await fetch(`${getApiBase()}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.userId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message from server');
      }
      
      // Wait for animation then remove from state
      setTimeout(() => {
        setMessages((prev) => prev.filter(msg => msg.id !== messageId));
      }, 300);
      
      // Update localStorage
      const storageKey = `chat_${currentUser.userId}_${user.id}`;
      const currentMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedMessages = currentMessages.filter(msg => msg.id !== messageId);
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      
      console.log('Message permanently deleted:', messageId);
      
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message: ' + error.message);
      // Restore message in UI if deletion failed
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, deleting: false } : msg
        )
      );
    } finally {
      setDeletingMessageId(null);
    }
  };

  const deleteChat = async () => {
    if (!window.confirm('Are you sure you want to delete all messages in this chat? This action cannot be undone.\n\nThis will permanently delete all messages from the server and all devices.')) {
      return;
    }
    
    try {
      const storageKey = `chat_${currentUser.userId}_${user.id}`;
      
      // Clear messages from state immediately
      setMessages([]);
      
      // Delete from server
      console.log('Deleting chat from server...');
      const deleteResult = await deleteChatApi(currentUser.userId, user.id);
      
      if (deleteResult?.success) {
        console.log('Server deletion successful:', deleteResult.deletedCount, 'messages deleted');
        
        // Clear from localStorage and set deletion flag
        localStorage.removeItem(storageKey);
        localStorage.setItem(`${storageKey}_deleted`, 'true');
        
        alert(`Chat history deleted successfully! ${deleteResult.deletedCount} messages permanently removed from server.`);
      } else {
        throw new Error(deleteResult?.error || 'Server deletion failed');
      }
      
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert(`Failed to delete chat history: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const pk = await fetchPublicKey(user.id);
        if (!cancelled) peerKeyRef.current = pk.publicKey;
      } catch {
        peerKeyRef.current = null;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    loadHistory();
    const s = io(getApiBase(), { transports: ['websocket', 'polling'] });
    socketRef.current = s;
    
    // Add connection debugging
    s.on('connect', () => {
      console.log('Socket connected:', s.id);
      console.log('User joining with ID:', currentUser.userId);
    });
    
    s.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    // Join the socket room
    s.emit('join', { userId: currentUser.userId });
    console.log('Sent join event for user:', currentUser.userId);
    
    // Listen for incoming messages
    s.on('receive_message', (data) => {
      console.log('Received message event:', data);
      loadHistory();
    });
    
    // Listen for join confirmation
    s.on('joined', (data) => {
      console.log('Join confirmed:', data);
    });
    
    // Listen for delivery confirmations
    s.on('message_delivered', (data) => {
      console.log('Message delivered:', data);
    });
    
    // Listen for errors
    s.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    const id = setInterval(loadHistory, 15000);
    return () => {
      clearInterval(id);
      s.disconnect();
      socketRef.current = null;
    };
  }, [currentUser.userId, user.id, loadHistory]);

  if (!user) {
    return (
      <div style={{ padding: '20px', color: '#fff' }}>
        Loading chat
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideOut {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(-100%);
            }
          }
          
          .whatsapp-bubble {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          
          .whatsapp-bubble:hover {
            opacity: 0.8;
            transform: scale(0.98);
            transition: all 0.2s ease;
          }
        `}
      </style>
      <div
        style={{
          height: '100vh',
          backgroundImage: "url('https://images.hdqwalls.com/wallpapers/one-piece-anime-4k-2k.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
        }}
      >
      <div
        style={{
          padding: '15px',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <button
            type="button"
            onClick={onBack}
            style={{ marginRight: '15px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>⚓ {user.name}</span>
          <button
            type="button"
            onClick={deleteChat}
            style={{
              marginLeft: '15px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: '#dc3545',
              color: 'white'
            }}
            title="Delete all messages in this chat"
          >
            🗑️ Delete Chat
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
        {messages.map((m) => (
          <div 
            key={m.id} 
            style={{ 
              textAlign: m.own ? 'right' : 'left', 
              margin: '10px',
              animation: m.animating ? 'slideIn 0.3s ease-out' : (m.deleting ? 'slideOut 0.3s ease-out' : 'none'),
              opacity: m.deleting ? 0 : 1,
              transform: m.deleting ? 'translateX(-100%)' : 'translateX(0)',
              transition: 'all 0.3s ease-out'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: m.own 
                  ? (m.error ? '#dc3545' : (m.sending ? '#ffc107' : '#25D366'))
                  : (m.error ? '#dc3545' : (m.sending ? '#ffc107' : '#E5E5EA')),
                color: m.own ? 'white' : 'black',
                padding: '8px 12px',
                borderRadius: m.own ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                maxWidth: '70%',
                wordWrap: 'break-word',
                position: 'relative',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                opacity: m.sending ? 0.8 : 1,
                cursor: m.own ? 'pointer' : 'default'
              }}
              onClick={() => m.own && deleteMessage(m.id)}
              title={m.own ? 'Click to delete message' : ''}
            >
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{m.text}</div>
              <div style={{ 
                fontSize: '11px', 
                marginTop: '4px', 
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: m.own ? 'flex-end' : 'flex-start',
                gap: '4px'
              }}>
                {m.time}
                {m.sending && <span style={{ fontSize: '10px' }}>Sending...</span>}
                {m.error && <span style={{ color: '#dc3545' }}>Failed</span>}
                {m.own && !m.sending && !m.error && (
                  <span style={{ fontSize: '10px', opacity: 0.5 }}>Click to delete</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', padding: '15px', background: 'rgba(0,0,0,0.8)' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={peerKeyRef.current ? 'Send encrypted message…' : 'Loading recipient key…'}
          style={{ padding: 12, flex: 1, borderRadius: '8px', border: 'none', outline: 'none' }}
        />
        <button
          type="button"
          onClick={send}
          style={{
            padding: '12px 20px',
            marginLeft: 10,
            background: '#FF9933',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Send ⚓
        </button>
      </div>
      </div>
    </>
  );
}

export default ChatScreen;
