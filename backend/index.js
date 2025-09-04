
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
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

// Notification routes
app.use('/api/notifications', require('./routes/notifications'));

// User routes
app.use('/api/user', require('./routes/user'));
// Address routes
app.use('/api/addresses', require('./routes/addresses'));
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

  // On startup, detect and remove any TTL indexes on notifications
  (async () => {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('notifications');
      const indexes = await collection.indexes();
      const ttlIndexes = indexes.filter((idx) => typeof idx.expireAfterSeconds === 'number');
      for (const idx of ttlIndexes) {
        try {
          console.log(`[notifications] Dropping TTL index: ${idx.name} (expireAfterSeconds=${idx.expireAfterSeconds})`);
          await collection.dropIndex(idx.name);
        } catch (dropErr) {
          console.warn(`[notifications] Failed to drop index ${idx.name}:`, dropErr.message);
        }
      }
      if (ttlIndexes.length === 0) {
        console.log('[notifications] No TTL indexes found');
      }
    } catch (e) {
      console.warn('[notifications] Could not inspect/drop TTL indexes:', e.message);
    }
  })();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
