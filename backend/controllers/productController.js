// Sửa đánh giá sản phẩm
exports.updateProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const reviewId = req.params.reviewId;
    const review = product.reviews.id(reviewId) || product.reviews.find(r => r._id?.toString() === reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    // Chỉ cho phép sửa nếu user trùng tên
    if (review.user !== req.body.user) return res.status(403).json({ error: 'Bạn không có quyền sửa đánh giá này' });
    review.rating = req.body.rating;
    review.comment = req.body.comment;
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

      // Update with new image paths
      review.images = req.files.map(f => `/uploads/reviews/${f.filename}`);
      console.log('New image paths:', review.images);
    } else if (req.body.clearImages === 'true') {
      // If client requests to clear images
      if (review.images && review.images.length > 0) {
        const fs = require('fs');
        const path = require('path');
        review.images.forEach(image => {
          try {
            const imagePath = path.join(__dirname, '..', image);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
              console.log('Deleted cleared image:', imagePath);
            }
          } catch (err) {
            console.error('Error deleting cleared image:', err);
          }
        });
      }
      review.images = [];
    }

    await product.save();
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa đánh giá sản phẩm
exports.deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const reviewId = req.params.reviewId;
    const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);
    
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = product.reviews[reviewIndex];

    // Kiểm tra quyền xóa
    if (!req.body.admin && review.user !== req.body.user) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa đánh giá này' });
    }

    // Xóa các file ảnh nếu có
    if (review.images && review.images.length > 0) {
      const fs = require('fs');
      const path = require('path');
      review.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // Xóa review khỏi mảng
    product.reviews.splice(reviewIndex, 1);
    await product.save();

    // Xóa report liên quan nếu có (file uploads/reports/reports.json)
    const fs = require('fs');
    const path = require('path');
    const reportsPath = path.join(__dirname, '../uploads/reports/reports.json');
    try {
      if (fs.existsSync(reportsPath)) {
        const reportsData = fs.readFileSync(reportsPath, 'utf8');
        let reports = [];
        try { reports = JSON.parse(reportsData); } catch {}
        const newReports = Array.isArray(reports) ? reports.filter(r => r.commentId !== reviewId) : [];
        fs.writeFileSync(reportsPath, JSON.stringify(newReports, null, 2), 'utf8');
      }
    } catch (e) { /* ignore */ }

    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product.reviews.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add review to product
exports.addProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(review => review.user === req.body.user);
    if (existingReview) {
      return res.status(400).json({ error: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    // Lấy avatar của user từ database
    const User = require('../models/User');
    const userDoc = await User.findOne({ username: req.body.user });
    
    const review = {
      user: req.body.user,
      rating: Number(req.body.rating),
      comment: req.body.comment,
      date: new Date().toISOString(),
      avatar: userDoc?.avatar || null,  // Thêm avatar từ user document
      images: [],
      likes: []
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      console.log('Received files:', req.files);
      review.images = req.files.map(file => `/uploads/reviews/${file.filename}`);
      console.log('Saved image paths:', review.images);
    } else {
      console.log('No files received');
    }

    product.reviews.unshift(review);
    await product.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    // Ép kiểu số cho price và stock nếu có
    if (productData.price) productData.price = Number(productData.price);
    if (productData.stock) productData.stock = Number(productData.stock);
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy danh sách đánh giá sản phẩm
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product.reviews || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm đánh giá sản phẩm
exports.addProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const review = req.body || {};
    if (!review || !review.rating || !review.comment || !review.user) {
      return res.status(400).json({ error: 'Missing rating, comment, or user' });
    }
    // Attach uploaded images if any
    if (Array.isArray(req.files) && req.files.length > 0) {
      review.images = req.files.map(f => `/uploads/reviews/${f.filename}`);
    } else if (Array.isArray(review.images)) {
      // keep client-provided images if already URLs
      review.images = review.images;
    }
    // Lấy avatar từ User
    const User = require('../models/User');
    const userDoc = await User.findOne({ username: review.user });
    review.avatar = userDoc && userDoc.avatar ? userDoc.avatar : '';
    product.reviews.push(review);
    await product.save();
    const savedReview = product.reviews[product.reviews.length - 1];
    res.status(201).json(savedReview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Like/unlike một review sản phẩm
exports.likeProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const reviewId = req.params.reviewId;
    const { user } = req.body; // user là username hoặc userId
    if (!user) return res.status(400).json({ error: 'Missing user' });
    const review = product.reviews.id(reviewId) || product.reviews.find(r => r._id?.toString() === reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (!review.likes) review.likes = [];
    const idx = review.likes.indexOf(user);
    let liked;
    if (idx === -1) {
      // Chưa like, thêm vào
      review.likes.push(user);
      liked = true;
    } else {
      // Đã like, unlike
      review.likes.splice(idx, 1);
      liked = false;
    }
    await product.save();
    res.json({ likes: review.likes.length, liked });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
