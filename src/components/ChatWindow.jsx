// src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getConversation, markMessagesAsRead } from '../services/messageService';
import '../styles/ChatWindow.css';

const ChatWindow = ({ walletAddress, friend, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        console.log(`Fetching conversation for ${walletAddress} with ${friend.walletAddress}`);
        const conversation = await getConversation(walletAddress, friend.walletAddress);
        console.log('Conversation data:', conversation);
        setMessages(conversation);
        await markMessagesAsRead(walletAddress, friend.walletAddress);
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setError('Failed to load conversation. Check console for details.');
      }
    };

    fetchConversation();
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [walletAddress, friend.walletAddress]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      console.log(`Sending message from ${walletAddress} to ${friend.walletAddress}: ${newMessage}`);
      const message = await sendMessage(walletAddress, friend.walletAddress, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Check console for details.');
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{friend.username || friend.walletAddress}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="chat-messages">
        {error && <p className="error-message">{error}</p>}
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${msg.senderWallet === walletAddress ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{msg.content}</p>
                <span>{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="send-btn">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;