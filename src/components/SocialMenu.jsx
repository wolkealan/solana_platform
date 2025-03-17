// src/components/SocialMenu.jsx
import React, { useState, useEffect, useCallback } from 'react';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import FriendSearch from './FriendSearch';
import ChatWindow from './ChatWindow';
import MessagesList from './MessagesList';
import { getPendingRequests, getFriends } from '../services/connectionService';
import { markMessagesAsRead, getConversation, getAllConversations } from '../services/messageService';
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

  useEffect(() => {
    console.log('isPointerLocked:', isPointerLocked);
    const fetchPendingCount = async () => {
      try {
        const requests = await getPendingRequests(walletAddress);
        setPendingCount(requests.length);
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
      }
    };

    const fetchUnreadMessages = async () => {
      try {
        const conversations = await getAllConversations(walletAddress);
        console.log('Fetched conversations:', conversations);
        const unreadCounts = {};
        for (const convo of conversations) {
          const friendWallet = convo.senderWallet === walletAddress ? convo.receiverWallet : convo.senderWallet;
          if (!unreadCounts[friendWallet] && !convo.read) {
            unreadCounts[friendWallet] = (unreadCounts[friendWallet] || 0) + 1;
          }
        }
        setUnreadMessages(unreadCounts);
      } catch (error) {
        console.error('Failed to fetch unread messages:', error);
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
    console.log('openChat called with friend:', friend);
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

  return (
    <div className={`social-menu-container ${isPointerLocked ? 'pointer-locked' : ''}`}>
      <div className="social-buttons">
        <button 
          className={`social-btn ${activePanel === 'messages' ? 'active' : ''}`}
          onClick={() => togglePanel('messages')}
        >
          Messages
          {Object.keys(unreadMessages).length > 0 && (
            <span className="notification-badge">
              {Object.values(unreadMessages).reduce((a, b) => a + b, 0)}
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

      {activeChats.map(friend => (
        <ChatWindow
          key={friend.walletAddress}
          walletAddress={walletAddress}
          friend={friend}
          onClose={() => closeChat(friend.walletAddress)}
        />
      ))}
    </div>
  );
};

export default SocialMenu;