import React, { useState } from 'react';
import { sendFriendRequest } from '../services/connectionService';
import '../styles/FriendSearch.css';

const FriendSearch = ({ walletAddress, onClose }) => {
  const [searchWallet, setSearchWallet] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchWallet.trim() || searchWallet.trim().length < 32) {
      setError('Please enter a valid wallet address');
      return;
    }
    
    if (searchWallet === walletAddress) {
      setError('You cannot add yourself as a friend');
      return;
    }
    
    try {
      await sendFriendRequest(walletAddress, searchWallet);
      setStatus('Friend request sent successfully!');
      setSearchWallet('');
      setError('');
    } catch (error) {
      if (error.message.includes('Connection already exists')) {
        setError('You already have a connection with this wallet');
      } else if (error.message.includes('not found')) {
        setError('This wallet is not registered in our system');
      } else {
        setError('Failed to send friend request');
      }
    }
  };

  return (
    <div className="friend-search-container">
      <div className="friend-search-header">
        <h2>Add Friend</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter wallet address"
          value={searchWallet}
          onChange={(e) => setSearchWallet(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">
          Send Request
        </button>
      </form>
      
      {error && <p className="error-message">{error}</p>}
      {status && <p className="success-message">{status}</p>}
    </div>
  );
};

export default FriendSearch;