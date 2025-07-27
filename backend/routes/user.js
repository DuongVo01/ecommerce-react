const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, gender, birthday } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, gender, birthday },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

module.exports = router;
