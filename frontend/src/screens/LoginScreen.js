import React, { useState } from 'react';
import { loginOnServer } from '../api';
import { hasStoredKeyPair } from '../encryption';

function LoginScreen({ onLogin, onSignUp }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    try {
      console.log('Attempting login for username:', username.trim());
      const data = await loginOnServer(username.trim());
      console.log('Login response:', data);
      const userId = data.userId;
      console.log('Checking for stored keys for userId:', userId);
      const ok = await hasStoredKeyPair(userId);
      console.log('Has stored keys:', ok);
      if (!ok) {
        setError('No encryption keys for this account on this device. Register here first.');
        return;
      }
      const user = {
        userId,
        username: data.username,
        publicKey: data.publicKey,
      };
      console.log('Login successful, user:', user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.hdqwalls.com/wallpapers/one-piece-anime-4k-2k.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '40px',
          borderRadius: '15px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: '0 0 30px 0', fontSize: '32px' }}>🏴‍☠️ Bharat Shield</h1>
        <p style={{ margin: '0 0 30px 0', opacity: 0.8 }}>Secure encrypted messaging</p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your server username"
              style={{
                width: '100%',
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

          {error && (
            <div
              style={{
                color: '#ff6b6b',
                marginBottom: '20px',
                padding: '10px',
                background: 'rgba(255,107,107,0.1)',
                borderRadius: '5px',
                border: '1px solid #ff6b6b',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              background: '#FF9933',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '15px',
            }}
          >
            Login
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <p style={{ margin: 0, opacity: 0.8 }}>New here?</p>
          <button
            type="button"
            onClick={onSignUp}
            style={{
              background: 'none',
              border: '1px solid #FF9933',
              color: '#FF9933',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
