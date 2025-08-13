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
  testAdminNotifications();
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

async function testAdminNotifications() {
  try {
    console.log('🧪 Bắt đầu test hệ thống thông báo Admin...\n');

    // Test 1: Tạo thông báo mẫu cho nhiều user
    console.log('📝 Test 1: Tạo thông báo mẫu cho nhiều user...');
    
    const testUsers = ['admin', 'user1', 'user2', 'user3', 'user4'];
    const testNotifications = [];

    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const notificationCount = Math.floor(Math.random() * 5) + 1; // 1-5 thông báo mỗi user
      
      for (let j = 0; j < notificationCount; j++) {
        const types = ['order', 'product', 'promotion', 'system', 'other'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const notification = {
          user,
          title: `Thông báo test ${j + 1} cho ${user}`,
          message: `Đây là thông báo test số ${j + 1} cho người dùng ${user}. Loại: ${type}`,
          type,
          read: Math.random() > 0.5, // Random trạng thái đọc
          data: {
            testId: `test_${i}_${j}`,
            timestamp: new Date().toISOString()
          }
        };
        
        testNotifications.push(notification);
      }
    }

    // Xóa thông báo cũ nếu có
    await Notification.deleteMany({ 'data.testId': { $regex: /^test_/ } });
    console.log('✅ Đã xóa thông báo test cũ');

    // Tạo thông báo mới
    const createdNotifications = await Notification.insertMany(testNotifications);
    console.log(`✅ Đã tạo ${createdNotifications.length} thông báo test\n`);

    // Test 2: Kiểm tra thống kê
    console.log('📊 Test 2: Kiểm tra thống kê thông báo...');
    
    const totalCount = await Notification.countDocuments();
    const unreadCount = await Notification.countDocuments({ read: false });
    const readCount = await Notification.countDocuments({ read: true });
    
    console.log(`📈 Tổng số thông báo: ${totalCount}`);
    console.log(`🔴 Chưa đọc: ${unreadCount}`);
    console.log(`✅ Đã đọc: ${readCount}`);

    // Thống kê theo loại
    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📋 Thống kê theo loại:');
    typeStats.forEach(stat => {
      console.log(`  - ${stat._id}: ${stat.count} thông báo`);
    });

    // Thống kê theo user
    const userStats = await Notification.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          unreadCount: { $sum: { $cond: ['$read', 0, 1] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n👥 Thống kê theo user:');
    userStats.forEach(stat => {
      console.log(`  - ${stat._id}: ${stat.count} thông báo (${stat.unreadCount} chưa đọc)`);
    });

    // Test 3: Test các chức năng admin
    console.log('\n🔧 Test 3: Test các chức năng admin...');
    
    // Lấy một thông báo để test
    const testNotification = await Notification.findOne({ 'data.testId': { $regex: /^test_/ } });
    
    if (testNotification) {
      console.log(`📝 Test notification: ${testNotification.title}`);
      
      // Test đánh dấu đã đọc
      if (!testNotification.read) {
        await Notification.findByIdAndUpdate(testNotification._id, { read: true });
        console.log('✅ Đã test đánh dấu đã đọc');
      }
      
      // Test cập nhật thông báo
      await Notification.findByIdAndUpdate(testNotification._id, {
        title: testNotification.title + ' (Đã cập nhật)',
        'data.lastUpdated': new Date().toISOString()
      });
      console.log('✅ Đã test cập nhật thông báo');
    }

    // Test 4: Tạo thông báo hàng loạt
    console.log('\n📢 Test 4: Test tạo thông báo hàng loạt...');
    
    const bulkNotifications = testUsers.map(user => ({
      user,
      title: 'Thông báo khuyến mãi mùa hè! 🎉',
      message: 'Chương trình khuyến mãi mùa hè đã bắt đầu với nhiều ưu đãi hấp dẫn!',
      type: 'promotion',
      read: false,
      data: {
        promotionId: 'summer_2024',
        discount: '20%',
        testId: 'bulk_test'
      }
    }));

    const bulkCreated = await Notification.insertMany(bulkNotifications);
    console.log(`✅ Đã tạo ${bulkCreated.length} thông báo khuyến mãi hàng loạt`);

    // Test 5: Kiểm tra hiệu suất
    console.log('\n⚡ Test 5: Kiểm tra hiệu suất...');
    
    const startTime = Date.now();
    
    // Test query với filter
    const filteredNotifications = await Notification.find({
      type: 'promotion',
      read: false
    }).limit(10);
    
    const queryTime = Date.now() - startTime;
    console.log(`⏱️  Thời gian query: ${queryTime}ms`);
    console.log(`📊 Kết quả filter: ${filteredNotifications.length} thông báo`);

    // Test 6: Dọn dẹp dữ liệu test
    console.log('\n🧹 Test 6: Dọn dẹp dữ liệu test...');
    
    const deleteResult = await Notification.deleteMany({
      $or: [
        { 'data.testId': { $regex: /^test_/ } },
        { 'data.testId': 'bulk_test' }
      ]
    });
    
    console.log(`✅ Đã xóa ${deleteResult.deletedCount} thông báo test`);

    // Kết quả cuối cùng
    const finalCount = await Notification.countDocuments();
    console.log(`\n🎯 Kết quả cuối cùng: ${finalCount} thông báo trong hệ thống`);

    console.log('\n🎉 Tất cả test đã hoàn thành thành công!');
    console.log('\n📋 Tóm tắt các chức năng đã test:');
    console.log('  ✅ Tạo thông báo đơn lẻ');
    console.log('  ✅ Tạo thông báo hàng loạt');
    console.log('  ✅ Thống kê và báo cáo');
    console.log('  ✅ Lọc và tìm kiếm');
    console.log('  ✅ Cập nhật trạng thái');
    console.log('  ✅ Xóa thông báo');
    console.log('  ✅ Hiệu suất query');

    mongoose.connection.close();
    console.log('\n🔌 Đã đóng kết nối MongoDB');
  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
    mongoose.connection.close();
  }
}
