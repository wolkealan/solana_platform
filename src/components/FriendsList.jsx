// src/components/FriendsList.jsx
import React, { useEffect, useState } from 'react';
import { getFriends } from '../services/connectionService';
import '../styles/FriendsList.css';

const FriendsList = ({ walletAddress, onClose }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Force refresh when a friend is added
  const refreshFriends = () => {
    setLastRefresh(Date.now());
  };

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
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchFriends, 30000);
    
    return () => clearInterval(interval);
  }, [walletAddress, lastRefresh]);

  return (
    <div className="friends-list-container">
      <div className="friends-list-header">
        <h2>Friends</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      {loading ? (
        <p>Loading friends...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : friends.length === 0 ? (
        <p>No friends yet</p>
      ) : (
        <ul className="friends-list">
          {friends.map((friend) => (
            <li key={friend.walletAddress} className="friend-item">
              <div className="friend-info">
                <span className="username">{friend.username}</span>
                <span className="wallet">{friend.walletAddress.substring(0, 6)}...{friend.walletAddress.substring(friend.walletAddress.length - 4)}</span>
              </div>
              <div className="friend-character">
                <img 
                  src={`/thumbnails/${friend.character}.png`} 
                  alt={friend.character} 
                  className="character-thumbnail"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsList;