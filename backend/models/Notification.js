const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'product', 'promotion', 'system', 'other'],
    default: 'other'
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
// Đã tắt tự động xóa thông báo ngay khi tạo. Nếu muốn tự động xóa sau X ngày, hãy thêm lại dòng này với expireAfterSeconds phù hợp.

// Virtual field để tính thời gian tương đối
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} giây trước`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else {
    return this.createdAt.toLocaleDateString('vi-VN');
  }
});

// Method để đánh dấu đã đọc
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

// Method để đánh dấu tất cả thông báo của user đã đọc
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { user: userId, read: false },
    { read: true }
  );
};

// Method để tạo thông báo
notificationSchema.statics.createNotification = function(data) {
  return this.create(data);
};

// Method để lấy thông báo của user với phân trang
notificationSchema.statics.getUserNotifications = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Method để đếm số thông báo chưa đọc
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

// Đã tắt chức năng tự động dọn dẹp thông báo cũ. Nếu muốn bật lại, hãy thêm lại hàm này.

module.exports = mongoose.model('Notification', notificationSchema);
