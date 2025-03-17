const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { walletAddress, username, character } = req.body;
    
    // Check if wallet already exists
    const walletExists = await User.findOne({ walletAddress });
    if (walletExists) {
      return res.status(400).json({ message: 'Wallet already registered' });
    }
    
    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Create user
    const user = await User.create({
      walletAddress,
      username,
      character
    });
    
    if (user) {
      res.status(201).json({
        walletAddress: user.walletAddress,
        username: user.username,
        character: user.character
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    
    if (user) {
      // Update last login time
      user.lastLogin = Date.now();
      await user.save();
      
      res.json({
        walletAddress: user.walletAddress,
        username: user.username,
        character: user.character
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user character
router.put('/:walletAddress', async (req, res) => {
  try {
    const { character } = req.body;
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    
    if (user) {
      user.character = character;
      await user.save();
      
      res.json({
        walletAddress: user.walletAddress,
        username: user.username,
        character: user.character
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;