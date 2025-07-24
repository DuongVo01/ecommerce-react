require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const role = 'admin';

  let user = await User.findOne({ $or: [ { email }, { username } ] });
  if (user) {
    console.log('Admin user already exists:', user.email);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ username, email, password: hashedPassword, role });
    console.log('Admin user created:', user.email);
  }
  mongoose.disconnect();
}

createAdmin();
