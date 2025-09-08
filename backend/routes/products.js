const express = require('express');
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');
const reviewUpload = require('../middleware/reviewUpload');
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

// Reviews routes
router.get('/:id/reviews', productController.getProductReviews);
router.post('/:id/reviews', reviewUpload.array('images', 5), productController.addProductReview);
router.put('/:id/reviews/:reviewId', reviewUpload.array('images', 5), productController.updateProductReview);
router.delete('/:id/reviews/:reviewId', productController.deleteProductReview);

// Review likes routes
router.post('/:id/reviews/:reviewId/like', productController.toggleReviewLike);
router.get('/:id/reviews/:reviewId/likes', productController.getReviewLikes);

module.exports = router;
