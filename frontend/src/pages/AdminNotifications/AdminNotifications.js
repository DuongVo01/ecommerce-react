import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [filters, setFilters] = useState({
    user: '',
    type: '',
    read: '',
    search: ''
  });

  // Form states
  const [createForm, setCreateForm] = useState({
    user: '',
    title: '',
    message: '',
    type: 'other'
  });

  const [bulkForm, setBulkForm] = useState({
    users: [],
    title: '',
    message: '',
    type: 'other'
  });

  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
    fetchNotifications();
    fetchUsers();
  }, [user, navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setNotifications(response.data.data || []);
      } else {
        console.error('Response không đúng format:', response.data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error('Response users không phải array:', response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách user:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setUsers([]);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/notifications/create', createForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setCreateForm({ user: '', title: '', message: '', type: 'other' });
        setShowCreateForm(false);
  fetchNotifications();
  // Không gọi markAsRead, thông báo sẽ ở trạng thái chưa đọc cho đến khi admin nhấn nút ✅ hoặc người dùng đọc
  alert('Đã tạo thông báo thành công!');
      } else {
        alert('Lỗi: ' + (response.data?.message || 'Không thể tạo thông báo'));
      }
    } catch (error) {
      console.error('Lỗi khi tạo thông báo:', error);
      if (error.response) {
        alert('Lỗi khi tạo thông báo: ' + (error.response.data?.message || error.message));
      } else {
        alert('Lỗi khi tạo thông báo: ' + error.message);
      }
    }
  };

  const handleBulkNotification = async (e) => {
    e.preventDefault();
    
    if (bulkForm.users.length === 0) {
      alert('Vui lòng chọn ít nhất một người dùng!');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/notifications/create-bulk', bulkForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setBulkForm({ users: [], title: '', message: '', type: 'other' });
        setShowBulkForm(false);
  fetchNotifications();
  // Phát sự kiện để Navbar cập nhật lại số lượng thông báo
  window.dispatchEvent(new Event('notificationCreated'));
        alert('Đã tạo thông báo hàng loạt thành công!');
      } else {
        alert('Lỗi: ' + (response.data?.message || 'Không thể tạo thông báo hàng loạt'));
      }
    } catch (error) {
      console.error('Lỗi khi tạo thông báo hàng loạt:', error);
      if (error.response) {
        alert('Lỗi khi tạo thông báo hàng loạt: ' + (error.response.data?.message || error.message));
      } else {
        alert('Lỗi khi tạo thông báo hàng loạt: ' + error.message);
      }
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/notifications/admin/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        fetchNotifications();
        alert('Đã xóa thông báo thành công!');
      } else {
        alert('Lỗi: ' + (response.data?.message || 'Không thể xóa thông báo'));
      }
    } catch (error) {
      console.error('Lỗi khi xóa thông báo:', error);
      if (error.response) {
        alert('Lỗi khi xóa thông báo: ' + (error.response.data?.message || error.message));
      } else {
        alert('Lỗi khi xóa thông báo: ' + error.message);
      }
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:5000/api/notifications/admin/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        fetchNotifications();
      } else {
        console.error('Lỗi khi đánh dấu đã đọc:', response.data);
      }
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filters.user && notification.user !== filters.user) return false;
    if (filters.type && notification.type !== filters.type) return false;
    if (filters.read !== '' && notification.read.toString() !== filters.read) return false;
    if (filters.search && !notification.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !notification.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'product': return '🛍️';
      case 'promotion': return '🎉';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'order': return 'Đơn hàng';
      case 'product': return 'Sản phẩm';
      case 'promotion': return 'Khuyến mãi';
      case 'system': return 'Hệ thống';
      default: return 'Khác';
    }
  };

  if (user === undefined) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-notifications-container">
      <div className="admin-notifications-header">
        <h1>Quản lý Thông báo</h1>
        <div className="admin-notifications-actions">
          <button 
            className="btn-create-notification"
            onClick={() => setShowCreateForm(true)}
          >
            ✨ Tạo thông báo mới
          </button>
          <button 
            className="btn-create-bulk-notification"
            onClick={() => setShowBulkForm(true)}
          >
            📢 Tạo thông báo hàng loạt
          </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="admin-notifications-filters">
        <div className="filter-group">
          <label>Người dùng:</label>
          <select 
            value={filters.user} 
            onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
          >
            <option value="">Tất cả</option>
            {users.map(user => (
              <option key={user.username || user.email} value={user.username || user.email}>
                {user.username || user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Loại:</label>
          <select 
            value={filters.type} 
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">Tất cả</option>
            <option value="order">Đơn hàng</option>
            <option value="product">Sản phẩm</option>
            <option value="promotion">Khuyến mãi</option>
            <option value="system">Hệ thống</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <select 
            value={filters.read} 
            onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value }))}
          >
            <option value="">Tất cả</option>
            <option value="false">Chưa đọc</option>
            <option value="true">Đã đọc</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Tìm kiếm:</label>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề hoặc nội dung..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </div>

      {/* Thống kê */}
      <div className="admin-notifications-stats">
        <div className="stat-card">
          <span className="stat-number">{notifications.length}</span>
          <span className="stat-label">Tổng thông báo</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{notifications.filter(n => !n.read).length}</span>
          <span className="stat-label">Chưa đọc</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{notifications.filter(n => n.read).length}</span>
          <span className="stat-label">Đã đọc</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{new Set(notifications.map(n => n.user)).size}</span>
          <span className="stat-label">Người dùng</span>
        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="admin-notifications-list">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="no-notifications">Không có thông báo nào phù hợp</div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {getNotificationTypeIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <div className="notification-header">
                  <h4 className="notification-title">{notification.title}</h4>
                  <span className={`notification-type ${notification.type}`}>
                    {getNotificationTypeLabel(notification.type)}
                  </span>
                </div>
                
                <p className="notification-message">{notification.message}</p>
                
                <div className="notification-meta">
                  <span className="notification-user">
                    👤 {notification.user}
                  </span>
                  <span className="notification-time">
                    🕒 {new Date(notification.createdAt).toLocaleString('vi-VN')}
                  </span>
                  <span className={`notification-status ${notification.read ? 'read' : 'unread'}`}>
                    {notification.read ? '✅ Đã đọc' : '🔴 Chưa đọc'}
                  </span>
                </div>

                {notification.data && Object.keys(notification.data).length > 0 && (
                  <div className="notification-data">
                    <strong>Dữ liệu bổ sung:</strong>
                    <pre>{JSON.stringify(notification.data, null, 2)}</pre>
                  </div>
                )}
              </div>

              <div className="notification-actions">
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteNotification(notification._id)}
                  title="Xóa thông báo"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal tạo thông báo mới */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Tạo thông báo mới</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateNotification}>
              <div className="form-group">
                <label>Người dùng:</label>
                <select
                  value={createForm.user}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, user: e.target.value }))}
                  required
                >
                  <option value="">Chọn người dùng</option>
                  {users.map(user => {
                    const displayName = user.name?.trim() ? user.name : (user.username || user.email);
                    return (
                      <option key={user.username || user.email} value={user.username || user.email}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tiêu đề thông báo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nội dung:</label>
                <textarea
                  value={createForm.message}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Nhập nội dung thông báo"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Loại:</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="order">Đơn hàng</option>
                  <option value="product">Sản phẩm</option>
                  <option value="promotion">Khuyến mãi</option>
                  <option value="system">Hệ thống</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">Tạo thông báo</button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowCreateForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal tạo thông báo hàng loạt */}
      {showBulkForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Tạo thông báo hàng loạt</h3>
              <button 
                className="modal-close"
                onClick={() => setShowBulkForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleBulkNotification}>
              <div className="form-group">
                <label>Người dùng:</label>
                <div className="user-selection">
                  <button
                    type="button"
                    className="btn-select-all"
                    onClick={() => setBulkForm(prev => ({ 
                      ...prev, 
                      users: users.map(u => u.username || u.email) 
                    }))}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    className="btn-clear-all"
                    onClick={() => setBulkForm(prev => ({ ...prev, users: [] }))}
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
                <div className="user-checkboxes">
                  {users.map(user => (
                    <label key={user.username || user.email} className="user-checkbox">
                      <input
                        type="checkbox"
                        checked={bulkForm.users.includes(user.username || user.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkForm(prev => ({
                              ...prev,
                              users: [...prev.users, user.username || user.email]
                            }));
                          } else {
                            setBulkForm(prev => ({
                              ...prev,
                              users: prev.users.filter(u => u !== (user.username || user.email))
                            }));
                          }
                        }}
                      />
                      {user.username || user.email}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  value={bulkForm.title}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tiêu đề thông báo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nội dung:</label>
                <textarea
                  value={bulkForm.message}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Nhập nội dung thông báo"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Loại:</label>
                <select
                  value={bulkForm.type}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="order">Đơn hàng</option>
                  <option value="product">Sản phẩm</option>
                  <option value="promotion">Khuyến mãi</option>
                  <option value="system">Hệ thống</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">Tạo thông báo hàng loạt</button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowBulkForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
