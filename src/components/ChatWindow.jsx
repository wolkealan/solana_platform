import React, { useState, useEffect, useRef } from 'react';
import { getConversation, sendMessage, initializeSocket, addSocketEventListener } from '../services/messageService';
import '../styles/ChatWindow.css';

const ChatWindow = ({ walletAddress, friend, onClose, style }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialMessages = async () => {
      setLoading(true);
      try {
        const conversation = await getConversation(walletAddress, friend.walletAddress);
        if (isMounted) {
          setMessages(conversation || []);
          setLoading(false);
          setError('');
          scrollToBottom();
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load messages');
          setLoading(false);
        }
      }
    };

    const handleNewMessage = (message) => {
      console.log('ChatWindow received new message:', message);
      if (
        (message.senderWallet === walletAddress && message.receiverWallet === friend.walletAddress) ||
        (message.senderWallet === friend.walletAddress && message.receiverWallet === walletAddress)
      ) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleMessagesRead = () => {
      console.log('ChatWindow received messagesRead');
      setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })));
    };

    fetchInitialMessages();
    const socket = initializeSocket(walletAddress);
    const removeNewMessageListener = addSocketEventListener('newMessage', handleNewMessage);
    const removeMessagesReadListener = addSocketEventListener('messagesRead', handleMessagesRead);

    return () => {
      isMounted = false;
      removeNewMessageListener();
      removeMessagesReadListener();
    };
  }, [walletAddress, friend.walletAddress]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !friend.walletAddress) return;

    try {
      await sendMessage(walletAddress, friend.walletAddress, newMessage);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-window cyberpunk-panel" style={style}>
      <div className="chat-header">
        <h3>{friend.username || 'Unknown'}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="loading-container">
            <div className="loading-indicator"></div>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : messages.length === 0 ? (
          <p className="no-messages">No messages yet. Say hello!</p>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`message ${msg.senderWallet === walletAddress ? 'sent' : 'received'}`}
              >
                <p>{msg.content}</p>
                <span className="message-time">{formatTime(msg.createdAt)}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          className="chat-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="cyber-button send-btn"
          type="submit"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;