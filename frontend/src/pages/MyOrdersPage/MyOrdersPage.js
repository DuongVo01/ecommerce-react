import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import { getOrders } from '../../services/api';
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
          <div className="myorders-wrapper">
            <div className="myorders-header">
              <span className="myorders-title">Đơn mua của tôi</span>
              <span className="myorders-count">{orders.length} đơn hàng</span>
            </div>
            {orders.length === 0 ? (
              <div className="myorders-empty">Bạn chưa có đơn hàng nào.</div>
            ) : (
              <div className="myorders-table-wrap">
                <table className="myorders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id || order.id}>
                        <td>{order._id || order.id}</td>
                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                        <td className="myorders-money">{Number(order.total).toLocaleString('vi-VN')}₫</td>
                        <td>
                          <span className={`myorders-status myorders-status-${order.status}`}>
                            {order.status === 'completed' && <><span className="myorders-status-icon">✔️</span> Đã giao</>}
                            {order.status === 'shipping' && <><span className="myorders-status-icon">🚚</span> Đang vận chuyển</>}
                            {order.status === 'waiting' && <><span className="myorders-status-icon">⏳</span> Chờ giao hàng</>}
                            {order.status === 'pending' && <><span className="myorders-status-icon">🕒</span> Chờ xác nhận</>}
                            {order.status === 'cancelled' && <><span className="myorders-status-icon">❌</span> Đã hủy</>}
                            {['completed','shipping','waiting','pending','cancelled'].indexOf(order.status) === -1 && order.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="myorders-detail-btn"
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
        break;
      case 'profile':
        navigate('/account');
        return null;
        break;
      case 'address':
        navigate('/account');
        return null;
        break;
      case 'privacy':
        navigate('/account');
        return null;
      case 'info':
        navigate('/account');
        return null;
        break;
      default:
        return null;
        break;
    }
  };

  return (
    <div className="orders-container myorders-page">
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

// CSS hiện đại cho MyOrdersPage
// Thêm vào file MyOrdersPage.css nếu chưa có
/*
.myorders-page {
  background: #f3f6fa;
  min-height: 100vh;
}
.myorders-wrapper {
  max-width: 950px;
  margin: 40px auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px #1976d233;
  padding: 40px 32px 32px 32px;
}
.myorders-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.myorders-title {
  color: #1976d2;
  font-size: 2.1rem;
  font-weight: 800;
}
.myorders-count {
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
}
.myorders-empty {
  text-align: center;
  margin-top: 40px;
  color: #64748b;
  font-size: 1.1rem;
}
.myorders-table-wrap {
  overflow-x: auto;
}
.myorders-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 1rem;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px #1976d211;
}
.myorders-table th, .myorders-table td {
  padding: 15px 12px;
  text-align: left;
}
.myorders-table th {
  background: linear-gradient(90deg, #e3eafc 60%, #fff 100%);
  color: #1976d2;
  font-weight: 700;
  font-size: 1.05rem;
}
.myorders-table tr {
  transition: background 0.18s;
}
.myorders-table tr:hover {
  background: #f1f5f9;
}
.myorders-money {
  color: #ff9800;
  font-weight: 700;
}
.myorders-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
}
.myorders-status-completed { background: #e0f7fa; color: #009688; }
.myorders-status-shipping { background: #fffde7; color: #fbc02d; }
.myorders-status-waiting { background: #e3fcec; color: #388e3c; }
.myorders-status-pending { background: #e3fcec; color: #388e3c; }
.myorders-status-cancelled { background: #fbe9e7; color: #d84315; }
.myorders-status-icon { font-size: 1.1em; margin-right: 2px; }
.myorders-detail-btn {
  background: linear-gradient(90deg, #1976d2 60%, #2196f3 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 22px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 8px #1976d233;
  transition: background 0.2s;
  font-size: 1rem;
}
.myorders-detail-btn:hover {
  background: #1565c0;
}
@media (max-width: 700px) {
  .myorders-wrapper { padding: 18px 2vw; }
  .myorders-title { font-size: 1.3rem; }
  .myorders-header { flex-direction: column; gap: 8px; align-items: flex-start; }
  .myorders-table th, .myorders-table td { padding: 10px 6px; font-size: 0.98rem; }
}
*/
