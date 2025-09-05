import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../CartContext';
import { useToast } from '../../ToastContext';
import { api } from '../../services/api';
import './OrderCard.css';

const OrderCard = ({ order, onStatusUpdate }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isRepurchasing, setIsRepurchasing] = useState(false);

  // Xử lý mua lại
  const handleRepurchase = async () => {
    const validItems = order.items.filter(item => item.productId?._id);
    if (validItems.length === 0) {
      showToast('Không có sản phẩm hợp lệ để mua lại', 'error');
      return;
    }

    // Tạo thông báo xác nhận
    const confirmMessage = `Bạn muốn thêm ${validItems.length} sản phẩm vào giỏ hàng?\n${validItems
      .map(item => `- ${item.productId.name} (SL: ${item.quantity})`)
      .join('\n')}`;
    if (!window.confirm(confirmMessage)) return;

    setIsRepurchasing(true);
    try {
      const successItems = [];
      const failedItems = [];

      // Kiểm tra tồn kho và thêm vào giỏ hàng
      for (const item of validItems) {
        try {
          const { data } = await api.get(`/products/${item.productId._id}`);
          if (data.stock >= item.quantity) {
            await addToCart(item.productId, item.quantity);
            successItems.push(item.productId.name);
          } else {
            failedItems.push(`${item.productId.name} (Hết hàng hoặc không đủ số lượng)`);
          }
        } catch (error) {
          failedItems.push(`${item.productId.name} (Lỗi: ${error.response?.data?.error || 'Không xác định'})`);
        }
      }

      // Hiển thị thông báo
      if (successItems.length > 0) {
        showToast(
          `Đã thêm ${successItems.length} sản phẩm vào giỏ hàng:\n${successItems.join(', ')}`,
          'success'
        );
        navigate('/cart');
      }
      if (failedItems.length > 0) {
        showToast(`Không thể thêm: ${failedItems.join(', ')}`, 'error');
      }
    } catch (error) {
      showToast('Có lỗi xảy ra khi mua lại đơn hàng', 'error');
    } finally {
      setIsRepurchasing(false);
    }
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        const token = localStorage.getItem('token');
        await api.put(
          `/orders/${order._id}`,
          { status: 'cancelled' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast('Đã hủy đơn hàng thành công', 'success');
        onStatusUpdate();
      } catch (error) {
        showToast(error.response?.data?.error || 'Có lỗi xảy ra khi hủy đơn hàng', 'error');
      }
    }
  };

  // Định dạng giá
  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  // Định dạng trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'waiting': return 'Chờ giao hàng';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'completed': return 'Hoàn thành';
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

      {/* Danh sách sản phẩm */}
      <div className="order-products">
        {order.items?.length > 0 ? (
          order.items.map((item) => (
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
                  {item.variant && <span className="product-variant"> - {item.variant}</span>}
                </p>
              </div>
              <div className="order-item-price">{formatPrice(item.quantity * item.price)}</div>
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
        <div className="order-actions">
          {order.status === 'pending' && (
            <button className="btn-cancel" onClick={handleCancelOrder}>
              Hủy đơn hàng
            </button>
          )}
          {(order.status === 'delivered' || order.status === 'completed' || order.status === 'cancelled') && (
            <button className="btn-repurchase" onClick={handleRepurchase} disabled={isRepurchasing}>
              {isRepurchasing ? (
                <span className="spinner" />
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="repurchase-icon"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <polyline points="23 20 23 14 17 14" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                  Mua lại
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;