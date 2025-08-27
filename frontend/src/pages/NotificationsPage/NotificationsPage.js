import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications
} from '../../services/api';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData(page, limit, unreadOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, limit, unreadOnly]);

  const fetchData = async (p, l, unread) => {
    try {
      setLoading(true);
      setError('');
      const res = await getNotifications(p, l, unread);
      if (res && res.success) {
        setItems(Array.isArray(res.data) ? res.data : []);
        setTotal(res.pagination?.total || 0);
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (e) {
      setError('Không thể tải thông báo');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const onMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setItems(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
    } catch (e) {
      // Fallback optimistic update
      setItems(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
    }
  };

  const onMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (e) {
      // ignore
    } finally {
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Xóa thông báo này?')) return;
    try {
      await deleteNotification(id);
      setItems(prev => prev.filter(n => (n._id || n.id) !== id));
    } catch (e) {
      // ignore
    }
  };

  const onDeleteRead = async () => {
    if (!window.confirm('Xóa tất cả thông báo đã đọc?')) return;
    try {
      await deleteReadNotifications();
    } catch (e) {
      // ignore
    } finally {
      setItems(prev => prev.filter(n => !n.read));
    }
  };

  const totalPages = Math.max(1, Math.ceil((total || items.length) / limit));
  const unreadCount = items.filter(n => !n.read).length;

  if (user === undefined) return <div style={{ padding: 20 }}>Đang tải...</div>;
  if (!user) return null;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Thông báo của tôi</h1>
        <div className="header-actions">
          <button className="btn" onClick={onMarkAllRead} disabled={items.length === 0 || unreadCount === 0}>Đánh dấu tất cả đã đọc</button>
          <button className="btn danger" onClick={onDeleteRead} disabled={items.length === 0 || unreadCount === items.length}>Xóa đã đọc</button>
          <label className="toggle">
            <input type="checkbox" checked={unreadOnly} onChange={(e) => { setPage(1); setUnreadOnly(e.target.checked); }} />
            <span>Chỉ hiển thị chưa đọc</span>
          </label>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="empty">Không có thông báo</div>
      ) : (
        <div className="notification-list">
          {items.map((n) => {
            const id = n._id || n.id;
            return (
              <div key={id} className={`notification-card${n.read ? '' : ' unread'}`}>
                <div className="notification-main" onClick={() => !n.read && onMarkRead(id)}>
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-message">{n.message}</div>
                  <div className="notification-meta">
                    <span className="time">{n.timeAgo || new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                    {!n.read && <span className="badge">MỚI</span>}
                    {n.type && <span className={`type ${n.type}`}>{n.type}</span>}
                  </div>
                </div>
                <div className="notification-actions">
                  {!n.read && <button className="btn small" onClick={() => onMarkRead(id)}>Đã đọc</button>}
                  <button className="btn small danger" onClick={() => onDelete(id)}>Xóa</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pagination">
        <button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Trang trước</button>
        <span className="page-info">Trang {page} / {totalPages}</span>
        <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Trang sau</button>
      </div>
    </div>
  );
};

export default NotificationsPage;


