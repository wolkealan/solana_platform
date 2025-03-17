// src/components/ChatWindow.jsx
import React, { useState, useEffect } from 'react';
import { getConversation, sendMessage } from '../services/messageService';
import '../styles/ChatWindow.css';

const ChatWindow = ({ walletAddress, friend, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true); // Only true for initial load
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component

    const fetchMessages = async (initial = false) => {
      if (!friend || !friend.walletAddress) {
        console.error('Invalid friend object in ChatWindow:', friend);
        if (isMounted && initial) setLoading(false);
        return;
      }

      if (initial) setLoading(true); // Set loading only for initial fetch

      try {
        const conversation = await getConversation(walletAddress, friend.walletAddress);
        if (isMounted) {
          setMessages(conversation || []);
          if (initial) setLoading(false); // Only set loading to false on initial success
          setError(''); // Clear error on success
        }
      } catch (err) {
        console.error('Error in fetchMessages:', err.message, err.response?.data);
        if (isMounted) {
          setError('Failed to load messages');
          if (initial) setLoading(false); // Only set loading to false on initial failure
        }
      }
    };

    fetchMessages(true); // Initial fetch with loading
    const interval = setInterval(() => fetchMessages(false), 5000); // Polling without loading

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [walletAddress, friend.walletAddress]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !friend.walletAddress) return;

    try {
      await sendMessage(walletAddress, friend.walletAddress, newMessage);
      setNewMessage('');
      const updatedMessages = await getConversation(walletAddress, friend.walletAddress);
      setMessages(updatedMessages || []);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{friend.username || 'Unknown'}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="chat-messages">
        {loading ? (
          <p>Loading messages...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.senderWallet === walletAddress ? 'sent' : 'received'}`}
            >
              <p>{msg.content}</p>
              <span>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))
        )}
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          className="chat-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="send-btn" type="submit">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;