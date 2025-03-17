// src/services/userService.js
import api from './api';

// Register a new user
export const registerUser = async (walletAddress, username, character) => {
  try {
    const response = await api.post('/users/register', {
      walletAddress,
      username,
      character
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response?.data || { message: 'Error connecting to server' };
  }
};

// Get user by wallet address
export const getUserByWallet = async (walletAddress) => {
  try {
    const response = await api.get(`/users/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error.response?.data || { message: 'Error connecting to server' };
  }
};

// Update user character
export const updateUserCharacter = async (walletAddress, character) => {
  try {
    const response = await api.put(`/users/${walletAddress}`, { character });
    return response.data;
  } catch (error) {
    console.error("Update character error:", error);
    throw error.response?.data || { message: 'Error connecting to server' };
  }
};