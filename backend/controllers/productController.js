const Product = require('../models/Product');
const User = require('../models/User');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error getting products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get product by id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error getting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const product = new Product({
      ...req.body,
      image: imageUrl
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product.reviews);
  } catch (err) {
    console.error('Error getting reviews:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add product review
exports.addProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Get user info to get the avatar
    const user = await User.findOne({ username: req.body.user });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newReview = {
      user: req.body.user,
      avatar: user.avatar, // Include user's avatar
      rating: req.body.rating,
      comment: req.body.comment,
      date: new Date().toISOString(),
      likes: [], // Initialize empty likes array
      images: req.files ? req.files.map(file => '/uploads/reviews/' + file.filename) : []
    };

    product.reviews.push(newReview);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update product review
exports.updateProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const reviewId = req.params.reviewId;
    const review = product.reviews.id(reviewId) || product.reviews.find(r => r._id?.toString() === reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    // Chỉ cho phép sửa nếu user trùng tên
    if (review.user !== req.body.user) return res.status(403).json({ error: 'Bạn không có quyền sửa đánh giá này' });

    // Get latest user info to update avatar
    const user = await User.findOne({ username: req.body.user });
    if (!user) return res.status(404).json({ error: 'User not found' });

    review.rating = req.body.rating;
    review.comment = req.body.comment;
    review.avatar = user.avatar; // Update avatar in case it changed
    review.date = new Date().toISOString();

    // Handle image updates
    if (Array.isArray(req.files) && req.files.length > 0) {
      console.log('Updating review with new images:', req.files);
      
      // Delete old images if they exist
      if (review.images && review.images.length > 0) {
        const fs = require('fs');
        const path = require('path');
        review.images.forEach(oldImage => {
          try {
            const oldPath = path.join(__dirname, '..', oldImage);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
              console.log('Deleted old image:', oldPath);
            }
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        });
      }
      
      // Add new images
      review.images = req.files.map(file => '/uploads/reviews/' + file.filename);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle like on a review
exports.toggleReviewLike = async (req, res) => {
  try {
    const productId = req.params.id;
    const { reviewId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user is trying to like their own review
    if (review.user === username) {
      return res.status(400).json({ error: 'Bạn không thể thích đánh giá của chính mình' });
    }

    // Initialize likes array if it doesn't exist
    if (!review.likes) {
      review.likes = [];
    }

    // Toggle like
    const userLikeIndex = review.likes.indexOf(username);
    if (userLikeIndex === -1) {
      // Add like
      review.likes.push(username);
    } else {
      // Remove like
      review.likes.splice(userLikeIndex, 1);
    }

    await product.save();
    res.json({
      message: userLikeIndex === -1 ? 'Review liked' : 'Review unliked',
      likes: review.likes
    });
  } catch (err) {
    console.error('Error toggling review like:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get review likes
exports.getReviewLikes = async (req, res) => {
  try {
    const productId = req.params.id;
    const { reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      likes: review.likes || []
    });
  } catch (err) {
    console.error('Error getting review likes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete product review
exports.deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const reviewId = req.params.reviewId;
    const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);
    
    if (reviewIndex === -1) return res.status(404).json({ error: 'Review not found' });
    
    // Delete review images if they exist
    if (product.reviews[reviewIndex].images && product.reviews[reviewIndex].images.length > 0) {
      const fs = require('fs');
      const path = require('path');
      product.reviews[reviewIndex].images.forEach(image => {
        try {
          const imagePath = path.join(__dirname, '..', image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (err) {
          console.error('Error deleting review image:', err);
        }
      });
    }

    product.reviews.splice(reviewIndex, 1);
    await product.save();
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
