import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { getOrders } from '../services/api';

const MyOrdersPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !(user._id || user.id)) return;
    getOrders(user._id || user.id)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) return <div style={{ textAlign: 'center', marginTop: 40 }}>Bạn cần đăng nhập để xem đơn hàng!</div>;
  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Đang tải đơn hàng...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #1976d233', padding: 36 }}>
      <h2 style={{ color: '#1976d2', marginBottom: 28, textAlign: 'center', fontWeight: 700, fontSize: '2rem' }}>Đơn mua của tôi</h2>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 40, color: '#64748b', fontSize: '1.1rem' }}>Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, marginTop: 16, fontSize: '1rem' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #e3eafc 60%, #fff 100%)', color: '#1976d2', fontWeight: 700 }}>
                <th style={{ padding: 14, borderTopLeftRadius: 12 }}>Mã đơn</th>
                <th style={{ padding: 14 }}>Ngày đặt</th>
                <th style={{ padding: 14 }}>Tổng tiền</th>
                <th style={{ padding: 14 }}>Trạng thái</th>
                <th style={{ padding: 14, borderTopRightRadius: 12 }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr
                  key={order._id || order.id}
                  style={{
                    background: '#fff',
                    borderBottom: '1px solid #e3eafc',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: 12, fontWeight: 500 }}>{order._id || order.id}</td>
                  <td style={{ padding: 12 }}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                  <td style={{ padding: 12, color: '#ff9800', fontWeight: 700 }}>{Number(order.total).toLocaleString()}₫</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 8,
                      fontWeight: 600,
                      background: order.status === 'completed' ? '#e0f7fa'
                        : order.status === 'shipping' ? '#fffde7'
                        : order.status === 'waiting' ? '#e3fcec'
                        : order.status === 'pending' ? '#e3fcec'
                        : '#fbe9e7',
                      color: order.status === 'completed' ? '#009688'
                        : order.status === 'shipping' ? '#fbc02d'
                        : order.status === 'waiting' ? '#388e3c'
                        : order.status === 'pending' ? '#388e3c'
                        : '#d84315',
                    }}>
                      {order.status === 'completed' && 'Đã giao'}
                      {order.status === 'shipping' && 'Đang vận chuyển'}
                      {order.status === 'waiting' && 'Chờ giao hàng'}
                      {order.status === 'pending' && 'Chờ xác nhận'}
                      {order.status === 'cancelled' && 'Đã hủy'}
                      {['completed','shipping','waiting','pending','cancelled'].indexOf(order.status) === -1 && order.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <button
                      style={{
                        background: 'linear-gradient(90deg, #1976d2 60%, #2196f3 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '7px 20px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px #1976d233',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => navigate('/order-detail', { state: { orderId: order._id || order.id } })}
                    >Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
