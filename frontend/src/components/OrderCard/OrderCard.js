import React from 'react';
import { api } from '../../services/api';
import './OrderCard.css';

const OrderCard = ({ order, onStatusUpdate }) => {
  const handleCancelOrder = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        const token = localStorage.getItem('token');
        await api.put(`/orders/${order._id}`,
          { status: 'cancelled' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onStatusUpdate();
      } catch (error) {
        alert(error.response?.data?.error || 'Có lỗi xảy ra khi hủy đơn hàng');
      }
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price || 0);

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="order-card">
      {/* Header */}
      <div className="order-header">
        <div>
          <h3 className="order-id">Đơn hàng #{(order._id || 'N/A').toString().slice(-6)}</h3>
          <p className="order-date">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
          </p>
        </div>
        <span className={`order-status status-${order.status}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Product list */}
      <div className="order-products">
        {order.items?.length > 0 ? (
          order.items.map((item) => (
            <div key={item._id} className="order-item">
              <div className="order-item-image">
                {item.productId?.images?.[0] ? (
                  <img
                    src={`http://localhost:5000/${item.productId.images[0]}`}
                    alt={item.productId.name}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/64'; }}
                  />
                ) : (
                  <div className="no-image">No image</div>
                )}
              </div>
              <div className="order-item-info">
                <p className="product-name">{item.productId?.name || 'Sản phẩm không tồn tại'}</p>
                <p className="product-qty">SL: {item.quantity} x {formatPrice(item.price)}</p>
              </div>
              <div className="order-item-price">
                {formatPrice(item.quantity * item.price)}
              </div>
            </div>
          ))
        ) : (
          <div className="order-empty">Không có sản phẩm nào trong đơn hàng</div>
        )}
      </div>

      {/* Footer */}
      <div className="order-footer">
        <div className="order-total">
          Tổng tiền: <span>{formatPrice(order.total)}</span>
        </div>
        {order.status === 'pending' && (
          <button className="btn-cancel" onClick={handleCancelOrder}>
            Hủy đơn hàng
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
