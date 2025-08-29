const Order = require('../models/Order');
const Cart = require('../models/Cart');
const NotificationService = require('../services/notificationService');
const User = require('../models/User'); // Added missing import for User

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
    
    // Get user to access addresses
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach address information to each order
    const ordersWithAddresses = orders.map(order => {
      const orderObj = order.toObject();
      if (order.addressId) {
        const address = user.addresses.find(addr => addr._id.toString() === order.addressId.toString());
        if (address) {
          orderObj.addressId = address;
        }
      }
      return orderObj;
    });

    res.json(ordersWithAddresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod, total } = req.body;
    
    // Validate addressId
    if (!addressId) {
      return res.status(400).json({ error: 'Vui lòng thêm địa chỉ giao hàng' });
    }

    // Get user and validate address exists
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const selectedAddress = user.addresses.find(addr => addr._id.toString() === addressId);
    if (!selectedAddress) {
      return res.status(400).json({ error: 'Địa chỉ giao hàng không hợp lệ' });
    }
    
    // Get cart items for this user
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Create order items from cart items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.priceAtAddTime
    }));
    
    const newOrder = new Order({ 
      userId: req.params.userId, 
      addressId,
      items: orderItems, 
      total,
      paymentMethod: paymentMethod || 'COD'
    });
    
    const savedOrder = await newOrder.save();
    
    // Remove purchased items from cart after successful order creation
    // Since we're purchasing all items in the cart, we clear the entire cart
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
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
