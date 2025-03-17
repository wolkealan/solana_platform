import api from './api';

// Send friend request
export const sendFriendRequest = async (senderWallet, receiverWallet) => {
  try {
    const response = await api.post('/connections/request', {
      senderWallet,
      receiverWallet
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error connecting to server' };
  }
};

// Accept or reject friend request
export const respondToFriendRequest = async (connectionId, status) => {
  try {
    const response = await api.put(`/connections/request/${connectionId}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error connecting to server' };
  }
};

// Get pending friend requests
export const getPendingRequests = async (walletAddress) => {
  try {
    const response = await api.get(`/connections/pending/${walletAddress}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching pending requests:', error.message, error.response?.data);
    throw error.response?.data || { message: 'Error fetching pending requests' };
  }
};



// Get all friends
export const getFriends = async (walletAddress) => {
  try {
    const response = await api.get(`/connections/friends/${walletAddress}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error connecting to server' };
  }
};