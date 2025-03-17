// src/components/Leaderboard.jsx
import React, { useEffect, useState } from 'react';
import { getAllUsers, getSwapTransactions, calculatePnL } from '../services/leaderboardService';
import { sendFriendRequest } from '../services/connectionService';
import '../styles/Leaderboard.css';

const Leaderboard = ({ walletAddress, onClose, onFriendUpdate }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);

        // Fetch all registered users
        const users = await getAllUsers();
        console.log('Fetched users:', users);

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
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        }

        // Sort by profit (descending)
        leaderboardData.sort((a, b) => b.profit - a.profit);
        setLeaderboard(leaderboardData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error.message, error.response?.data);
        setError('Failed to load leaderboard');
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleSendFriendRequest = async (receiverWallet) => {
    if (receiverWallet === walletAddress) {
      alert("You cannot send a friend request to yourself.");
      return;
    }
    try {
      await sendFriendRequest(walletAddress, receiverWallet);
      alert('Friend request sent!');
      onFriendUpdate(); // Notify parent component of friend update
    } catch (error) {
      console.error('Error sending friend request:', error.message, error.response?.data);
      alert('Failed to send friend request: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {loading ? (
        <p>Loading leaderboard...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : leaderboard.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <li key={entry.walletAddress} className="leaderboard-item">
              <div className="leaderboard-info">
                <span className="rank">#{index + 1}</span>
                <span className="username">{entry.username}</span>
                <span className="wallet">
                  {entry.walletAddress.substring(0, 6)}...{entry.walletAddress.substring(entry.walletAddress.length - 4)}
                </span>
                <span className="pnl">
                  PnL: {entry.profit.toFixed(2)} SOL
                </span>
              </div>
              <div className="leaderboard-actions">
                <button
                  className="friend-request-btn"
                  onClick={() => handleSendFriendRequest(entry.walletAddress)}
                >
                  Send Friend Request
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Leaderboard;