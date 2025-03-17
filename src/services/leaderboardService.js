// src/services/leaderboardService.js
import api from './api';
import axios from 'axios';

// Solscan API key from .env (hardcoded here as per your input)
const SOLSCAN_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3Mzg1NTI5NDQ4NTcsImVtYWlsIjoiY2hvd25zX3Jvb3Q3NzdAcHJvdG9uLm1lIiwiYWN0aW9uIjoidG9rZW4tYXBpIiwiYXBpVmVyc2lvbiI6InYyIiwiaWF0IjoxNzM4NTUyOTQ0fQ.RBdiCoY6r25OB2rldWxPZ9F0ExjXFPIEIT93_-NevM0';
const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';

// Fetch all registered users from MongoDB
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching users:', error.message, error.response?.data);
    throw error;
  }
};

// Fetch 1 week of swap transactions for a wallet from Solscan
export const getSwapTransactions = async (walletAddress) => {
  const toTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const fromTime = toTime - 7 * 24 * 60 * 60; // 7 days ago in seconds
  let allSwaps = [];
  let page = 1;
  const pageSize = 100;

  while (page <= 50) {
    try {
      const response = await axios.get('https://pro-api.solscan.io/v2.0/account/defi/activities', {
        params: {
          address: walletAddress,
          'activity_type[]': ['ACTIVITY_TOKEN_SWAP', 'ACTIVITY_AGG_TOKEN_SWAP'],
          from_time: fromTime,
          to_time: toTime,
          page: page,
          page_size: pageSize,
          sort_by: 'block_time',
          sort_order: 'desc'
        },
        headers: { 'token': SOLSCAN_API_KEY }
      });

      const swaps = response.data.data || [];
      allSwaps = allSwaps.concat(swaps);
      if (swaps.length < pageSize) break;
      page++;
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
    } catch (error) {
      console.error(`Error fetching swaps for ${walletAddress}:`, error.message);
      break;
    }
  }

  return allSwaps;
};

// Calculate PnL for a wallet based on swap transactions
export const calculatePnL = (swaps) => {
  let totalSolSpent = 0;
  let totalSolReceived = 0;

  for (const swap of swaps) {
    const routers = swap.routers;
    // Buy: SOL → Token
    if (routers.token1 === SOL_ADDRESS && routers.token2 !== SOL_ADDRESS) {
      const solSpent = parseFloat(routers.amount1) / Math.pow(10, routers.token1_decimals);
      totalSolSpent += solSpent;
    }
    // Sell: Token → SOL
    else if (routers.token1 !== SOL_ADDRESS && routers.token2 === SOL_ADDRESS) {
      const solReceived = parseFloat(routers.amount2) / Math.pow(10, routers.token2_decimals);
      totalSolReceived += solReceived;
    }
    // Handle child routers (for aggregated swaps)
    if (routers.child_routers && routers.child_routers.length > 0) {
      for (const child of routers.child_routers) {
        if (child.token1 === SOL_ADDRESS && child.token2 !== SOL_ADDRESS) {
          const solSpent = parseFloat(child.amount1) / Math.pow(10, child.token1_decimals);
          totalSolSpent += solSpent;
        } else if (child.token1 !== SOL_ADDRESS && child.token2 === SOL_ADDRESS) {
          const solReceived = parseFloat(child.amount2) / Math.pow(10, child.token2_decimals);
          totalSolReceived += solReceived;
        }
      }
    }
  }

  const profit = totalSolReceived - totalSolSpent;
  const roi = totalSolSpent > 0 ? (profit / totalSolSpent) * 100 : 0;

  return { profit, roi };
};