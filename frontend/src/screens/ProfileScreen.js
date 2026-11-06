import React, { useState, useRef } from 'react';
import { deleteAllUserChatsApi } from '../api';

function ProfileScreen({ currentUser, onBack, onProfileUpdate }) {
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.profilePhoto || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    const updatedUser = {
      ...currentUser,
      profilePhoto,
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    onProfileUpdate(updatedUser);
    setIsEditing(false);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setIsEditing(true);
  };

  const handlePermanentDelete = async () => {
    const confirmMessage = `
⚠️ PERMANENT DELETION WARNING ⚠️

This will PERMANENTLY delete ALL SENT messages for user "${currentUser.username}".

This action will:
❌ Delete all messages YOU HAVE SENT to every contact
❌ Delete YOUR sent chat history from server
❌ Delete YOUR sent local data from this device
❌ PRESERVE all messages you have RECEIVED from others
❌ This CANNOT be undone

⚠️ IMPORTANT: This will NOT delete messages others have sent to you.
Your received messages will be preserved.

Are you absolutely sure you want to proceed?
    `.trim();

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsDeleting(true);
      console.log('🗑️ Starting permanent deletion for user:', currentUser.username);

      const deleteResult = await deleteAllUserChatsApi(currentUser.userId);
      
      if (deleteResult?.success) {
        console.log('✅ Permanent deletion successful:', deleteResult.deletedCount, 'messages deleted');
        setDeleteCount(deleteResult.deletedCount);
        
        // Clear all chat-related localStorage for this user
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(`chat_${currentUser.userId}_`)
        );
        keys.forEach(key => {
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_deleted`);
        });
        
        alert(`✅ PERMANENT DELETION COMPLETE\n\n${deleteResult.deletedCount} SENT messages permanently deleted from server and all devices.\n\nYour RECEIVED messages from others have been preserved.\n\nThis action cannot be undone.`);
      } else {
        throw new Error(deleteResult?.error || 'Permanent deletion failed');
      }
      
    } catch (error) {
      console.error('❌ Permanent deletion error:', error);
      alert(`❌ PERMANENT DELETION FAILED\n\n${error.message}`);
    } finally {
      setIsDeleting(false);
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
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '20px',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid #FF9933',
            color: '#FF9933',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Profile</h1>
        {isEditing && (
          <button
            type="button"
            onClick={handleSaveProfile}
            style={{
              background: '#00ff88',
              border: 'none',
              color: 'black',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Save
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '3px solid #FF9933',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              overflow: 'hidden',
            }}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontSize: '48px', opacity: 0.6 }}>
                {currentUser?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              {profilePhoto ? 'Change Photo' : 'Upload Photo'}
            </button>
            {profilePhoto && (
              <button type="button" onClick={handleRemovePhoto} style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                Remove
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(0,0,0,0.6)',
            padding: '30px',
            borderRadius: '15px',
            textAlign: 'center',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <h2 style={{ margin: '0 0 10px 0' }}>{currentUser?.username}</h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '12px', wordBreak: 'break-all' }}>
            User id: {currentUser?.userId}
          </p>
          {deleteCount > 0 && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #FF9933' }}>
              <strong style={{ color: '#dc3545' }}>Last Deletion:</strong> {deleteCount} messages deleted
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px' }}>
          <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>
            ⚠️ DANGER ZONE
          </h3>
          
          <button
            type="button"
            onClick={handlePermanentDelete}
            disabled={isDeleting}
            style={{
              background: isDeleting ? '#6c757d' : '#dc3545',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%',
              maxWidth: '300px',
              transition: 'all 0.3s ease'
            }}
          >
            {isDeleting ? '🗑️ DELETING...' : '🗑️ DELETE ALL SENT CHATS'}
          </button>
          
          <div style={{ 
            marginTop: '15px', 
            fontSize: '12px', 
            opacity: 0.8,
            lineHeight: '1.4'
          }}>
            <strong>⚠️ WARNING:</strong> This action cannot be undone.<br/>
            All your SENT messages will be permanently deleted from the server and all devices.<br/>
            <strong>Your RECEIVED messages from others will be preserved.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;
