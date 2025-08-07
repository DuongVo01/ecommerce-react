const express = require('express');
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');
const router = express.Router();


// Get all products
router.get('/', productController.getAllProducts);
// Get product by id
router.get('/:id', productController.getProductById);
// Upload product image
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Create new product
router.post('/', upload.single('image'), productController.createProduct);
// Update product
router.put('/:id', upload.single('image'), productController.updateProduct);
// Delete product
router.delete('/:id', productController.deleteProduct);


// Đánh giá sản phẩm
router.get('/:id/reviews', productController.getProductReviews);
router.post('/:id/reviews', productController.addProductReview);
router.put('/:id/reviews/:reviewId', productController.updateProductReview);

// Like/unlike review
router.post('/:id/reviews/:reviewId/like', productController.likeProductReview);
router.delete('/:id/reviews/:reviewId', productController.deleteProductReview);

module.exports = router;
