// server/routes/connectionRoutes.js
const express = require('express');
const User = require('../models/userModel');
const Connection = require('../models/connectionModel');
const router = express.Router();

// Export a function that accepts io instance
module.exports = (io) => {
  // Send a friend request
  router.post('/request', async (req, res) => {
    const { senderWallet, receiverWallet } = req.body;

    try {
      // Validate input
      if (!senderWallet || !receiverWallet) {
        return res.status(400).json({ message: 'senderWallet and receiverWallet are required' });
      }

      // Check if users exist
      const sender = await User.findOne({ walletAddress: senderWallet });
      const receiver = await User.findOne({ walletAddress: receiverWallet });
      if (!sender || !receiver) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if already friends
      const existingConnection = await Connection.findOne({
        $or: [
          { senderWallet: senderWallet, receiverWallet: receiverWallet },
          { senderWallet: receiverWallet, receiverWallet: senderWallet },
        ],
        status: 'accepted',
      });
      if (existingConnection) {
        return res.status(400).json({ message: 'Already friends' });
      }

      // Check if request already exists
      const existingRequest = await Connection.findOne({
        $or: [
          { senderWallet: senderWallet, receiverWallet: receiverWallet },
          { senderWallet: receiverWallet, receiverWallet: senderWallet },
        ],
        status: 'pending',
      });
      if (existingRequest) {
        return res.status(400).json({ message: 'Friend request already sent' });
      }

      // Create friend request
      const connection = new Connection({
        senderWallet: senderWallet,
        receiverWallet: receiverWallet,
        status: 'pending',
      });
      await connection.save();
      
      // Emit socket event to the receiver
      io.to(receiverWallet).emit('newFriendRequest', {
        requestId: connection._id,
        senderWallet,
        senderUsername: sender.username,
        senderCharacter: sender.character
      });
      
      res.status(201).json({ message: 'Friend request sent' });
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Accept or reject friend request
  router.put('/request/:connectionId', async (req, res) => {
    try {
      const { status } = req.body; // 'accepted' or 'rejected'
      
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const connection = await Connection.findById(req.params.connectionId);
      
      if (!connection) {
        return res.status(404).json({ message: 'Connection request not found' });
      }
      
      connection.status = status;
      await connection.save();
      
      // If request was accepted, notify both users via socket
      if (status === 'accepted') {
        // Get user data for both sender and receiver
        const sender = await User.findOne({ walletAddress: connection.senderWallet });
        const receiver = await User.findOne({ walletAddress: connection.receiverWallet });

        // Data to send to sender (about receiver)
        const senderData = {
          walletAddress: connection.receiverWallet,
          username: receiver.username,
          character: receiver.character
        };

        // Data to send to receiver (about sender)
        const receiverData = {
          walletAddress: connection.senderWallet,
          username: sender.username,
          character: sender.character
        };

        // Emit to sender about the receiver
        io.to(connection.senderWallet).emit('friendRequestAccepted', senderData);
        
        // Emit to receiver about the sender
        io.to(connection.receiverWallet).emit('friendRequestAccepted', receiverData);
        
        console.log(`Emitted friendRequestAccepted to ${connection.senderWallet} and ${connection.receiverWallet}`);
      }
      
      res.json(connection);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all pending friend requests for a user
  router.get('/pending/:walletAddress', async (req, res) => {
    try {
      const walletAddress = req.params.walletAddress;
      
      const pendingRequests = await Connection.find({
        receiverWallet: walletAddress,
        status: 'pending'
      });
      
      // Get sender user details
      const requestsWithUserDetails = await Promise.all(
        pendingRequests.map(async (request) => {
          const sender = await User.findOne({ walletAddress: request.senderWallet });
          return {
            _id: request._id,
            senderWallet: request.senderWallet,
            senderUsername: sender ? sender.username : 'Unknown',
            senderCharacter: sender ? sender.character : null,
            createdAt: request.createdAt
          };
        })
      );
      
      res.json(requestsWithUserDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all friends for a user
  router.get('/friends/:walletAddress', async (req, res) => {
    try {
      const walletAddress = req.params.walletAddress;
      
      // Find all accepted connections where user is either sender or receiver
      const connections = await Connection.find({
        $or: [
          { senderWallet: walletAddress, status: 'accepted' },
          { receiverWallet: walletAddress, status: 'accepted' }
        ]
      });
      
      // Extract friend wallet addresses
      const friendWallets = connections.map(conn => {
        return conn.senderWallet === walletAddress ? conn.receiverWallet : conn.senderWallet;
      });
      
      // Get friend details
      const friends = await User.find({ walletAddress: { $in: friendWallets } });
      
      res.json(friends.map(friend => ({
        walletAddress: friend.walletAddress,
        username: friend.username,
        character: friend.character
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};