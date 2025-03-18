// src/components/SocialMenu.jsx
import React, { useState, useEffect, useCallback } from 'react';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import FriendSearch from './FriendSearch';
import ChatWindow from './ChatWindow';
import MessagesList from './MessagesList';
import Leaderboard from './Leaderboard';
import { getPendingRequests } from '../services/connectionService';
import { getAllConversations, markMessagesAsRead } from '../services/messageService';
import '../styles/SocialMenu.css';

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

const SocialMenu = ({ walletAddress, isPointerLocked }) => {
  const [activePanel, setActivePanel] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeChats, setActiveChats] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const requests = await getPendingRequests(walletAddress);
        setPendingCount(requests.length);
      } catch (error) {
        console.error('Failed to fetch pending requests:', error.message, error.response?.data);
      }
    };

    const fetchUnreadMessages = async () => {
      try {
        const conversations = await getAllConversations(walletAddress);
        const unreadCounts = {};
        let total = 0;
        
        for (const convo of conversations) {
          const friendWallet = convo.friend?.walletAddress;
          if (friendWallet && convo.unreadCount) {
            unreadCounts[friendWallet] = convo.unreadCount;
            total += convo.unreadCount;
          }
        }
        
        setUnreadMessages(unreadCounts);
        setTotalUnread(total);
      } catch (error) {
        console.error('Failed to fetch unread messages:', error.message, error.response?.data);
      }
    };

    fetchPendingCount();
    fetchUnreadMessages();
    
    const interval = setInterval(() => {
      fetchPendingCount();
      fetchUnreadMessages();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [walletAddress]);

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const openChat = (friend) => {
    if (!friend || !friend.walletAddress) {
      console.error('Invalid friend object:', friend);
      return;
    }
    
    if (!activeChats.find(chat => chat.walletAddress === friend.walletAddress)) {
      setActiveChats([...activeChats, friend]);
      markMessagesAsRead(walletAddress, friend.walletAddress).then(() => {
        setUnreadMessages(prev => {
          const newUnread = { ...prev };
          delete newUnread[friend.walletAddress];
          setTotalUnread(prev => prev - (prev[friend.walletAddress] || 0));
          return newUnread;
        });
      });
    }
  };

  const closeChat = (friendWallet) => {
    setActiveChats(activeChats.filter(chat => chat.walletAddress !== friendWallet));
  };

  const onFriendUpdate = useCallback(() => {
    friendEvents.emit();
  }, []);

  // Position chat windows with appropriate spacing
  const getChatPosition = (index) => {
    const baseRight = 20;
    const spacing = 340; // Width of chat window + margin
    return {
      right: baseRight + (index * spacing)
    };
  };

  return (
    <div className={`social-menu-container ${isPointerLocked ? 'pointer-locked' : ''}`}>
      <div className="social-buttons">
        <button 
          className={`social-btn ${activePanel === 'leaderboard' ? 'active' : ''}`}
          onClick={() => togglePanel('leaderboard')}
        >
          Leaderboard
        </button>
        <button 
          className={`social-btn ${activePanel === 'messages' ? 'active' : ''}`}
          onClick={() => togglePanel('messages')}
        >
          Messages
          {totalUnread > 0 && (
            <span className="notification-badge">
              {totalUnread}
            </span>
          )}
        </button>
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

      {activePanel === 'leaderboard' && (
        <Leaderboard 
          walletAddress={walletAddress} 
          onClose={() => setActivePanel(null)} 
          onFriendUpdate={onFriendUpdate}
        />
      )}
      
      {activePanel === 'messages' && (
        <MessagesList 
          walletAddress={walletAddress} 
          onClose={() => setActivePanel(null)} 
          onChatOpen={openChat}
        />
      )}
      
      {activePanel === 'friends' && (
        <FriendsList 
          walletAddress={walletAddress} 
          onClose={() => setActivePanel(null)} 
          onChatOpen={openChat}
          unreadMessages={unreadMessages}
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

      {activeChats.map((friend, index) => (
        <ChatWindow
          key={friend.walletAddress}
          walletAddress={walletAddress}
          friend={friend}
          onClose={() => closeChat(friend.walletAddress)}
          style={getChatPosition(index)}
        />
      ))}
    </div>
  );
};

export default SocialMenu;