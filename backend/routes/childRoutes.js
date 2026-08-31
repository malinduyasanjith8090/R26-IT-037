const express = require('express');
const ChildProfile = require('../models/ChildProfile');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const child = await ChildProfile.create({ ...req.body, parentId: req.user._id });
    res.status(201).json(child);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/parent/:parentId', requireAuth, async (req, res) => {
  try {
    if (String(req.user._id) !== String(req.params.parentId)) {
      return res.status(403).json({ error: 'Not allowed to access these children' });
    }
    const children = await ChildProfile.find({ parentId: req.user._id }).sort({ createdAt: 1 });
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
