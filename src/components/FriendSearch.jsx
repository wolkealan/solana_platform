import React, { useState } from 'react';
import { sendFriendRequest } from '../services/connectionService';
import '../styles/FriendSearch.css';

const FriendSearch = ({ walletAddress, onClose }) => {
  const [searchWallet, setSearchWallet] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    
    setLoading(true);
    setError('');
    setStatus('');
    
    try {
      await sendFriendRequest(walletAddress, searchWallet);
      setStatus('Friend request sent successfully!');
      setSearchWallet('');
    } catch (error) {
      if (error.message?.includes('Connection already exists')) {
        setError('You already have a connection with this wallet');
      } else if (error.message?.includes('not found')) {
        setError('This wallet is not registered in our system');
      } else {
        setError('Failed to send friend request');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Format wallet address for display if too long
  const formatWalletInput = (value) => {
    setSearchWallet(value);
    // No formatting needed for now, but could add real-time validation here
  };

  return (
    <div className="friend-search-container">
      <div className="friend-search-header">
        <h2>Add Friend</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="search-content">
        <p className="search-info">Enter a Solana wallet address to send a friend request</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Enter wallet address"
            value={searchWallet}
            onChange={(e) => formatWalletInput(e.target.value)}
            className="search-input"
          />
          <button 
            type="submit" 
            className="search-btn"
            disabled={loading || !searchWallet.trim()}
          >
            {loading ? (
              <span className="btn-loading">Sending...</span>
            ) : (
              'Send Request'
            )}
          </button>
        </form>
        
        {error && <p className="error-message">{error}</p>}
        {status && <p className="success-message">{status}</p>}
      </div>
    </div>
  );
};

export default FriendSearch;