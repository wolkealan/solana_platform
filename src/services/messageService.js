// src/services/messageService.js
import api from './api';

// Send a message
export const sendMessage = async (senderWallet, receiverWallet, content) => {
  try {
    const response = await api.post('/messages', {
      senderWallet,
      receiverWallet,
      content
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error sending message' };
  }
};

// Get conversation with a specific friend
export const getConversation = async (walletAddress, friendWallet) => {
  try {
    const response = await api.get(`/messages/conversation/${friendWallet}`, {
      params: { walletAddress }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching conversation' };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (walletAddress, friendWallet) => {
  try {
    const response = await api.put(`/messages/read/${friendWallet}`, { walletAddress });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error marking messages as read' };
  }
};

// Get all conversations (grouped by friend)
export const getAllConversations = async (walletAddress) => {
  try {
    const response = await api.get(`/messages/all`, {
      params: { walletAddress }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching all conversations' };
  }
};