import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { fetchProducts } from '../services/api';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, categories: 0, users: 0, orders: 0, notifications: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Lấy tổng số sản phẩm
    fetchProducts()
      .then(res => {
        setStats(prev => ({ ...prev, products: res.data.length }));
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));
    // Lấy tổng số danh mục
    axios.get('http://localhost:5000/api/categories')
      .then(res => setStats(prev => ({ ...prev, categories: res.data.length })))
      .catch(() => {});
    // Lấy tổng số người dùng
    const tokenUser = localStorage.getItem('token');
    if (tokenUser) {
      axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${tokenUser}` }
      })
        .then(res => setStats(prev => ({ ...prev, users: res.data.length })))
        .catch(() => {});
    }
    // Lấy tổng số đơn hàng
    axios.get('http://localhost:5000/api/orders/admin')
      .then(res => setStats(prev => ({ ...prev, orders: res.data.length })))
      .catch(() => {});
    // Lấy tổng số thông báo
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/notifications/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setStats(prev => ({ ...prev, notifications: res.data.data?.length || 0 })))
      .catch(() => {});
    }
  }, []);


  // Banner state for dashboard card
  const [banners, setBanners] = useState([]);
  // Báo cáo đánh giá
  const [reportCount, setReportCount] = useState(0);

  // Fetch số lượng báo cáo đánh giá
  useEffect(() => {
    axios.get('http://localhost:5000/api/reports')
      .then(res => setReportCount(res.data.length))
      .catch(() => setReportCount(0));
  }, []);

  // Fetch banners (for count only)
  useEffect(() => {
    axios.get('http://localhost:5000/api/banners')
      .then(res => setBanners(res.data))
      .catch(() => setBanners([]));
  }, []);

  if (user === undefined) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-dashboard-title">Admin Dashboard</h1>
      <div className="admin-dashboard-grid">
        <Link to="/admin/reports" className="admin-dashboard-card" style={{textDecoration:'none',color:'inherit'}}>
          <span className="admin-dashboard-icon admin-dashboard-reports" style={{fontSize:28}}>🚩</span>
          <div className="admin-dashboard-label">Báo cáo đánh giá</div>
          <div className="admin-dashboard-value">{reportCount}</div>
        </Link>
        <Link to="/admin/banners" className="admin-dashboard-card" style={{textDecoration:'none',color:'inherit'}}>
          <span className="admin-dashboard-icon admin-dashboard-banners" style={{fontSize:28}}>🖼️</span>
          <div className="admin-dashboard-label">Banner trang chủ</div>
          <div className="admin-dashboard-value">{banners.length}</div>
          {/* <div className="admin-dashboard-link banners">Quản lý Banner</div> */}
        </Link>
        <Link to="/admin/notifications" className="admin-dashboard-card" style={{textDecoration:'none',color:'inherit'}}>
          <span className="admin-dashboard-icon admin-dashboard-notifications" style={{fontSize:28}}>🔔</span>
          <div className="admin-dashboard-label">Thông báo</div>
          <div className="admin-dashboard-value">{loadingStats ? '...' : stats.notifications}</div>
        </Link>
        <Link to="/admin/products" className="admin-dashboard-card" style={{textDecoration:'none',color:'inherit'}}>
          <span className="admin-dashboard-icon admin-dashboard-products">📦</span>
          <div className="admin-dashboard-label">Sản phẩm</div>
          <div className="admin-dashboard-value">{loadingStats ? '...' : stats.products}</div>
          {/* <div className="admin-dashboard-link products">Quản lý sản phẩm</div> */}
        </Link>
        <Link to="/admin/categories" className="admin-dashboard-card" style={{textDecoration:'none',color:'inherit'}}>
          <span className="admin-dashboard-icon admin-dashboard-categories">🗂️</span>
          <div className="admin-dashboard-label">Danh mục</div>
          <div className="admin-dashboard-value">{loadingStats ? '...' : stats.categories}</div>
          {/* <div className="admin-dashboard-link categories">Quản lý danh mục</div> */}
        </Link>
        <Link to="/admin/orders" className="admin-dashboard-card" style={{textDecoration:'none',color:'inherit'}}>
          <span className="admin-dashboard-icon admin-dashboard-orders">🧾</span>
          <div className="admin-dashboard-label">Đơn hàng</div>
          <div className="admin-dashboard-value">{loadingStats ? '...' : stats.orders}</div>
          {/* <div className="admin-dashboard-link orders">Quản lý đơn hàng</div> */}
        </Link>
        <Link to="/admin/users" className="admin-dashboard-card" style={{textDecoration:'none',color:'inherit'}}>
          <span className="admin-dashboard-icon admin-dashboard-users">👤</span>
          <div className="admin-dashboard-label">Người dùng</div>
          <div className="admin-dashboard-value">{loadingStats ? '...' : stats.users}</div>
          {/* <div className="admin-dashboard-link users">Quản lý người dùng</div> */}
        </Link>
      </div>
      {/* Có thể bổ sung thêm widget/thống kê khác tại đây */}
    </div>
  );
};

export default AdminDashboard;
