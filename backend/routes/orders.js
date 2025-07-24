const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get all orders (admin)
router.get('/admin', async (req, res) => {
  try {
    const orders = await require('../models/Order').find().populate('userId').populate('items.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Get all orders for a user
router.get('/:userId', orderController.getOrdersByUser);
// Create new order
router.post('/:userId', orderController.createOrder);
// Update order status
router.put('/:orderId', orderController.updateOrderStatus);

module.exports = router;
