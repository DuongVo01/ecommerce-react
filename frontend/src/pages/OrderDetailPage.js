import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { getOrders } from '../services/api';

const OrderDetailPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy orderId từ location.state
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!user || !(user._id || user.id)) {
      navigate('/login');
      return;
    }
    if (!orderId) {
      navigate('/');
      return;
    }
    // Lấy tất cả đơn hàng của user, tìm đơn hàng vừa đặt
    getOrders(user._id || user.id)
      .then(res => {
        const found = res.data.find(o => o._id === orderId || o.id === orderId);
        setOrder(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, orderId, navigate]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Đang tải đơn hàng...</div>;
  if (!order) return <div style={{ textAlign: 'center', marginTop: 40 }}>Không tìm thấy đơn hàng!</div>;

  return (
    <div style={{
      maxWidth: 650,
      margin: '40px auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 8px 32px #1976d233',
      padding: 36,
    }}>
      <h2 style={{
        color: '#1976d2',
        marginBottom: 28,
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '2rem',
      }}>Chi tiết đơn hàng</h2>
      <div style={{
        marginBottom: 22,
        background: '#e3eafc',
        borderRadius: 12,
        padding: '18px 20px',
        boxShadow: '0 2px 8px #1976d233',
      }}>
        <div style={{ marginBottom: 8 }}><strong>Mã đơn hàng:</strong> {order._id || order.id}</div>
        <div style={{ marginBottom: 8 }}>
          <strong>Trạng thái:</strong> <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 8,
            fontWeight: 600,
            background: order.status === 'completed' ? '#e0f7fa' : order.status === 'shipping' ? '#fffde7' : order.status === 'waiting' ? '#e3fcec' : '#fbe9e7',
            color: order.status === 'completed' ? '#009688' : order.status === 'shipping' ? '#fbc02d' : order.status === 'waiting' ? '#388e3c' : '#d84315',
          }}>
            {order.status === 'completed' && 'Đã giao'}
            {order.status === 'shipping' && 'Đang vận chuyển'}
            {order.status === 'waiting' && 'Chờ giao hàng'}
            {order.status === 'cancelled' && 'Đã hủy'}
            {['completed','shipping','waiting','cancelled'].indexOf(order.status) === -1 && order.status}
          </span>
        </div>
        <div>
          <strong>Tổng tiền:</strong> <span style={{ color: '#ff9800', fontWeight: 700, fontSize: '1.1rem' }}>{Number(order.total).toLocaleString()}₫</span>
        </div>
      </div>
      <h3 style={{ color: '#1976d2', marginBottom: 14, fontWeight: 600 }}>Sản phẩm</h3>
      <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 24 }}>
        {order.items.map((item, idx) => (
          <li key={idx} style={{
            marginBottom: 10,
            background: '#f8fafc',
            borderRadius: 8,
            padding: '10px 16px',
            boxShadow: '0 1px 4px #1976d211',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 500 }}>{item.productId?.name || item.productName || item.productId}</span>
            <span style={{ color: '#1976d2', fontWeight: 600 }}>x {item.quantity}</span>
          </li>
        ))}
      </ul>
      <button
        style={{
          background: 'linear-gradient(90deg, #1976d2 60%, #2196f3 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: '0 2px 8px #1976d233',
          cursor: 'pointer',
          margin: '0 auto',
          display: 'block',
        }}
        onClick={() => navigate(-1)}
      >Quay lại</button>
    </div>
  );
};

export default OrderDetailPage;
