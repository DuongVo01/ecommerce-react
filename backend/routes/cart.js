const express = require('express');
const cartController = require('../controllers/cartController');
const router = express.Router();


// Get cart by userId
router.get('/:userId', cartController.getCartByUser);
// Add/update item in cart
router.post('/:userId', cartController.addOrUpdateCartItem);
// Remove item from cart
router.delete('/:userId/:productId', cartController.removeCartItem);

module.exports = router;
