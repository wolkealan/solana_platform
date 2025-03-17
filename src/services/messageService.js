// src/services/messageService.js
import api from './api';

// Utility function to transform raw conversation data into friend-based format
const transformConversation = (convo, walletAddress, friendsMap) => {
  const friendWallet = convo.senderWallet === walletAddress ? convo.receiverWallet : convo.senderWallet;
  const username = friendsMap[friendWallet] || friendWallet.substring(0, 6); // Fallback to wallet prefix if no username
  return {
    friend: { walletAddress: friendWallet, username },
    latestMessage: convo.content,
    timestamp: convo.createdAt || convo.updatedAt,
    unreadCount: convo.read ? 0 : 1, // Simplified; adjust based on your unread logic
  };
};

// Send a message
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

// Get conversation with a specific friend
export const getConversation = async (walletAddress, friendWallet) => {
  try {
    const response = await api.get(`/messages/conversation/${friendWallet}`, {
      params: { walletAddress },
    });
    return response.data || []; // Return empty array if no data
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
      params: { walletAddress },
    });
    return response.data || []; // Return empty array if no data
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching all conversations' };
  }
};

// Export transform function for use in components
export { transformConversation };