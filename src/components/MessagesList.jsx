import React, { useEffect, useState } from 'react';
import { getAllConversations, initializeSocket, addSocketEventListener } from '../services/messageService';
import '../styles/MessagesList.css';

const MessagesList = ({ walletAddress, onClose, onChatOpen }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchInitialConversations = async () => {
      setLoading(true);
      try {
        const convos = await getAllConversations(walletAddress);
        const uniqueConvos = processConversations(convos);
        if (isMounted) {
          setConversations(uniqueConvos);
          setLoading(false);
          setError('');
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message || 'Failed to load conversations');
          setLoading(false);
        }
      }
    };

    const processConversations = (convos) => {
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
      return uniqueConvos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    const handleNewMessage = (message) => {
      console.log('MessagesList received new message:', message);
      const friendWallet = message.senderWallet === walletAddress ? message.receiverWallet : message.senderWallet;

      setConversations((prev) => {
        const newConvos = [...prev];
        const existingIndex = newConvos.findIndex(c => c.friend.walletAddress === friendWallet);

        if (existingIndex >= 0) {
          console.log('Updating existing conversation:', newConvos[existingIndex]);
          newConvos[existingIndex] = {
            ...newConvos[existingIndex],
            latestMessage: message.content,
            timestamp: message.createdAt,
            unreadCount: message.senderWallet !== walletAddress ? (newConvos[existingIndex].unreadCount || 0) + 1 : 0,
          };
        } else {
          console.log('Adding new conversation for:', friendWallet);
          newConvos.push({
            friend: {
              walletAddress: friendWallet,
              username: message.senderUsername || friendWallet.substring(0, 6),
            },
            latestMessage: message.content,
            timestamp: message.createdAt,
            unreadCount: message.senderWallet !== walletAddress ? 1 : 0,
          });
        }
        return newConvos.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeB - timeA;
        });
      });
    };

    const handleMessagesRead = (data) => {
      console.log('MessagesList received messagesRead:', data);
      const { friendWallet } = data;
      setConversations((prev) =>
        prev.map((convo) =>
          convo.friend.walletAddress === friendWallet ? { ...convo, unreadCount: 0 } : convo
        )
      );
    };

    fetchInitialConversations();
    const socket = initializeSocket(walletAddress);
    const removeNewMessageListener = addSocketEventListener('newMessage', handleNewMessage);
    const removeMessagesReadListener = addSocketEventListener('messagesRead', handleMessagesRead);

    return () => {
      isMounted = false;
      removeNewMessageListener();
      removeMessagesReadListener();
    };
  }, [walletAddress]);

  const formatTime = (timestamp) => {
    return timestamp
      ? new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
      : 'Unknown Time';
  };

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
                  {convo.friend.walletAddress.substring(0, 6)}...
                  {convo.friend.walletAddress.substring(convo.friend.walletAddress.length - 4)}
                </span>
                <span className="latest-message">{convo.latestMessage}</span>
              </div>
              <div className="conversation-meta">
                <span className="timestamp">{formatTime(convo.timestamp)}</span>
                {convo.unreadCount > 0 && <span className="unread-badge">{convo.unreadCount}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessagesList;