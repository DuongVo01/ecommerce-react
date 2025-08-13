const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Trả về cả name và avatar để hiển thị đẹp trên frontend
  const users = await User.find({}, 'username name email role createdAt avatar phone gender birthday');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);

module.exports = router;
