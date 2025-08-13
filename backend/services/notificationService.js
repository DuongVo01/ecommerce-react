const Notification = require('../models/Notification');

class NotificationService {
  // Tạo thông báo đơn hàng
  static async createOrderNotification(userId, orderId, status, message) {
    try {
      const notification = await Notification.create({
        user: userId,
        title: `Cập nhật đơn hàng #${orderId}`,
        message: message,
        type: 'order',
        data: {
          orderId,
          status
        }
      });
      return notification;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo đơn hàng:', error);
      throw error;
    }
  }

  // Tạo thông báo sản phẩm
  static async createProductNotification(userId, productId, productName, action) {
    try {
      let title, message;
      
      switch (action) {
        case 'restock':
          title = 'Sản phẩm đã có hàng trở lại';
          message = `Sản phẩm "${productName}" đã có hàng trở lại. Hãy nhanh tay đặt hàng!`;
          break;
        case 'price_drop':
          title = 'Giá sản phẩm giảm';
          message = `Sản phẩm "${productName}" đã giảm giá. Kiểm tra ngay!`;
          break;
        case 'new_product':
          title = 'Sản phẩm mới';
          message = `Sản phẩm mới "${productName}" đã có sẵn. Khám phá ngay!`;
          break;
        default:
          title = 'Thông báo sản phẩm';
          message = `Có cập nhật về sản phẩm "${productName}"`;
      }

      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type: 'product',
        data: {
          productId,
          productName,
          action
        }
      });
      return notification;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo sản phẩm:', error);
      throw error;
    }
  }

  // Tạo thông báo khuyến mãi
  static async createPromotionNotification(userId, promotionTitle, message, discount) {
    try {
      const notification = await Notification.create({
        user: userId,
        title: promotionTitle,
        message: message,
        type: 'promotion',
        data: {
          discount,
          promotionTitle
        }
      });
      return notification;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo khuyến mãi:', error);
      throw error;
    }
  }

  // Tạo thông báo hệ thống
  static async createSystemNotification(userId, title, message, data = {}) {
    try {
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type: 'system',
        data
      });
      return notification;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo hệ thống:', error);
      throw error;
    }
  }

  // Tạo thông báo cho nhiều user
  static async createBulkNotification(userIds, title, message, type = 'other', data = {}) {
    try {
      const notifications = userIds.map(userId => ({
        user: userId,
        title,
        message,
        type,
        data
      }));

      const createdNotifications = await Notification.insertMany(notifications);
      return createdNotifications;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo hàng loạt:', error);
      throw error;
    }
  }

  // Tạo thông báo cho tất cả user (admin function)
  static async createNotificationForAllUsers(title, message, type = 'other', data = {}) {
    try {
      // Lấy danh sách tất cả user từ database
      // Bạn cần import User model và thay thế logic này
      const User = require('../models/User');
      const users = await User.find({}, 'username email');
      
      const userIds = users.map(user => user.username || user.email);
      
      if (userIds.length === 0) {
        throw new Error('Không có user nào trong hệ thống');
      }

      return await this.createBulkNotification(userIds, title, message, type, data);
    } catch (error) {
      console.error('Lỗi khi tạo thông báo cho tất cả user:', error);
      throw error;
    }
  }

  // Tạo thông báo chào mừng cho user mới
  static async createWelcomeNotification(userId, username) {
    try {
      const notification = await Notification.create({
        user: userId,
        title: 'Chào mừng bạn đến với ShopStore! 🎉',
        message: `Xin chào ${username}! Cảm ơn bạn đã tham gia cộng đồng ShopStore. Chúc bạn có những trải nghiệm mua sắm tuyệt vời!`,
        type: 'system',
        data: {
          action: 'welcome',
          username
        }
      });
      return notification;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo chào mừng:', error);
      throw error;
    }
  }

  // Tạo thông báo nhắc nhở đơn hàng
  static async createOrderReminderNotification(userId, orderId, daysLeft) {
    try {
      const notification = await Notification.create({
        user: userId,
        title: 'Nhắc nhở đơn hàng',
        message: `Đơn hàng #${orderId} của bạn sẽ được giao trong ${daysLeft} ngày tới. Hãy chuẩn bị nhận hàng!`,
        type: 'order',
        data: {
          orderId,
          daysLeft,
          action: 'reminder'
        }
      });
      return notification;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo nhắc nhở đơn hàng:', error);
      throw error;
    }
  }

  // Tạo thông báo đánh giá sản phẩm
  static async createReviewReminderNotification(userId, productId, productName) {
    try {
      const notification = await Notification.create({
        user: userId,
        title: 'Đánh giá sản phẩm',
        message: `Bạn đã mua sản phẩm "${productName}". Hãy chia sẻ trải nghiệm của bạn để giúp người khác!`,
        type: 'product',
        data: {
          productId,
          productName,
          action: 'review_reminder'
        }
      });
      return notification;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo nhắc nhở đánh giá:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
