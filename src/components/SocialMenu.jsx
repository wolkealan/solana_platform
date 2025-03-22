import React, { useState, useEffect, useCallback } from 'react';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import FriendSearch from './FriendSearch';
import ChatWindow from './ChatWindow';
import MessagesList from './MessagesList';
import { getPendingRequests } from '../services/connectionService';
import { getAllConversations, markMessagesAsRead, initializeSocket, disconnectSocket, addSocketEventListener } from '../services/messageService';
import '../styles/SocialMenu.css';

// Create a custom event system for friend updates
export const friendEvents = {
  listeners: [],
  subscribe: (callback) => {
    console.log('Subscribing to friend events');
    friendEvents.listeners.push(callback);
    return () => {
      console.log('Unsubscribing from friend events');
      friendEvents.listeners = friendEvents.listeners.filter(cb => cb !== callback);
    };
  },
  emit: () => {
    console.log(`Emitting friend update event to ${friendEvents.listeners.length} listeners`);
    friendEvents.listeners.forEach(callback => callback());
  },
};

const SocialMenu = ({ walletAddress, isPointerLocked, onToggleLeaderboard }) => {
  const [activePanel, setActivePanel] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeChats, setActiveChats] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const requests = await getPendingRequests(walletAddress);
        setPendingCount(requests.length);

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
        console.error('Failed to fetch initial data:', error);
      }
    };

    const handleNewMessage = (message) => {
      const friendWallet = message.senderWallet === walletAddress ? message.receiverWallet : message.senderWallet;
      if (message.senderWallet !== walletAddress) {
        setUnreadMessages((prev) => {
          const newCount = (prev[friendWallet] || 0) + 1;
          setTotalUnread((prevTotal) => prevTotal + 1);
          return { ...prev, [friendWallet]: newCount };
        });
      }
    };

    const handleMessagesRead = (friendWallet) => {
      setUnreadMessages((prev) => {
        const newUnread = { ...prev };
        const removedCount = newUnread[friendWallet] || 0;
        delete newUnread[friendWallet];
        setTotalUnread((prevTotal) => prevTotal - removedCount);
        return newUnread;
      });
    };

    fetchInitialData();
    const socket = initializeSocket(walletAddress);
    const removeNewMessageListener = addSocketEventListener('newMessage', handleNewMessage);
    const removeMessagesReadListener = addSocketEventListener('messagesRead', handleMessagesRead);

    // Only disconnect socket on logout or app close, not on panel switch
    return () => {
      removeNewMessageListener();
      removeMessagesReadListener();
      // Do not call disconnectSocket here unless it's a full logout
    };
  }, [walletAddress]);

  const togglePanel = (panel) => {
    if (panel === 'leaderboard') {
      onToggleLeaderboard(true);
    } else {
      setActivePanel(activePanel === panel ? null : panel);
    }
  };

  const openChat = (friend) => {
    if (!friend || !friend.walletAddress) return;
    if (!activeChats.find(chat => chat.walletAddress === friend.walletAddress)) {
      setActiveChats([...activeChats, friend]);
      markMessagesAsRead(walletAddress, friend.walletAddress);
    }
  };

  const closeChat = (friendWallet) => {
    setActiveChats(activeChats.filter(chat => chat.walletAddress !== friendWallet));
  };

  // Friend update handler - this gets passed to all components that can trigger friend updates
  const onFriendUpdate = useCallback(() => {
    console.log('Friend update triggered from SocialMenu');
    friendEvents.emit();
  }, []);

  const getChatPosition = (index) => {
    const baseRight = 20;
    const spacing = 340;
    return { right: baseRight + index * spacing };
  };

  return (
    <div className={`social-menu-container ${isPointerLocked ? 'pointer-locked' : ''}`}>
      <div className="social-buttons">
        <button className="social-btn" onClick={() => togglePanel('leaderboard')}>
          Leaderboard
        </button>
        <button
          className={`social-btn ${activePanel === 'messages' ? 'active' : ''}`}
          onClick={() => togglePanel('messages')}
        >
          Messages
          {totalUnread > 0 && <span className="notification-badge">{totalUnread}</span>}
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
          onFriendUpdate={onFriendUpdate}
        />
      )}
      {activePanel === 'friends' && (
        <FriendsList
          walletAddress={walletAddress}
          onClose={() => setActivePanel(null)}
          onChatOpen={openChat}
          unreadMessages={unreadMessages}
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
          onFriendUpdate={onFriendUpdate}
        />
      )}
      {activeChats.map((friend, index) => (
        <ChatWindow
          key={friend.walletAddress}
          walletAddress={walletAddress}
          friend={friend}
          onClose={() => closeChat(friend.walletAddress)}
          style={getChatPosition(index)}
          onFriendUpdate={onFriendUpdate}
        />
      ))}
    </div>
  );
};

export default SocialMenu;