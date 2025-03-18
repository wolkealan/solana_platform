import api from './api';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
let socket = null;

export const initializeSocket = (walletAddress) => {
  if (!socket || !socket.connected) {
    console.log('Initializing new WebSocket connection for wallet:', walletAddress);
    socket = io(API_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected, socket ID:', socket.id);
      socket.emit('join', walletAddress);
    });

    socket.on('newMessage', (message) => {
      console.log('Received newMessage:', message);
    });

    socket.on('messagesRead', (data) => {
      console.log('Received messagesRead:', data);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  } else {
    console.log('Reusing existing WebSocket connection, socket ID:', socket.id);
    socket.emit('join', walletAddress);
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting WebSocket, socket ID:', socket.id);
    socket.disconnect();
    socket = null;
  }
};

// Updated addSocketEventListener to handle null socket safely
export const addSocketEventListener = (event, callback) => {
  if (socket) {
    console.log(`Adding ${event} listener to socket ${socket.id}`);
    socket.on(event, callback);
    return () => {
      if (socket) {
        console.log(`Removing ${event} listener from socket ${socket.id}`);
        socket.off(event, callback);
      } else {
        console.log(`Socket is null, skipping removal of ${event} listener`);
      }
    };
  }
  console.log(`Socket is null, adding no-op listener for ${event}`);
  return () => {}; // No-op cleanup if socket is null
};

// Rest of the file remains unchanged
export const sendMessage = async (senderWallet, receiverWallet, content) => {
  try {
    const response = await api.post('/messages', {
      senderWallet,
      receiverWallet,
      content,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error sending message' };
  }
};

export const getConversation = async (walletAddress, friendWallet) => {
  try {
    const response = await api.get(`/messages/conversation/${friendWallet}`, {
      params: { walletAddress },
    });
    return response.data || [];
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching conversation' };
  }
};

export const markMessagesAsRead = async (walletAddress, friendWallet) => {
  try {
    const response = await api.put(`/messages/read/${friendWallet}`, { walletAddress });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error marking messages as read' };
  }
};

export const getAllConversations = async (walletAddress) => {
  try {
    const response = await api.get(`/messages/all`, {
      params: { walletAddress },
    });
    return response.data || [];
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching all conversations' };
  }
};