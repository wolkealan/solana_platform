// server/routes/userRoutes.js
const express = require('express');
const User = require('../models/userModel'); // Corrected path and filename
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { walletAddress, username, character } = req.body;

  try {
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = new User({ walletAddress, username, character });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user character
router.put('/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.character = req.body.character || user.character;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'walletAddress username character');
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;