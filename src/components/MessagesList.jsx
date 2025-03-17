// src/components/MessagesList.jsx
import React, { useEffect, useState } from 'react';
import { getAllConversations } from '../services/messageService';
import '../styles/MessagesList.css';

const MessagesList = ({ walletAddress, onClose, onChatOpen }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true); // Only true for initial load
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component

    const fetchConversations = async (initial = false) => {
      if (initial) setLoading(true); // Set loading only for initial fetch
      console.log('Fetching conversations with walletAddress:', walletAddress); // Debug walletAddress

      try {
        const convos = await getAllConversations(walletAddress);
        console.log('Raw conversations from getAllConversations:', convos);

        // Deduplicate conversations by friend walletAddress
        const uniqueConvos = [];
        const seenWallets = new Set();
        for (const convo of convos) {
          const friendWallet = convo.friend?.walletAddress;
          if (friendWallet && !seenWallets.has(friendWallet)) {
            seenWallets.add(friendWallet);
            uniqueConvos.push({
              friend: {
                walletAddress: friendWallet,
                username: convo.friend.username || friendWallet.substring(0, 6),
              },
              latestMessage: convo.latestMessage?.content || 'No message',
              timestamp: convo.latestMessage?.createdAt || convo.latestMessage?.updatedAt,
              unreadCount: convo.unreadCount || 0,
            });
          }
        }

        // Sort by timestamp (most recent first)
        uniqueConvos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        if (isMounted) {
          setConversations(uniqueConvos);
          setLoading(false); // Only set loading to false on initial success
          setError(''); // Clear error on success
        }
      } catch (error) {
        console.error('Error in fetchConversations:', error.message, error.response?.data);
        if (isMounted) {
          setError(error.response?.data?.message || 'Failed to load conversations');
          if (initial) setLoading(false); // Only set loading to false on initial failure
        }
      }
    };

    fetchConversations(true); // Initial fetch with loading
    const interval = setInterval(() => fetchConversations(false), 30000); // Polling without loading

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [walletAddress]);

  return (
    <div className="messages-list-container">
      <div className="messages-list-header">
        <h2>Messages</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {loading ? (
        <p>Loading conversations...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : conversations.length === 0 ? (
        <p>No conversations yet</p>
      ) : (
        <ul className="conversations-list">
          {conversations.map((convo) => (
            <li
              key={convo.friend.walletAddress}
              className="conversation-item"
              onClick={() => onChatOpen(convo.friend)}
            >
              <div className="conversation-info">
                <span className="username">{convo.friend.username}</span>
                <span className="wallet">
                  {convo.friend.walletAddress
                    ? `${convo.friend.walletAddress.substring(0, 6)}...${convo.friend.walletAddress.substring(convo.friend.walletAddress.length - 4)}`
                    : 'Unknown Wallet'}
                </span>
                <span className="latest-message">{convo.latestMessage}</span>
              </div>
              <div className="conversation-meta">
                <span className="timestamp">
                  {convo.timestamp
                    ? new Date(convo.timestamp).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'Unknown Time'}
                </span>
                {convo.unreadCount > 0 && (
                  <span className="unread-badge">{convo.unreadCount}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessagesList;