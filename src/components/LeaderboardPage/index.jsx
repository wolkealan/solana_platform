// src/components/LeaderboardPage/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getSwapTransactions, calculatePnL } from '../../services/leaderboardService';
import { sendFriendRequest } from '../../services/connectionService';
import '../../styles/LeaderboardPage.css';

// Cache keys
const LEADERBOARD_CACHE_KEY = 'leaderboard_cache';
const LEADERBOARD_TIMESTAMP_KEY = 'leaderboard_timestamp';
// Cache expires after 10 minutes (in milliseconds)
const CACHE_EXPIRY = 10 * 60 * 1000;
// Refresh interval - 2 minutes
const REFRESH_INTERVAL = 2 * 60 * 1000;

const LeaderboardPage = ({ walletAddress, onReturn }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to check if cache is valid
  const isCacheValid = () => {
    const timestamp = localStorage.getItem(LEADERBOARD_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const lastUpdate = parseInt(timestamp, 10);
    return Date.now() - lastUpdate < CACHE_EXPIRY;
  };

  // Function to get cached leaderboard
  const getCachedLeaderboard = () => {
    try {
      const cachedData = localStorage.getItem(LEADERBOARD_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Error parsing cached leaderboard:', error);
    }
    return null;
  };

  // Function to save leaderboard to cache
  const cacheLeaderboard = (data) => {
    try {
      localStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(LEADERBOARD_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching leaderboard:', error);
    }
  };

  // Main function to fetch leaderboard data
  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      // Fetch all registered users
      const users = await getAllUsers();
      
      // Calculate PnL for each user
      const leaderboardData = [];
      for (const user of users) {
        if (!user.walletAddress) continue; // Skip if walletAddress is missing
        
        try {
          const swaps = await getSwapTransactions(user.walletAddress);
          const { profit } = calculatePnL(swaps);
          leaderboardData.push({
            walletAddress: user.walletAddress,
            username: user.username || user.walletAddress.substring(0, 6),
            profit: profit || 0
          });
        } catch (err) {
          console.error(`Failed to calculate PnL for ${user.walletAddress}:`, err.message);
          leaderboardData.push({
            walletAddress: user.walletAddress,
            username: user.username || user.walletAddress.substring(0, 6),
            profit: 0
          });
        }
        
        // Only add small delay when refreshing to prevent UI freeze
        if (isRefresh) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Sort by profit (descending)
      leaderboardData.sort((a, b) => b.profit - a.profit);
      
      // Update state and cache
      setLeaderboard(leaderboardData);
      cacheLeaderboard(leaderboardData);
      setLastUpdated(new Date());
      
      // Clear loading states
      if (!isRefresh) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
      
      // Clear any previous errors
      setError('');
    } catch (error) {
      console.error('Error fetching leaderboard:', error.message, error.response?.data);
      setError('Failed to load leaderboard');
      if (!isRefresh) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  // Initial load - check cache first, then fetch if needed
  useEffect(() => {
    const loadLeaderboard = async () => {
      // Try to load from cache first
      if (isCacheValid()) {
        const cachedData = getCachedLeaderboard();
        if (cachedData && cachedData.length > 0) {
          setLeaderboard(cachedData);
          setLoading(false);
          console.log('Loaded leaderboard from cache');
          
          // Get timestamp and set last updated
          const timestamp = localStorage.getItem(LEADERBOARD_TIMESTAMP_KEY);
          if (timestamp) {
            setLastUpdated(new Date(parseInt(timestamp, 10)));
          }
          
          // Still refresh in background after a short delay
          setTimeout(() => fetchLeaderboard(true), 1000);
          return;
        }
      }
      
      // Cache not valid or empty, fetch fresh data
      fetchLeaderboard(false);
    };

    loadLeaderboard();
    
    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      console.log('Refreshing leaderboard data...');
      fetchLeaderboard(true);
    }, REFRESH_INTERVAL);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, [fetchLeaderboard]);

  const handleSendFriendRequest = async (receiverWallet) => {
    if (receiverWallet === walletAddress) {
      alert("You cannot send a friend request to yourself.");
      return;
    }
    
    try {
      await sendFriendRequest(walletAddress, receiverWallet);
      alert('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error.message, error.response?.data);
      alert('Failed to send friend request: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatTimestamp = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle keyboard events for Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onReturn();
    }
  }, [onReturn]);

  // Add and remove event listener for escape key
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Format wallet address for display
  const formatWallet = (wallet) => {
    if (!wallet) return '';
    return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
  };

  return (
    <div className="leaderboard-page">
      {/* Full-screen solid background */}
      <div className="leaderboard-fullscreen-bg"></div>
      
      {/* Decorative grid and overlays */}
      <div className="leaderboard-grid"></div>
      <div className="leaderboard-vignette"></div>
      
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <button className="back-button" onClick={onReturn}>
            <span className="back-icon">←</span>
            <span className="back-text">Back</span>
          </button>
          <h1>LEADERBOARD</h1>
          <div className="header-spacer"></div>
        </div>
        
        <div className="leaderboard-status">
          {refreshing && <span className="refreshing-indicator">Refreshing data...</span>}
          {lastUpdated && (
            <span className="last-updated">
              Last updated: {formatTimestamp(lastUpdated)}
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-indicator"></div>
            <p>Loading leaderboard data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => fetchLeaderboard(false)}>
              Try Again
            </button>
          </div>
        ) : (
          <div className="leaderboard-table-container">
            {leaderboard.length === 0 ? (
              <div className="no-data">
                <p>No leaderboard data available</p>
              </div>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="rank-col">RANK</th>
                    <th className="username-col">USERNAME</th>
                    <th className="wallet-col">WALLET</th>
                    <th className="pnl-col">PNL</th>
                    <th className="action-col">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.walletAddress} className={entry.walletAddress === walletAddress ? 'own-wallet' : ''}>
                      <td className="rank-col">
                        <span className="rank">#{index + 1}</span>
                      </td>
                      <td className="username-col">{entry.username}</td>
                      <td className="wallet-col">{formatWallet(entry.walletAddress)}</td>
                      <td className={`pnl-col ${entry.profit < 0 ? 'negative' : 'positive'}`}>
                        {entry.profit.toFixed(2)} SOL
                      </td>
                      <td className="action-col">
                        {entry.walletAddress !== walletAddress && (
                          <button
                            className="friend-request-btn"
                            onClick={() => handleSendFriendRequest(entry.walletAddress)}
                          >
                            Send Friend Request
                          </button>
                        )}
                        {entry.walletAddress === walletAddress && (
                          <span className="you-badge">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;