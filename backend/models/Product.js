const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  shortDesc: { type: String }, // Mô tả ngắn
  price: { type: Number, required: true },
  image: String,
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  reviews: [
    {
      user: String,
      avatar: String, // avatar của user tại thời điểm đánh giá
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: String,
      likes: [String] // danh sách username/userId đã like
    }
  ]
});

module.exports = mongoose.model('Product', productSchema);
