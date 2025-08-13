const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// Tất cả routes đều yêu cầu xác thực
router.use(authenticateToken);

// Lấy thông báo của user
router.get('/user', notificationController.getUserNotifications);

// Lấy số thông báo chưa đọc
router.get('/unread-count', notificationController.getUnreadCount);

// Đánh dấu một thông báo đã đọc
router.patch('/:notificationId/read', notificationController.markAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Xóa một thông báo
router.delete('/:notificationId', notificationController.deleteNotification);

// Xóa tất cả thông báo đã đọc
router.delete('/delete-read', notificationController.deleteReadNotifications);

// Dọn dẹp thông báo cũ
router.delete('/cleanup', notificationController.cleanupOldNotifications);

// Tạo thông báo mới (chỉ admin)
router.post('/create', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
}, notificationController.createNotification);

// Tạo thông báo hàng loạt (chỉ admin)
router.post('/create-bulk', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
}, notificationController.createBulkNotifications);

// ===== ADMIN ROUTES =====
// Tất cả routes admin đều yêu cầu role admin
router.use('/admin', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
});

// Admin: Lấy tất cả thông báo của tất cả user
router.get('/admin/all', notificationController.getAllNotifications);

// Admin: Lấy thống kê thông báo
router.get('/admin/stats', notificationController.getNotificationStats);

// Admin: Đánh dấu thông báo đã đọc (bất kỳ user nào)
router.patch('/admin/:notificationId/read', notificationController.adminMarkAsRead);

// Admin: Xóa thông báo (bất kỳ user nào)
router.delete('/admin/:notificationId', notificationController.adminDeleteNotification);

// Admin: Dọn dẹp thông báo cũ cho tất cả user
router.delete('/admin/cleanup', notificationController.adminCleanupOldNotifications);

module.exports = router;
