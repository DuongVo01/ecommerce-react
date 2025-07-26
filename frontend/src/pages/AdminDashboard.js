import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { fetchProducts } from '../services/api';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, categories: 0, users: 0, orders: 0 });
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
    axios.get('http://localhost:5000/api/auth/users')
      .then(res => setStats(prev => ({ ...prev, users: res.data.length })))
      .catch(() => {});
    // Lấy tổng số đơn hàng
    axios.get('http://localhost:5000/api/orders/admin')
      .then(res => setStats(prev => ({ ...prev, orders: res.data.length })))
      .catch(() => {});
  }, []);

  if (user === undefined) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ padding: 32, background: '#f6f8fa', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: 24, color: '#1976d2' }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 32, color: '#1976d2', marginBottom: 8 }}>📦</span>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Sản phẩm</div>
          <div style={{ fontSize: 28, color: '#333', margin: '8px 0' }}>{loadingStats ? '...' : stats.products}</div>
          <Link to="/admin/products" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}>Quản lý sản phẩm</Link>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 32, color: '#388e3c', marginBottom: 8 }}>🗂️</span>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Danh mục</div>
          <div style={{ fontSize: 28, color: '#333', margin: '8px 0' }}>{loadingStats ? '...' : stats.categories}</div>
          <Link to="/admin/categories" style={{ color: '#388e3c', textDecoration: 'none', fontWeight: 500 }}>Quản lý danh mục</Link>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 32, color: '#f57c00', marginBottom: 8 }}>🧾</span>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Đơn hàng</div>
          <div style={{ fontSize: 28, color: '#333', margin: '8px 0' }}>{loadingStats ? '...' : stats.orders}</div>
          <Link to="/admin/orders" style={{ color: '#f57c00', textDecoration: 'none', fontWeight: 500 }}>Quản lý đơn hàng</Link>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 32, color: '#d32f2f', marginBottom: 8 }}>👤</span>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Người dùng</div>
          <div style={{ fontSize: 28, color: '#333', margin: '8px 0' }}>{loadingStats ? '...' : stats.users}</div>
          <Link to="/admin/users" style={{ color: '#d32f2f', textDecoration: 'none', fontWeight: 500 }}>Quản lý người dùng</Link>
        </div>
      </div>
      {/* Có thể bổ sung thêm widget/thống kê khác tại đây */}
    </div>
  );
};

export default AdminDashboard;
