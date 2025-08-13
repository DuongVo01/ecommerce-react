const Notification = require('../models/Notification');

// Lấy tất cả thông báo của user
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user.username || req.user.email;

    if (!userId) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    let query = { user: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Thêm timeAgo cho mỗi notification
    const notificationsWithTimeAgo = notifications.map(notification => {
      const now = new Date();
      const diffInSeconds = Math.floor((now - new Date(notification.createdAt)) / 1000);
      
      let timeAgo;
      if (diffInSeconds < 60) {
        timeAgo = `${diffInSeconds} giây trước`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        timeAgo = `${minutes} phút trước`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        timeAgo = `${hours} giờ trước`;
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        timeAgo = `${days} ngày trước`;
      } else {
        timeAgo = new Date(notification.createdAt).toLocaleDateString('vi-VN');
      }

      return {
        ...notification,
        timeAgo
      };
    });

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.json({
      success: true,
      data: notificationsWithTimeAgo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông báo' });
  }
};

// Admin: Lấy tất cả thông báo của tất cả user
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, user, type, read, search } = req.query;
    
    let query = {};
    
    // Lọc theo user
    if (user) {
      query.user = user;
    }
    
    // Lọc theo loại
    if (type) {
      query.type = type;
    }
    
    // Lọc theo trạng thái đọc
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    // Tìm kiếm theo tiêu đề hoặc nội dung
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Lấy danh sách user liên quan
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Lấy thông tin user cho từng notification
    const userUsernames = [...new Set(notifications.map(n => n.user))];
    const User = require('../models/User');
    const users = await User.find({ username: { $in: userUsernames } }).lean();
    const userMap = {};
    users.forEach(u => { userMap[u.username] = { name: u.name, avatar: u.avatar, email: u.email }; });

    // Gắn thông tin user vào notification
    const notificationsWithUser = notifications.map(n => ({
      ...n,
      userInfo: userMap[n.user] || { name: n.user, avatar: '', email: '' }
    }));

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notificationsWithUser,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy tất cả thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông báo' });
  }
};

// Admin: Lấy thống kê thông báo
exports.getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: ['$read', 0, 1] } },
          read: { $sum: { $cond: ['$read', 1, 0] } }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const userStats = await Notification.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          unreadCount: { $sum: { $cond: ['$read', 0, 1] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        unread: stats[0]?.unread || 0,
        read: stats[0]?.read || 0,
        byType: typeStats,
        byUser: userStats
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
  }
};

// Đánh dấu một thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.username || req.user.email;

    if (!userId) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    res.json({
      success: true,
      message: 'Đã đánh dấu thông báo đã đọc',
      data: notification
    });
  } catch (error) {
    console.error('Lỗi khi đánh dấu thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi đánh dấu thông báo' });
  }
};

// Admin: Đánh dấu thông báo đã đọc (bất kỳ user nào)
exports.adminMarkAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    res.json({
      success: true,
      message: 'Admin đã đánh dấu thông báo đã đọc',
      data: notification
    });
  } catch (error) {
    console.error('Lỗi khi admin đánh dấu thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi đánh dấu thông báo' });
  }
};

// Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.username || req.user.email;

    if (!userId) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: `Đã đánh dấu ${result.modifiedCount} thông báo đã đọc`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Lỗi khi đánh dấu tất cả thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi đánh dấu thông báo' });
  }
};

// Xóa một thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.username || req.user.email;

    if (!userId) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    res.json({
      success: true,
      message: 'Đã xóa thông báo',
      data: notification
    });
  } catch (error) {
    console.error('Lỗi khi xóa thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa thông báo' });
  }
};

// Admin: Xóa thông báo (bất kỳ user nào)
exports.adminDeleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    res.json({
      success: true,
      message: 'Admin đã xóa thông báo',
      data: notification
    });
  } catch (error) {
    console.error('Lỗi khi admin xóa thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa thông báo' });
  }
};

// Xóa tất cả thông báo đã đọc
exports.deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user.username || req.user.email;

    if (!userId) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const result = await Notification.deleteMany({
      user: userId,
      read: true
    });

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} thông báo đã đọc`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Lỗi khi xóa thông báo đã đọc:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa thông báo' });
  }
};

// Lấy số thông báo chưa đọc
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.username || req.user.email;

    if (!userId) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const unreadCount = await Notification.countDocuments({
      user: userId,
      read: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Lỗi khi đếm thông báo chưa đọc:', error);
    res.status(500).json({ message: 'Lỗi server khi đếm thông báo' });
  }
};

// Tạo thông báo mới (cho admin hoặc hệ thống)
exports.createNotification = async (req, res) => {
  try {
    const { user, title, message, type = 'other', data = {} } = req.body;

    if (!user || !title || !message) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      data
    });

    res.status(201).json({
      success: true,
      message: 'Đã tạo thông báo thành công',
      data: notification
    });
  } catch (error) {
    console.error('Lỗi khi tạo thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo thông báo' });
  }
};

// Tạo thông báo hàng loạt (cho admin)
exports.createBulkNotifications = async (req, res) => {
  try {
    const { users, title, message, type = 'other', data = {} } = req.body;

    if (!users || !Array.isArray(users) || !title || !message) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const notifications = users.map(user => ({
      user,
      title,
      message,
      type,
      data
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Đã tạo ${createdNotifications.length} thông báo thành công`,
      data: createdNotifications
    });
  } catch (error) {
    console.error('Lỗi khi tạo thông báo hàng loạt:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo thông báo hàng loạt' });
  }
};

// Dọn dẹp thông báo cũ
exports.cleanupOldNotifications = async (req, res) => {
  try {
    const userId = req.user.username || req.user.email;

    if (!userId) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const result = await Notification.cleanupOldNotifications(userId);

    res.json({
      success: true,
      message: 'Đã dọn dẹp thông báo cũ',
      data: result
    });
  } catch (error) {
    console.error('Lỗi khi dọn dẹp thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi dọn dẹp thông báo' });
  }
};

// Admin: Dọn dẹp thông báo cũ cho tất cả user
exports.adminCleanupOldNotifications = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true
    });

    res.json({
      success: true,
      message: `Đã dọn dẹp ${result.deletedCount} thông báo cũ (trước ${days} ngày)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Lỗi khi admin dọn dẹp thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi dọn dẹp thông báo' });
  }
};
