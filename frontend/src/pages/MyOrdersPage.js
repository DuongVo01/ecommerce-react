import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { getOrders } from '../services/api';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

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

  // Nội dung từng tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
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
      case 'profile':
        navigate('/account');
        return null;
      case 'address':
        return (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%', textAlign: 'center' }}>
            <h2 className="account-title">Địa chỉ</h2>
            <div className="account-desc">Quản lý địa chỉ nhận hàng của bạn tại đây.</div>
            <div style={{ color: '#888', marginTop: 24 }}>Chức năng này sẽ được phát triển sau.</div>
          </div>
        );
      case 'privacy':
        return (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%', textAlign: 'center' }}>
            <h2 className="account-title">Thiết Lập Riêng Tư</h2>
            <div className="account-desc">Quản lý các thiết lập bảo mật và quyền riêng tư.</div>
            <div style={{ color: '#888', marginTop: 24 }}>Chức năng này sẽ được phát triển sau.</div>
          </div>
        );
      case 'info':
        return (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%', textAlign: 'center' }}>
            <h2 className="account-title">Thông tin cá nhân</h2>
            <div className="account-desc">Xem thông tin cá nhân của bạn.</div>
            <div style={{ color: '#888', marginTop: 24 }}>Chức năng này sẽ được phát triển sau.</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="orders-container">
      {/* Sidebar */}
      <aside className="orders-sidebar">
        <div
          className="orders-sidebar-title"
          onClick={() => {
            setActiveTab('profile');
            setSidebarExpanded(true);
          }}
        >Tài khoản của tôi</div>
        {sidebarExpanded && (
          <div className="orders-sidebar-list">
            <div
              className={`orders-sidebar-item${activeTab === 'profile' ? ' active' : ''}`}
              style={{ fontSize: 17, marginBottom: 8, fontWeight: 600 }}
              onClick={() => setActiveTab('profile')}
            >Hồ sơ</div>
            <div
              className={`orders-sidebar-item${activeTab === 'address' ? ' active' : ''}`}
              onClick={() => setActiveTab('address')}
            >Địa chỉ</div>
            <div
              className={`orders-sidebar-item${activeTab === 'privacy' ? ' active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >Những Thiết Lập Riêng Tư</div>
            <div
              className={`orders-sidebar-item${activeTab === 'info' ? ' active' : ''}`}
              onClick={() => setActiveTab('info')}
            >Thông tin cá nhân</div>
          </div>
        )}
        <div
          className="orders-sidebar-purchase"
          onClick={() => {
            setActiveTab('orders');
            setSidebarExpanded(true); // xổ lại sidebar khi nhấn Đơn mua
          }}
        >Đơn mua</div>
      </aside>
      {/* Main content: Tab content */}
      <div className="orders-main">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MyOrdersPage;
