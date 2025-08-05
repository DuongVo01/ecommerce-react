
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Serve static files from uploads
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));


// Product routes
app.use('/api/products', require('./routes/products'));
// Category routes
app.use('/api/categories', require('./routes/categories'));
// Orders routes
app.use('/api/orders', require('./routes/orders'));
// Cart routes
app.use('/api/cart', require('./routes/cart'));


// Banner routes
app.use('/api/banners', require('./routes/banners'));

// Report routes (báo cáo comment)
app.use('/api/reports', require('./routes/reports'));

// User routes
app.use('/api/user', require('./routes/user'));
// Auth routes
app.use('/api/auth', require('./routes/auth'));


// Simple test route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
