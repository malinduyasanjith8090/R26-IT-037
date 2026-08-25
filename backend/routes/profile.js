// routes/profile.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// GET /api/profile (protected)
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile (protected)
router.put('/', protect, async (req, res) => {
  const { parentName, email, phone, childName, childAge, childGender } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (parentName) user.parentName = parentName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (childName) user.childName = childName;
    if (childAge) user.childAge = childAge;
    if (childGender) user.childGender = childGender;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ PUT /api/profile/stats (with stats initialization)
router.put('/stats', protect, async (req, res) => {
  const { learning, games, routine, behavioral } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure stats exists for old users
    if (!user.stats) {
      user.stats = { learning: 0, games: 0, routine: 0, behavioral: 0 };
    }

    if (learning !== undefined) user.stats.learning = learning;
    if (games !== undefined) user.stats.games = games;
    if (routine !== undefined) user.stats.routine = routine;
    if (behavioral !== undefined) user.stats.behavioral = behavioral;

    await user.save();
    res.json(user.stats);
  } catch (error) {
    console.error('Stats update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;