import React from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './OrderCard.css';

const OrderCard = ({ order, onStatusUpdate }) => {
  const navigate = useNavigate();
  console.log('Order data:', order);

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
          order.items.map((item) => {

            
            return (
              <div key={item._id || item.productId} className="order-item">
                <div 
                  className="order-item-image" 
                  onClick={() => item.productId?._id && navigate(`/product/${item.productId._id}`)}
                  style={{ cursor: item.productId?._id ? 'pointer' : 'default' }}
                >
                  {item.productId?.image ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.productId.image}`}
                      alt={item.productId?.name}
                      onError={(e) => { 
                        console.log('Image load error for:', item.productId?.image);
                        e.target.src = 'https://placehold.co/80x80/e5e7eb/a3a3a3?text=No+Image'; 
                        e.target.onerror = null; 
                      }}
                    />
                  ) : (
                    <div className="no-image">Không có ảnh</div>
                  )}
                </div>
                <div className="order-item-info">
                  <p 
                    className="product-name" 
                    onClick={() => item.productId?._id && navigate(`/product/${item.productId._id}`)}
                    style={{ cursor: item.productId?._id ? 'pointer' : 'default' }}
                  >
                    {item.productId?.name || 'Sản phẩm không tồn tại'}
                  </p>
                  <p className="product-qty">
                    SL: {item.quantity} x {formatPrice(item.price)}
                    {item.variant && (
                      <span className="product-variant"> - {item.variant}</span>
                    )}
                  </p>
                </div>
                <div className="order-item-price">
                  {formatPrice(item.quantity * item.price)}
                </div>
              </div>
            );
          })
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
