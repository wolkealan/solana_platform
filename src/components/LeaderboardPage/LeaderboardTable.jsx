// src/components/LeaderboardPage/LeaderboardTable.jsx
import React from 'react';

const LeaderboardTable = ({ data, walletAddress, onSendFriendRequest }) => {
  // Format wallet address for display
  const formatWallet = (wallet) => {
    if (!wallet) return '';
    return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
  };

  return (
    <div className="leaderboard-table-container">
      {data.length === 0 ? (
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
            {data.map((entry, index) => (
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
                      onClick={() => onSendFriendRequest(entry.walletAddress)}
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
  );
};

export default LeaderboardTable;