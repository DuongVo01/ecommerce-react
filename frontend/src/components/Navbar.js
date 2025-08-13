import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logoutUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  // Lấy thông báo từ backend
  React.useEffect(() => {
    if (user) {
      fetchNotifications();
    }
    // Lắng nghe sự kiện tạo thông báo mới từ AdminNotifications
    const handleNotificationCreated = () => {
      fetchNotifications();
    };
    window.addEventListener('notificationCreated', handleNotificationCreated);
    return () => {
      window.removeEventListener('notificationCreated', handleNotificationCreated);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(1, 20);
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
      // Fallback về dữ liệu mẫu nếu API lỗi
      const mockNotifications = [
        { id: 1, title: 'Đơn hàng #12345 đã được xác nhận', message: 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị!', timeAgo: '2 phút trước', read: false },
        { id: 2, title: 'Sản phẩm yêu thích đã có hàng trở lại', message: 'Sản phẩm "Laptop Gaming" đã có hàng trở lại. Hãy nhanh tay đặt hàng!', timeAgo: '1 giờ trước', read: false },
        { id: 3, title: 'Khuyến mãi mới: Giảm 20% cho tất cả sản phẩm', message: 'Chương trình khuyến mãi lớn nhất năm đã bắt đầu! Giảm giá 20% cho tất cả sản phẩm.', timeAgo: '3 giờ trước', read: true },
      ];
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  // Đóng dropdown thông báo khi click ra ngoài
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-item')) {
        setShowNotifications(false);
      }
      if (menuOpen && !event.target.closest('.navbar-dropdown-toggle') && !event.target.closest('.navbar-dropdown-menu')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, menuOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo:', error);
      // Fallback: cập nhật local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả thông báo:', error);
      // Fallback: cập nhật local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section với thiết kế chuyên nghiệp */}
        <div className="navbar-logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <div style={{ 
              position: 'relative',
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/logo192.png" 
                alt="ShopStore" 
                style={{ 
                  height: 40, 
                  width: 40,
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                  border: '2px solid rgba(25, 118, 210, 0.1)',
                  transition: 'all 0.3s ease'
                }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="logo-text" style={{ 
                fontWeight: 800, 
                fontSize: '24px', 
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #64b5f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.5px',
                lineHeight: 1
              }}>
                ShopStore
              </span>
              <span style={{ 
                fontSize: '10px', 
                color: '#64748b', 
                fontWeight: 500,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                Premium Shopping
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className={`navbar-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <ul className={`navbar-list${menuOpen ? ' open' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="nav-link-enhanced">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Trang chủ
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/products" className="nav-link-enhanced">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Sản phẩm
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/cart" className="nav-link-enhanced">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Giỏ hàng
            </Link>
          </li>
          {user && user.role === 'admin' && (
            <li className="navbar-item">
              <Link to="/admin" className="nav-link-enhanced admin-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Admin
              </Link>
            </li>
          )}

          {!user ? (
            <li className="navbar-item">
              <Link to="/login" className="navbar-btn login-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10,17 15,12 10,7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Đăng nhập
              </Link>
            </li>
          ) : (
            <>
              {/* Notification Section - Thiết kế chuyên nghiệp */}
              <li className="navbar-item notification-item">
                <div className="notification-btn-wrapper">
                  <button
                    className="notification-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                    aria-label="Thông báo"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className="notification-btn-icon"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && (
                      <span 
                        className="notification-badge"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Enhanced Notification Dropdown */}
                  {showNotifications && (
                    <div 
                      className="notification-dropdown"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 12px)',
                        right: 0,
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        minWidth: '380px',
                        maxHeight: '480px',
                        overflow: 'hidden',
                        zIndex: 1000,
                        animation: 'slideDown 0.2s ease-out'
                      }}
                    >
                      <div 
                        style={{
                          padding: '20px 24px 16px',
                          borderBottom: '1px solid #f1f5f9',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: '18px', 
                          fontWeight: '700', 
                          color: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                          </svg>
                          Thông báo
                          {unreadCount > 0 && (
                            <span style={{
                              background: '#3b82f6',
                              color: 'white',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {unreadCount}
                            </span>
                          )}
                        </h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#3b82f6',
                              fontSize: '14px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'none';
                            }}
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>

                      <div 
                        className="notification-list"
                        style={{
                          maxHeight: '320px',
                          overflowY: 'auto',
                          padding: '8px 0'
                        }}
                      >
                        {loading ? (
                          <div style={{
                            padding: '40px 24px',
                            textAlign: 'center',
                            color: '#64748b'
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              border: '3px solid #e2e8f0',
                              borderTop: '3px solid #3b82f6',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite',
                              margin: '0 auto 16px'
                            }}></div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                              Đang tải thông báo...
                            </p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div style={{
                            padding: '40px 24px',
                            textAlign: 'center',
                            color: '#64748b'
                          }}>
                            <svg 
                              width="48" 
                              height="48" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="1.5"
                              style={{ marginBottom: '16px', opacity: 0.5 }}
                            >
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                              Không có thông báo mới
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.8 }}>
                              Các thông báo mới sẽ xuất hiện ở đây
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification, index) => (
                            <div
                              key={notification.id}
                              className={`notification-item ${!notification.read ? 'unread' : ''}`}
                              onClick={() => markAsRead(notification._id)}
                              style={{
                                padding: '16px 24px',
                                borderBottom: index < notifications.length - 1 ? '1px solid #f8fafc' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: notification.read ? 'white' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                borderLeft: notification.read ? 'none' : '4px solid #3b82f6',
                                position: 'relative'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = notification.read 
                                  ? '#f8fafc' 
                                  : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = notification.read 
                                  ? 'white' 
                                  : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                  <h5 style={{ 
                                    margin: '0 0 6px 0', 
                                    fontSize: '15px', 
                                    fontWeight: '600',
                                    color: notification.read ? '#64748b' : '#1e293b',
                                    lineHeight: '1.3'
                                  }}>
                                    {notification.title}
                                  </h5>
                                  <p style={{ 
                                    margin: '0 0 8px 0', 
                                    fontSize: '13px', 
                                    color: notification.read ? '#94a3b8' : '#475569',
                                    lineHeight: '1.4'
                                  }}>
                                    {notification.message}
                                  </p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                      fontSize: '12px',
                                      color: '#94a3b8',
                                      fontWeight: '500'
                                    }}>
                                      {notification.timeAgo}
                                    </span>
                                    {!notification.read && (
                                      <span style={{
                                        background: '#3b82f6',
                                        color: 'white',
                                        fontSize: '10px',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                      }}>
                                        MỚI
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {!notification.read && (
                                  <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    flexShrink: 0,
                                    marginTop: '4px',
                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                                  }}/>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div style={{
                          padding: '16px 24px',
                          borderTop: '1px solid #f1f5f9',
                          background: '#fafbfc',
                          textAlign: 'center'
                        }}>
                          <Link 
                            to="/notifications" 
                            onClick={() => setShowNotifications(false)}
                            style={{
                              color: '#3b82f6',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '600',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease',
                              display: 'inline-block'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'none';
                            }}
                          >
                            Xem tất cả thông báo →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>

              {/* Enhanced User Dropdown */}
              <li className="navbar-item navbar-dropdown">
                <button 
                  className="navbar-dropdown-toggle" 
                  onClick={() => setMenuOpen(!menuOpen)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    borderRadius: '16px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08)'
                  }}
                >
                  <img
                    src={user.avatar 
                      ? (user.avatar.startsWith('http') 
                        ? user.avatar 
                        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.avatar}`) 
                      : '/default-avatar.png'
                    }
                    alt="Avatar"
                    style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '12px', 
                      objectFit: 'cover', 
                      border: '2px solid rgba(59, 130, 246, 0.2)',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#1e293b', 
                      fontSize: '15px',
                      lineHeight: '1.2'
                    }}>
                      {user.username || user.email}
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 Khách hàng'}
                    </span>
                  </div>
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ 
                      color: '#64748b',
                      transition: 'transform 0.2s ease',
                      transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </button>
                
                {menuOpen && (
                  <ul className="navbar-dropdown-menu" style={{
                    background: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    padding: '8px',
                    minWidth: '220px'
                  }}>
                    <li>
                      <Link 
                        to="/account" 
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Tài khoản của tôi
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/my-orders" 
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                        </svg>
                        Đơn mua của tôi
                      </Link>
                    </li>
                    <li style={{ margin: '8px 0' }}>
                      <div style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)',
                        margin: '0 16px'
                      }}></div>
                    </li>
                    <li>
                      <button 
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                          color: '#dc2626',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          width: '100%',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16,17 21,12 16,7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Inline styles for enhanced components */}
      <style>{`
        .nav-link-enhanced {
          display: flex !important;
          align-items: center;
          color: #374151;
          text-decoration: none;
          font-size: 15px;
          padding: 12px 18px;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .nav-link-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 12px;
        }

        .nav-link-enhanced:hover::before {
          opacity: 1;
        }

        .nav-link-enhanced:hover {
          color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .admin-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          color: white !important;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .admin-badge::before {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 100%) !important;
        }

        .admin-badge:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
          color: white !important;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-list::-webkit-scrollbar {
          width: 6px;
        }

        .notification-list::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 3px;
        }

        .notification-list::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
          border-radius: 3px;
        }

        .notification-list::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
        }

        @media (max-width: 768px) {
          .notification-dropdown {
            position: fixed !important;
            top: 70px !important;
            left: 16px !important;
            right: 16px !important;
            min-width: auto !important;
            max-width: none !important;
          }

          .navbar-dropdown-menu {
            position: fixed !important;
            top: 70px !important;
            right: 16px !important;
            left: auto !important;
            min-width: 200px !important;
          }

          .nav-link-enhanced {
            padding: 14px 20px;
            font-size: 16px;
            justify-content: flex-start;
          }

          .navbar-logo .logo-text {
            font-size: 20px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;