const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  createSampleNotifications();
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

async function createSampleNotifications() {
  try {
    // Xóa tất cả thông báo cũ
    await Notification.deleteMany({});
    console.log('Đã xóa thông báo cũ');

    // Tạo thông báo mẫu cho user "admin"
    const adminNotifications = [
      {
        user: 'admin',
        title: 'Chào mừng Admin! 🎉',
        message: 'Chào mừng bạn đến với hệ thống quản lý ShopStore. Bạn có thể quản lý tất cả sản phẩm, đơn hàng và người dùng từ đây.',
        type: 'system',
        data: { action: 'welcome_admin' }
      },
      {
        user: 'admin',
        title: 'Cập nhật hệ thống',
        message: 'Hệ thống đã được cập nhật lên phiên bản mới với nhiều tính năng hữu ích.',
        type: 'system',
        data: { action: 'system_update' }
      }
    ];

    // Tạo thông báo mẫu cho user "user1"
    const user1Notifications = [
      {
        user: 'user1',
        title: 'Đơn hàng #12345 đã được xác nhận',
        message: 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị!',
        type: 'order',
        data: { orderId: '12345', status: 'confirmed' }
      },
      {
        user: 'user1',
        title: 'Sản phẩm yêu thích đã có hàng trở lại',
        message: 'Sản phẩm "Laptop Gaming" đã có hàng trở lại. Hãy nhanh tay đặt hàng!',
        type: 'product',
        data: { productId: 'prod123', productName: 'Laptop Gaming', action: 'restock' }
      },
      {
        user: 'user1',
        title: 'Khuyến mãi mới: Giảm 20% cho tất cả sản phẩm',
        message: 'Chương trình khuyến mãi lớn nhất năm đã bắt đầu! Giảm giá 20% cho tất cả sản phẩm.',
        type: 'promotion',
        data: { discount: '20%', promotionTitle: 'Khuyến mãi mùa hè' }
      }
    ];

    // Tạo thông báo mẫu cho user "user2"
    const user2Notifications = [
      {
        user: 'user2',
        title: 'Đơn hàng #12346 đang được vận chuyển',
        message: 'Đơn hàng của bạn đang được vận chuyển và sẽ đến trong 2-3 ngày tới!',
        type: 'order',
        data: { orderId: '12346', status: 'shipping' }
      },
      {
        user: 'user2',
        title: 'Sản phẩm mới: Smartphone XYZ',
        message: 'Sản phẩm mới "Smartphone XYZ" đã có sẵn. Khám phá ngay với giá ưu đãi!',
        type: 'product',
        data: { productId: 'prod456', productName: 'Smartphone XYZ', action: 'new_product' }
      }
    ];

    // Tạo thông báo mẫu cho user "user3"
    const user3Notifications = [
      {
        user: 'user3',
        title: 'Nhắc nhở đánh giá sản phẩm',
        message: 'Bạn đã mua sản phẩm "Tai nghe Bluetooth". Hãy chia sẻ trải nghiệm của bạn để giúp người khác!',
        type: 'product',
        data: { productId: 'prod789', productName: 'Tai nghe Bluetooth', action: 'review_reminder' }
      },
      {
        user: 'user3',
        title: 'Giá sản phẩm giảm',
        message: 'Sản phẩm "Máy tính bảng Pro" đã giảm giá từ 15,000,000đ xuống 12,000,000đ. Kiểm tra ngay!',
        type: 'product',
        data: { productId: 'prod101', productName: 'Máy tính bảng Pro', action: 'price_drop' }
      }
    ];

    // Tạo tất cả thông báo
    const allNotifications = [
      ...adminNotifications,
      ...user1Notifications,
      ...user2Notifications,
      ...user3Notifications
    ];

    // Thêm thời gian tạo khác nhau để test
    const now = new Date();
    for (let i = 0; i < allNotifications.length; i++) {
      allNotifications[i].createdAt = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Mỗi thông báo cách nhau 1 giờ
      allNotifications[i].updatedAt = allNotifications[i].createdAt;
    }

    const createdNotifications = await Notification.insertMany(allNotifications);
    console.log(`Đã tạo ${createdNotifications.length} thông báo mẫu thành công!`);

    // Hiển thị thống kê
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: ['$read', 0, 1] }
          }
        }
      }
    ]);

    console.log('\nThống kê thông báo:');
    stats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count} thông báo (${stat.unreadCount} chưa đọc)`);
    });

    // Hiển thị thống kê theo loại
    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\nThống kê theo loại:');
    typeStats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count} thông báo`);
    });

    mongoose.connection.close();
    console.log('\nĐã đóng kết nối MongoDB');
  } catch (error) {
    console.error('Lỗi khi tạo thông báo mẫu:', error);
    mongoose.connection.close();
  }
}
