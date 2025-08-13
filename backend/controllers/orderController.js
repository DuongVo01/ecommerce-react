const Order = require('../models/Order');
const NotificationService = require('../services/notificationService');

exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.orderId);
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('items.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;
    const newOrder = new Order({ userId: req.params.userId, items, total });
    const savedOrder = await newOrder.save();
    
    // Tạo thông báo xác nhận đơn hàng
    try {
      await NotificationService.createOrderNotification(
        req.params.userId,
        savedOrder._id,
        'pending',
        'Đơn hàng của bạn đã được đặt thành công và đang chờ xác nhận!'
      );
    } catch (notificationError) {
      console.error('Lỗi khi tạo thông báo đơn hàng:', notificationError);
      // Không làm ảnh hưởng đến việc tạo đơn hàng
    }
    
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
    
    // Tạo thông báo cập nhật trạng thái đơn hàng
    try {
      let message = '';
      switch (status) {
        case 'confirmed':
          message = 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị!';
          break;
        case 'shipping':
          message = 'Đơn hàng của bạn đang được vận chuyển!';
          break;
        case 'delivered':
          message = 'Đơn hàng của bạn đã được giao thành công! Hãy đánh giá sản phẩm để nhận ưu đãi!';
          break;
        case 'cancelled':
          message = 'Đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ hỗ trợ!';
          break;
        default:
          message = `Trạng thái đơn hàng đã được cập nhật thành: ${status}`;
      }
      
      await NotificationService.createOrderNotification(
        updatedOrder.userId,
        updatedOrder._id,
        status,
        message
      );
    } catch (notificationError) {
      console.error('Lỗi khi tạo thông báo cập nhật đơn hàng:', notificationError);
      // Không làm ảnh hưởng đến việc cập nhật đơn hàng
    }
    
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
