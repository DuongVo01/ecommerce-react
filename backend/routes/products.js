const express = require('express');
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Dedicated storage for review images in /uploads/reviews
const reviewsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../uploads/reviews');
    try {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    } catch {}
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const reviewFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Chỉ cho phép ảnh jpg, jpeg, png, webp'), false);
};
const reviewUpload = multer({
  storage: reviewsStorage,
  fileFilter: reviewFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});
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
// Add review with up to 5 images
router.post('/:id/reviews', reviewUpload.array('images', 5), productController.addProductReview);
router.put('/:id/reviews/:reviewId', reviewUpload.array('images', 5), productController.updateProductReview);

// Like/unlike review
router.post('/:id/reviews/:reviewId/like', productController.likeProductReview);
router.delete('/:id/reviews/:reviewId', productController.deleteProductReview);

module.exports = router;
