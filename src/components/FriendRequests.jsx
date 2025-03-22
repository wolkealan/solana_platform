import React, { useEffect, useState } from 'react';
import { getPendingRequests, respondToFriendRequest } from '../services/connectionService';
import '../styles/FriendRequests.css';

const FriendRequests = ({ walletAddress, onClose, onFriendUpdate }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const requests = await getPendingRequests(walletAddress);
        setPendingRequests(requests);
        setLoading(false);
      } catch (error) {
        setError('Failed to load friend requests');
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [walletAddress]);

  const handleAccept = async (connectionId) => {
    try {
      await respondToFriendRequest(connectionId, 'accepted');
      // Remove the request from the list
      setPendingRequests(pendingRequests.filter(req => req._id !== connectionId));
      
      // Trigger friend update event
      if (onFriendUpdate && typeof onFriendUpdate === 'function') {
        console.log('Triggering friend update from FriendRequests (accept)');
        onFriendUpdate();
      }
    } catch (error) {
      setError('Failed to accept request');
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await respondToFriendRequest(connectionId, 'rejected');
      // Remove the request from the list
      setPendingRequests(pendingRequests.filter(req => req._id !== connectionId));
      
      // Trigger friend update event
      if (onFriendUpdate && typeof onFriendUpdate === 'function') {
        console.log('Triggering friend update from FriendRequests (reject)');
        onFriendUpdate();
      }
    } catch (error) {
      setError('Failed to reject request');
    }
  };

  return (
    <div className="friend-requests-container">
      <div className="friend-requests-header">
        <h2>Friend Requests</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      {loading ? (
        <p>Loading requests...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : pendingRequests.length === 0 ? (
        <p>No pending friend requests</p>
      ) : (
        <ul className="requests-list">
          {pendingRequests.map((request) => (
            <li key={request._id} className="request-item">
              <div className="request-info">
                <span className="username">{request.senderUsername}</span>
                <span className="wallet">{request.senderWallet.substring(0, 6)}...{request.senderWallet.substring(request.senderWallet.length - 4)}</span>
              </div>
              <div className="request-actions">
                <button 
                  className="accept-btn"
                  onClick={() => handleAccept(request._id)}
                >
                  Accept
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleReject(request._id)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendRequests;