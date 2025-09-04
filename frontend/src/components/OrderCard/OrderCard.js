import React from 'react';
import { api } from '../../services/api';

const OrderCard = ({ order, onStatusUpdate }) => {
  const handleCancelOrder = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        const token = localStorage.getItem('token');
        await api.put(`/orders/${order._id}`, 
          { status: 'cancelled' },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        onStatusUpdate();
      } catch (error) {
        if (error.response && error.response.data) {
          alert(error.response.data.error);
        } else {
          alert('Có lỗi xảy ra khi hủy đơn hàng');
        }
      }
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipping':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f97316'; // Orange
      case 'confirmed':
        return '#2563eb'; // Blue
      case 'shipping':
        return '#9333ea'; // Purple
      case 'delivered':
        return '#16a34a'; // Green
      case 'cancelled':
        return '#dc2626'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            Đơn hàng #{(order._id || 'N/A').toString().slice(-6)}
          </h3>
          <p className="text-gray-600 text-sm">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
          </p>
        </div>
        <div>
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${getStatusColor(order.status)}20`,
              color: getStatusColor(order.status)
            }}
          >
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {order.items?.map((item) => (
          <div key={item._id} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {item.productId?.images?.[0] ? (
                <img 
                  src={`http://localhost:5000/${item.productId.images[0]}`}
                  alt={item.productId.name || 'Product image'}
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/48';
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div>
                <p className="font-medium">{item.productId?.name || 'Sản phẩm không còn tồn tại'}</p>
                <p className="text-sm text-gray-600">
                  SL: {item.quantity || 0} x {formatPrice(item.price)}
                </p>
              </div>
            </div>
            <p className="font-medium">
              {formatPrice((item.price || 0) * (item.quantity || 0))}
            </p>
          </div>
        )) || (
          <div className="text-gray-500 text-center py-4">
            Không có sản phẩm nào trong đơn hàng
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="font-medium">Tổng tiền:</span>
          <span className="font-bold text-lg">
            {formatPrice(order.total)}
          </span>
        </div>
        
        {order.status === 'pending' && (
          <button
            onClick={handleCancelOrder}
            className="mt-4 w-full py-2 px-4 bg-red-600 text-white 
              rounded hover:bg-red-700 transition-colors"
          >
            Hủy đơn hàng
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
