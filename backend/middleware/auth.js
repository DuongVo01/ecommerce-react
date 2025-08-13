const jwt = require('jsonwebtoken');

// Middleware xác thực JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware kiểm tra quyền user hoặc admin
const requireUserOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Cho phép user truy cập thông báo của chính mình hoặc admin truy cập tất cả
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Kiểm tra nếu user đang truy cập thông báo của chính mình
  const userId = req.params.userId || req.query.userId;
  if (userId && userId !== req.user.username && userId !== req.user.email) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireUserOrAdmin
};
