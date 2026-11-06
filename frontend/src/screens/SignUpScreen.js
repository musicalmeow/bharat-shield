import React, { useState } from 'react';
import { registerOnServer } from '../api';
import { generateKeyPair, storeKeyPair } from '../encryption';

function SignUpScreen({ onSignUp, onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Please choose a username');
      return;
    }
    setBusy(true);
    try {
      const { publicKeySpkiB64, privateKeyPkcs8B64 } = await generateKeyPair();
      const res = await registerOnServer(username.trim(), publicKeySpkiB64);
      const userId = res.userId;
      await storeKeyPair(userId, privateKeyPkcs8B64, publicKeySpkiB64);
      const user = {
        userId,
        username: username.trim(),
        publicKey: publicKeySpkiB64,
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      onSignUp(user);
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setBusy(false);
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
        <p style={{ margin: '0 0 30px 0', opacity: 0.8 }}>Create your account (keys stay on this device)</p>

        <form onSubmit={handleSignUp}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
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
            disabled={busy}
            style={{
              width: '100%',
              padding: '15px',
              background: busy ? '#666' : '#FF9933',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: busy ? 'not-allowed' : 'pointer',
              marginBottom: '15px',
            }}
          >
            {busy ? 'Creating…' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <button
            type="button"
            onClick={onBackToLogin}
            style={{
              background: 'none',
              border: '1px solid #FF9933',
              color: '#FF9933',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUpScreen;
