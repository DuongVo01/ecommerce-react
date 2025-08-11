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
    review.date = new Date().toLocaleString('vi-VN');
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
    const review = product.reviews.id(reviewId) || product.reviews.find(r => r._id?.toString() === reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    // Nếu là admin thì cho phép xóa mọi đánh giá
    if (!req.body.admin && review.user !== req.body.user) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa đánh giá này' });
    }
    product.reviews = product.reviews.filter(r => (r._id?.toString() || r.id) !== reviewId);
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
    const review = req.body;
    if (!review || !review.rating || !review.comment || !review.user) {
      return res.status(400).json({ error: 'Missing rating, comment, or user' });
    }
    // Lấy avatar từ User
    const User = require('../models/User');
    const userDoc = await User.findOne({ username: review.user });
    review.avatar = userDoc && userDoc.avatar ? userDoc.avatar : '';
    product.reviews.push(review);
    await product.save();
    res.status(201).json(review);
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
