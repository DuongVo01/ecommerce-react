const express = require('express');
const cartController = require('../controllers/cartController');
const router = express.Router();

// Get cart by userId
router.get('/:userId', cartController.getCartByUser);
// Get checkout items
router.get('/:userId/checkout', cartController.getCheckoutItems);
// Add/update item in cart
router.post('/:userId', cartController.addOrUpdateCartItem);
// Clear cart (must come before remove item route)
router.delete('/:userId/clear', cartController.clearCart);
// Remove item from cart
router.delete('/:userId/:productId', cartController.removeCartItem);

module.exports = router;
