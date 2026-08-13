// routes/profile.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// GET /api/profile (protected)
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
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
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (parentName) user.parentName = parentName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (childName) user.childName = childName;
    if (childAge) user.childAge = childAge;
    if (childGender) user.childGender = childGender;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      parentName: updatedUser.parentName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      childName: updatedUser.childName,
      childAge: updatedUser.childAge,
      childGender: updatedUser.childGender,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;