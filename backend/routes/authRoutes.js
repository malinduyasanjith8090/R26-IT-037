const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChildProfile = require('../models/ChildProfile');

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '30d' });
}

function publicUser(user) {
  const data = user.toObject ? user.toObject() : { ...user };
  delete data.password;
  return { ...data, fullName: data.parentName };
}

async function provisionChild(user) {
  let child = await ChildProfile.findOne({ parentId: user._id });
  if (!child && user.childName && user.childAge) {
    child = await ChildProfile.create({
      parentId: user._id,
      alias: user.childName,
      age: user.childAge,
      consentRecorded: true,
    });
  }
  return child;
}

router.post('/signup', async (req, res) => {
  try {
    const { parentName, email, password, confirmPassword, childName, childAge } = req.body;
    if (!parentName || !email || !password || !childName || !childAge) {
      return res.status(400).json({ message: 'Parent and child information is required' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ ...req.body, email: email.toLowerCase() });
    const child = await provisionChild(user);
    res.status(201).json({ token: createToken(user._id), user: publicUser(user), child });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || !(await user.matchPassword(req.body.password || ''))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const child = await provisionChild(user);
    res.json({ token: createToken(user._id), user: publicUser(user), child });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/verify', require('../middleware/auth').requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
