import React, { useState, useEffect } from 'react';
import ContactsScreen from './screens/ContactsScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleSignUp = (user) => {
    setCurrentUser(user);
    setShowSignUp(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  if (currentUser) {
    return (
      <ContactsScreen
        currentUser={currentUser}
        onLogout={handleLogout}
        onUserUpdate={setCurrentUser}
      />
    );
  }

  if (showSignUp) {
    return (
      <SignUpScreen
        onSignUp={handleSignUp}
        onBackToLogin={() => setShowSignUp(false)}
      />
    );
  }

  return (
    <LoginScreen onLogin={handleLogin} onSignUp={() => setShowSignUp(true)} />
  );
}

export default App;
