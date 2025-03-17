const express = require('express');
const router = express.Router();
const Connection = require('../models/connectionModel');
const User = require('../models/userModel');

// Send friend request
router.post('/request', async (req, res) => {
  try {
    const { senderWallet, receiverWallet } = req.body;
    
    // Validate both wallets exist
    const senderExists = await User.findOne({ walletAddress: senderWallet });
    const receiverExists = await User.findOne({ walletAddress: receiverWallet });
    
    if (!senderExists || !receiverExists) {
      return res.status(404).json({ message: 'One or both users not found' });
    }
    
    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { senderWallet, receiverWallet },
        { senderWallet: receiverWallet, receiverWallet: senderWallet }
      ]
    });
    
    if (existingConnection) {
      return res.status(400).json({ 
        message: 'Connection already exists', 
        status: existingConnection.status 
      });
    }
    
    // Create new connection
    const connection = await Connection.create({
      senderWallet,
      receiverWallet,
      status: 'pending'
    });
    
    res.status(201).json(connection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

module.exports = router;