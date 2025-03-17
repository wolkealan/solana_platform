// src/components/MessagesList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getAllConversations } from '../services/messageService';
import '../styles/MessagesList.css';

const MessagesList = ({ walletAddress, onClose, onChatOpen }) => {
  const [conversations, setConversations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      const convos = await getAllConversations(walletAddress);
      // Merge new conversations with existing ones to avoid full re-render
      setConversations((prevConvos) => {
        const updatedConvos = [...convos];
        const existingWallets = new Set(prevConvos.map(convo => convo.friend.walletAddress));

        // Add new conversations
        convos.forEach((newConvo) => {
          const index = prevConvos.findIndex(
            (convo) => convo.friend.walletAddress === newConvo.friend.walletAddress
          );
          if (index !== -1) {
            // Update existing conversation
            updatedConvos[index] = newConvo;
          } else {
            // Add new conversation
            updatedConvos.push(newConvo);
          }
        });

        // Remove conversations that no longer exist
        const newWallets = new Set(convos.map(convo => convo.friend.walletAddress));
        const filteredConvos = updatedConvos.filter((convo) =>
          newWallets.has(convo.friend.walletAddress)
        );

        // Sort by latest message timestamp (descending)
        return filteredConvos.sort((a, b) => {
          const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt).getTime() : 0;
          const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      });

      setInitialLoading(false);
    } catch (err) {
      setError('Failed to load conversations');
      setInitialLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const handleChatOpen = (friend) => {
    console.log('Opening chat with:', friend);
    onChatOpen(friend);
  };

  return (
    <div className="messages-list-container">
      <div className="messages-list-header">
        <h2>Messages</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      {initialLoading ? (
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
              onClick={() => handleChatOpen(convo.friend)}
            >
              <div className="conversation-info">
                <span className="username">{convo.friend.username}</span>
                <span className="wallet">
                  {convo.friend.walletAddress.substring(0, 6)}...
                  {convo.friend.walletAddress.substring(convo.friend.walletAddress.length - 4)}
                </span>
                {convo.latestMessage && (
                  <span className="latest-message">
                    {convo.latestMessage.content.length > 20
                      ? `${convo.latestMessage.content.substring(0, 20)}...`
                      : convo.latestMessage.content}
                  </span>
                )}
              </div>
              <div className="conversation-meta">
                {convo.latestMessage && (
                  <span className="timestamp">
                    {new Date(convo.latestMessage.createdAt).toLocaleTimeString()}
                  </span>
                )}
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