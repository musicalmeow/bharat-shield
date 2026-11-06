import React, { useState, useEffect } from 'react';
import ChatScreen from './ChatScreen';
import ProfileScreen from './ProfileScreen';
import { listUsers } from '../api';

function ContactsScreen({ currentUser, onLogout, onUserUpdate }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listUsers(currentUser.userId);
        if (cancelled) return;
        const rows = (data.users || [])
          .filter(u => u.userId !== currentUser.userId) // Filter out current user
          .map((u) => ({
          id: u.userId,
          userId: u.userId,
          username: u.username,
          name: u.username,
          online: false,
        }));
        setContacts(rows);
        setLoadError('');
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Could not load directory');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser.userId]);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedUser) {
    return (
      <ChatScreen
        currentUser={currentUser}
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  if (showProfile) {
    return (
      <ProfileScreen
        currentUser={currentUser}
        onBack={() => setShowProfile(false)}
        onProfileUpdate={onUserUpdate}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.hdqwalls.com/wallpapers/one-piece-anime-4k-2k.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}
    >
      <div
        style={{
          padding: '20px',
          background: 'rgba(0,0,0,0.8)',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowProfile(true)}
            onKeyDown={(e) => e.key === 'Enter' && setShowProfile(true)}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid #FF9933',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            {currentUser?.profilePhoto ? (
              <img
                src={currentUser.profilePhoto}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {currentUser?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px' }}>Bharat-Shield Contacts</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '14px' }}>
              Welcome, {currentUser?.username}!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          style={{
            background: 'rgba(255,0,0,0.2)',
            border: '1px solid #ff4444',
            color: '#ff4444',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: '15px 20px', background: 'rgba(0,0,0,0.6)', textAlign: 'center' }}>
        <p style={{ margin: '0 0 15px 0', opacity: 0.8 }}>Directory from server</p>
        {loadError && (
          <p style={{ color: '#ff6b6b', marginBottom: 10 }}>{loadError}</p>
        )}
        <input
          type="text"
          placeholder="Search…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #666',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '16px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ padding: '20px' }}>
        {filteredContacts.length === 0 && !loadError && (
          <div style={{ opacity: 0.8, textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>👥 No other users to chat with</div>
            <p style={{ margin: '5px 0' }}>You're the only user registered so far!</p>
            <p style={{ margin: '5px 0' }}>To test messaging:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>Open a new browser window/profile</li>
              <li>Go to <strong>Sign Up</strong> and create another account</li>
              <li>Both users will appear in each other's contact list</li>
            </ul>
            {searchTerm && (
              <p style={{ marginTop: '15px', color: '#ffa500' }}>
                Try clearing search to see all available contacts
              </p>
            )}
          </div>
        )}
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedUser(contact)}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedUser(contact)}
            style={{
              background: 'rgba(0,0,0,0.6)',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              border: '1px solid #666',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginRight: '15px',
              }}
            >
              {contact.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{contact.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactsScreen;
