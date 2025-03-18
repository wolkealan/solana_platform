// src/components/FriendsList.jsx
import React, { useEffect, useState } from 'react';
import { getFriends } from '../services/connectionService';
import '../styles/FriendsList.css';

const FriendsList = ({ walletAddress, onClose, onChatOpen, unreadMessages }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const friendsList = await getFriends(walletAddress);
        setFriends(friendsList);
        setLoading(false);
      } catch (error) {
        setError('Failed to load friends');
        setLoading(false);
      }
    };

    fetchFriends();
    const interval = setInterval(fetchFriends, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  // Format wallet address for display
  const formatWallet = (wallet) => {
    if (!wallet) return '';
    return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
  };

  return (
    <div className="friends-list-container">
      <div className="friends-list-header">
        <h2>Friends</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-indicator"></div>
          <p>Loading friends...</p>
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : friends.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any friends yet</p>
          <p className="empty-state-hint">Use the "Add Friend" button to connect with others</p>
        </div>
      ) : (
        <ul className="friends-list">
          {friends.map((friend) => (
            <li key={friend.walletAddress} className="friend-item">
              <div className="friend-info">
                <span className="username">{friend.username}</span>
                <span className="wallet">{formatWallet(friend.walletAddress)}</span>
              </div>
              <div className="friend-actions">
                <button 
                  className="chat-btn"
                  onClick={() => onChatOpen(friend)}
                >
                  Chat
                  {unreadMessages[friend.walletAddress] > 0 && (
                    <span className="unread-badge">{unreadMessages[friend.walletAddress]}</span>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsList;