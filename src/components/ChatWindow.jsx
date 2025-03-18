// src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getConversation, sendMessage } from '../services/messageService';
import '../styles/ChatWindow.css';

const ChatWindow = ({ walletAddress, friend, onClose, style }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async (initial = false) => {
      if (!friend || !friend.walletAddress) {
        console.error('Invalid friend object in ChatWindow:', friend);
        if (isMounted && initial) setLoading(false);
        return;
      }

      if (initial) setLoading(true);

      try {
        const conversation = await getConversation(walletAddress, friend.walletAddress);
        if (isMounted) {
          // Process messages to ensure they have the right styling
          const processedMessages = conversation ? conversation.map(msg => ({
            ...msg
          })) : [];
          
          setMessages(processedMessages);
          if (initial) setLoading(false);
          setError('');
          
          // Scroll to bottom on new messages
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      } catch (err) {
        console.error('Error in fetchMessages:', err.message, err.response?.data);
        if (isMounted) {
          setError('Failed to load messages');
          if (initial) setLoading(false);
        }
      }
    };

    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
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
      const updatedMessages = await getConversation(walletAddress, friend.walletAddress);
      
      // Ensure style consistency
      const processedMessages = updatedMessages ? updatedMessages.map(msg => ({
        ...msg
      })) : [];
      
      setMessages(processedMessages);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
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
                <span className="message-time">
                  {formatTime(msg.createdAt)}
                </span>
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