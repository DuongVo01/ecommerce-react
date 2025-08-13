# Hệ thống Thông báo - ShopStore

## Tổng quan
Hệ thống thông báo tự động cho phép gửi thông báo đến người dùng khi có các sự kiện quan trọng như cập nhật đơn hàng, sản phẩm mới, khuyến mãi, v.v.

## Cấu trúc

### 1. Model (Notification.js)
- **user**: Tên người dùng nhận thông báo
- **title**: Tiêu đề thông báo
- **message**: Nội dung thông báo
- **type**: Loại thông báo (order, product, promotion, system, other)
- **read**: Trạng thái đã đọc (true/false)
- **data**: Dữ liệu bổ sung (JSON)
- **createdAt**: Thời gian tạo
- **expiresAt**: Thời gian hết hạn (tự động xóa)

### 2. Controller (notificationController.js)
- `getUserNotifications`: Lấy thông báo của user
- `markAsRead`: Đánh dấu đã đọc
- `markAllAsRead`: Đánh dấu tất cả đã đọc
- `deleteNotification`: Xóa thông báo
- `createNotification`: Tạo thông báo mới (admin)
- `createBulkNotifications`: Tạo thông báo hàng loạt (admin)

### 3. Service (notificationService.js)
- `createOrderNotification`: Thông báo đơn hàng
- `createProductNotification`: Thông báo sản phẩm
- `createPromotionNotification`: Thông báo khuyến mãi
- `createSystemNotification`: Thông báo hệ thống
- `createWelcomeNotification`: Thông báo chào mừng

## API Endpoints

### Lấy thông báo
```
GET /api/notifications/user?page=1&limit=20&unreadOnly=false
```

### Đánh dấu đã đọc
```
PATCH /api/notifications/:notificationId/read
PATCH /api/notifications/mark-all-read
```

### Xóa thông báo
```
DELETE /api/notifications/:notificationId
DELETE /api/notifications/delete-read
```

### Tạo thông báo (Admin)
```
POST /api/notifications/create
POST /api/notifications/create-bulk
```

## Tích hợp tự động

### 1. Đơn hàng
Thông báo tự động được tạo khi:
- Tạo đơn hàng mới
- Cập nhật trạng thái đơn hàng (confirmed, shipping, delivered, cancelled)

### 2. Sản phẩm
Thông báo cho các sự kiện:
- Sản phẩm có hàng trở lại
- Giá sản phẩm giảm
- Sản phẩm mới
- Nhắc nhở đánh giá

### 3. Khuyến mãi
Thông báo khuyến mãi với:
- Tiêu đề khuyến mãi
- Mô tả chi tiết
- Thông tin giảm giá

## Sử dụng

### 1. Tạo thông báo mẫu
```bash
cd backend
node createSampleNotifications.js
```

### 2. Tạo thông báo từ code
```javascript
const NotificationService = require('./services/notificationService');

// Thông báo đơn hàng
await NotificationService.createOrderNotification(
  'username',
  'order123',
  'confirmed',
  'Đơn hàng đã được xác nhận!'
);

// Thông báo sản phẩm
await NotificationService.createProductNotification(
  'username',
  'prod123',
  'Laptop Gaming',
  'restock'
);

// Thông báo khuyến mãi
await NotificationService.createPromotionNotification(
  'username',
  'Khuyến mãi mùa hè',
  'Giảm giá 20% cho tất cả sản phẩm',
  '20%'
);
```

### 3. Tạo thông báo cho tất cả user
```javascript
await NotificationService.createNotificationForAllUsers(
  'Thông báo quan trọng',
  'Hệ thống sẽ bảo trì vào ngày mai',
  'system'
);
```

## Frontend Integration

### 1. Lấy thông báo
```javascript
import { getNotifications } from '../services/api';

const response = await getNotifications(1, 20);
const notifications = response.data;
```

### 2. Đánh dấu đã đọc
```javascript
import { markNotificationAsRead } from '../services/api';

await markNotificationAsRead(notificationId);
```

### 3. Đánh dấu tất cả đã đọc
```javascript
import { markAllNotificationsAsRead } from '../services/api';

await markAllNotificationsAsRead();
```

## Tính năng nâng cao

### 1. Tự động xóa thông báo cũ
- Giữ lại 100 thông báo gần nhất cho mỗi user
- Tự động xóa thông báo cũ khi vượt quá giới hạn

### 2. Thời gian tương đối
- Hiển thị "2 phút trước", "1 giờ trước", "3 ngày trước"
- Tự động cập nhật theo thời gian thực

### 3. Phân loại thông báo
- **order**: Thông báo đơn hàng
- **product**: Thông báo sản phẩm
- **promotion**: Thông báo khuyến mãi
- **system**: Thông báo hệ thống
- **other**: Thông báo khác

### 4. Dữ liệu bổ sung
Mỗi thông báo có thể chứa dữ liệu bổ sung:
```javascript
{
  orderId: '12345',
  status: 'confirmed',
  action: 'order_update'
}
```

## Bảo mật

- Tất cả API đều yêu cầu xác thực JWT
- Chỉ admin mới có thể tạo thông báo hàng loạt
- User chỉ có thể truy cập thông báo của mình

## Monitoring

### 1. Thống kê
- Số thông báo theo user
- Số thông báo chưa đọc
- Phân loại theo loại thông báo

### 2. Logs
- Log tất cả hoạt động tạo/xóa thông báo
- Log lỗi khi gửi thông báo
- Log hiệu suất hệ thống

## Troubleshooting

### 1. Thông báo không hiển thị
- Kiểm tra JWT token
- Kiểm tra quyền truy cập
- Kiểm tra database connection

### 2. Thông báo không được tạo
- Kiểm tra NotificationService import
- Kiểm tra user ID
- Kiểm tra database schema

### 3. Hiệu suất chậm
- Kiểm tra database indexes
- Kiểm tra số lượng thông báo
- Sử dụng pagination

## Tương lai

### 1. Tính năng mới
- Push notifications
- Email notifications
- SMS notifications
- WebSocket real-time

### 2. Tối ưu hóa
- Redis caching
- Database sharding
- Background job processing
- Rate limiting
