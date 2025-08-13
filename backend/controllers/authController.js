const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const jwt = require('jsonwebtoken');
exports.login = async (req, res) => {
  try {
    const { login, email, username, password } = req.body;
    // login: có thể là email hoặc username
    let user;
    if (login) {
      user = await User.findOne({ $or: [ { email: login }, { username: login } ] });
    } else if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    }
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Tạo token JWT
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Trả về đầy đủ thông tin user và token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || '',
        email: user.email,
        phone: user.phone || '',
        gender: user.gender || '',
        birthday: user.birthday || '',
        addresses: user.addresses || [],
        avatar: user.avatar || '',
        role: user.role || 'user',
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
