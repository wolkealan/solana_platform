// server/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const Connection = require('../models/connectionModel');
const User = require('../models/userModel');

// Send a message
router.post('/', async (req, res) => {
  try {
    const { senderWallet, receiverWallet, content } = req.body;

    const connection = await Connection.findOne({
      $or: [
        { senderWallet, receiverWallet, status: 'accepted' },
        { senderWallet: receiverWallet, receiverWallet: senderWallet, status: 'accepted' }
      ]
    });

    if (!connection) {
      return res.status(403).json({ message: 'You can only message friends' });
    }

    const message = await Message.create({
      senderWallet,
      receiverWallet,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation between two users
router.get('/conversation/:friendWallet', async (req, res) => {
  try {
    const { friendWallet } = req.params;
    const { walletAddress } = req.query;

    const messages = await Message.find({
      $or: [
        { senderWallet: walletAddress, receiverWallet: friendWallet },
        { senderWallet: friendWallet, receiverWallet: walletAddress }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(50);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:friendWallet', async (req, res) => {
  try {
    const { friendWallet } = req.params;
    const { walletAddress } = req.body;

    await Message.updateMany(
      { senderWallet: friendWallet, receiverWallet: walletAddress, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for a user, grouped by friend
router.get('/all', async (req, res) => {
  try {
    const { walletAddress } = req.query;

    // Find all accepted connections for the user
    const connections = await Connection.find({
      $or: [
        { senderWallet: walletAddress, status: 'accepted' },
        { receiverWallet: walletAddress, status: 'accepted' }
      ]
    });

    // Extract friend wallet addresses
    const friendWallets = connections.map(conn => 
      conn.senderWallet === walletAddress ? conn.receiverWallet : conn.senderWallet
    );

    // Fetch user details for friends
    const friends = await User.find({ walletAddress: { $in: friendWallets } });

    // Fetch latest messages for each friend
    const conversations = await Promise.all(
      friendWallets.map(async (friendWallet) => {
        const messages = await Message.find({
          $or: [
            { senderWallet: walletAddress, receiverWallet: friendWallet },
            { senderWallet: friendWallet, receiverWallet: walletAddress }
          ]
        })
        .sort({ createdAt: -1 }) // Sort by most recent
        .limit(1); // Get only the latest message

        const friend = friends.find(f => f.walletAddress === friendWallet);
        return {
          friend: {
            walletAddress: friendWallet,
            username: friend ? friend.username : 'Unknown',
            character: friend ? friend.character : null
          },
          latestMessage: messages[0] || null,
          unreadCount: await Message.countDocuments({
            senderWallet: friendWallet,
            receiverWallet: walletAddress,
            read: false
          })
        };
      })
    );

    // Sort conversations by latest message timestamp (descending)
    conversations.sort((a, b) => {
      const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt).getTime() : 0;
      const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;