const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../middleware/upload');

// Update user profile
router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Cập nhật avatar cho tất cả review của user này trong các sản phẩm
    if (updateData.avatar) {
      const Product = require('../models/Product');
      await Product.updateMany(
        { 'reviews.user': user.username },
        { $set: { 'reviews.$[elem].avatar': updateData.avatar } },
        { arrayFilters: [{ 'elem.user': user.username }] }
      );
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

module.exports = router;
