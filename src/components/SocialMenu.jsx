// src/components/SocialMenu.jsx
import React, { useState, useEffect, useCallback } from 'react';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import FriendSearch from './FriendSearch';
import { getPendingRequests } from '../services/connectionService';
import '../styles/SocialMenu.css';

// Create a simple event system for friend updates
export const friendEvents = {
  listeners: [],
  subscribe: (callback) => {
    friendEvents.listeners.push(callback);
    return () => {
      friendEvents.listeners = friendEvents.listeners.filter(cb => cb !== callback);
    };
  },
  emit: () => {
    friendEvents.listeners.forEach(callback => callback());
  }
};

const SocialMenu = ({ walletAddress }) => {
  const [activePanel, setActivePanel] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Fetch pending request count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const requests = await getPendingRequests(walletAddress);
        setPendingCount(requests.length);
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
      }
    };
    
    fetchPendingCount();
    
    // Set up interval to refresh pending requests count
    const interval = setInterval(fetchPendingCount, 30000); // every 30 seconds
    
    return () => clearInterval(interval);
  }, [walletAddress]);
  
  const togglePanel = (panel) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };
  
  // Notify about friend updates
  const onFriendUpdate = useCallback(() => {
    friendEvents.emit();
  }, []);
  
  return (
    <div className="social-menu-container">
      <div className="social-buttons">
        <button 
          className={`social-btn ${activePanel === 'friends' ? 'active' : ''}`}
          onClick={() => togglePanel('friends')}
        >
          Friends
        </button>
        
        <button 
          className={`social-btn ${activePanel === 'requests' ? 'active' : ''}`}
          onClick={() => togglePanel('requests')}
        >
          Requests
          {pendingCount > 0 && <span className="notification-badge">{pendingCount}</span>}
        </button>
        
        <button 
          className={`social-btn ${activePanel === 'search' ? 'active' : ''}`}
          onClick={() => togglePanel('search')}
        >
          Add Friend
        </button>
      </div>
      
      {activePanel === 'friends' && (
        <FriendsList 
          walletAddress={walletAddress} 
          onClose={() => setActivePanel(null)} 
          onFriendUpdate={onFriendUpdate}
        />
      )}
      
      {activePanel === 'requests' && (
        <FriendRequests 
          walletAddress={walletAddress} 
          onClose={() => setActivePanel(null)} 
          onFriendUpdate={onFriendUpdate}
        />
      )}
      
      {activePanel === 'search' && (
        <FriendSearch 
          walletAddress={walletAddress} 
          onClose={() => setActivePanel(null)} 
        />
      )}
    </div>
  );
};

export default SocialMenu;