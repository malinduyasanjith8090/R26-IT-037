// routes/settings.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// GET /api/settings (protected)
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('language theme notifications');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings (protected)
router.put('/', protect, async (req, res) => {
  const { language, theme, notifications } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (language) user.language = language;
    if (theme) user.theme = theme;
    if (notifications) {
      if (notifications.push !== undefined) user.notifications.push = notifications.push;
      if (notifications.email !== undefined) user.notifications.email = notifications.email;
      if (notifications.sound !== undefined) user.notifications.sound = notifications.sound;
      if (notifications.vibration !== undefined) user.notifications.vibration = notifications.vibration;
    }

    const updatedUser = await user.save();
    res.json({
      language: updatedUser.language,
      theme: updatedUser.theme,
      notifications: updatedUser.notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;