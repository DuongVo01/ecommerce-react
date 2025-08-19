
import React, { useEffect, useState, useContext } from 'react';
import './AdminUsers.css';
import { FaUser, FaSearch, FaSignOutAlt, FaHome, FaShoppingCart, FaHeadset, FaBoxOpen, FaListAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import { useToast } from '../../ToastContext';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const API = 'http://localhost:5000/api/auth/users';

const AdminUsers = () => {
  const { showToast } = useToast();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
    const token = localStorage.getItem('token');
    axios.get(API, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (user === undefined) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user || user.role !== 'admin') return null;

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await axios.delete(`${API}/${id}`);
      showToast('Xóa người dùng thành công!', 'success');
      axios.get(API)
        .then(res => setUsers(res.data))
        .catch(() => {});
    } catch {
      showToast('Lỗi khi xóa người dùng', 'error');
    }
  };

  if (loading) return <div>Đang tải người dùng...</div>;

  return (
    <div style={{ background: '#f6f8fa', minHeight: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      {/* Header */}
      <header className="admin-users-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo192.png" alt="ShopStore" style={{ width: 40, height: 40, borderRadius: 8, boxShadow: '0 2px 8px #1976d233' }} />
          <span style={{ fontWeight: 700, fontSize: 22, color: '#d32f2f', letterSpacing: 1 }}>ShopStore Admin</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaHome /> Trang chủ</button>
          <button onClick={() => navigate('/admin/products')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaBoxOpen /> Sản phẩm</button>
          <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaShoppingCart /> Đơn hàng</button>
          <button onClick={() => navigate('/admin/categories')} style={{ background: 'none', border: 'none', color: '#388e3c', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaListAlt /> Danh mục</button>
          <button onClick={() => navigate('/admin/users')} style={{ background: 'none', border: 'none', color: '#d32f2f', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaUser /> Người dùng</button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="admin-search-bar">
            <FaSearch style={{ color: '#d32f2f', fontSize: 18, marginRight: 6 }} />
            <input type="text" placeholder="Tìm người dùng..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 15, width: 120 }} />
          </div>
          <button style={{ background: 'none', border: 'none', color: '#ff9800', fontSize: 22, cursor: 'pointer' }} title="Hỗ trợ khách hàng"><FaHeadset /></button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#d32f2f', fontSize: 22, cursor: 'pointer' }} title="Đăng xuất"><FaSignOutAlt /></button>
        </div>
      </header>
      {/* Banner */}
      <section style={{ width: '100%', background: 'linear-gradient(90deg, #d32f2f 60%, #ff9800 100%)', borderRadius: 0, margin: '0 0 32px 0', boxShadow: '0 4px 24px #d32f2f33', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, width: '100%', maxWidth: 1100, padding: '32px 24px' }}>
          <FaUser style={{ fontSize: 72, color: '#fff', background: '#d32f2f', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: 12 }} />
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 36, marginBottom: 10, letterSpacing: 1 }}>Quản lý người dùng</h2>
            <p style={{ color: '#fff', fontSize: 18, marginBottom: 8, fontWeight: 400 }}>Kiểm soát, cập nhật và quản lý người dùng của hệ thống một cách chuyên nghiệp.</p>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 600, marginBottom: 10 }}>
              Tổng số người dùng: {users.length}
            </div>
          </div>
        </div>
      </section>
      {/* Bảng danh sách người dùng */}
      <div className="admin-table-container">
        <h3 className="admin-table-title">Danh sách người dùng</h3>
        <TableContainer component={Paper} className="admin-table-paper">
          <Table className="admin-table" aria-label="user table">
            <TableHead>
              <TableRow className="admin-table-header-row">
                <TableCell className="admin-table-header-cell" align="center">Avatar</TableCell>
                <TableCell className="admin-table-header-cell" align="center">Username</TableCell>
                <TableCell className="admin-table-header-cell" align="center">Tên</TableCell>
                <TableCell className="admin-table-header-cell" align="center">Email</TableCell>
                <TableCell className="admin-table-header-cell" align="center">Số điện thoại</TableCell>
                <TableCell className="admin-table-header-cell" align="center">Giới tính</TableCell>
                <TableCell className="admin-table-header-cell" align="center">Ngày sinh</TableCell>
                <TableCell className="admin-table-header-cell" align="center">Role</TableCell>
                <TableCell className="admin-table-header-cell" align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, idx) => {
                let avatarUrl = user.avatar;
                if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
                  avatarUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${avatarUrl}`;
                }
                return (
                  <TableRow key={user._id} className={idx % 2 === 0 ? 'admin-table-row-even' : 'admin-table-row-odd'}>
                    <TableCell align="center" className="admin-table-cell">
                      <img src={avatarUrl || '/default-avatar.png'} alt="avatar" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px #1976d211', border: '2px solid #e3eafc' }} />
                    </TableCell>
                    <TableCell align="center" className="admin-table-cell">{user.username}</TableCell>
                    <TableCell align="center" className="admin-table-cell">{user.name || '-'}</TableCell>
                    <TableCell align="center" className="admin-table-cell">{user.email}</TableCell>
                    <TableCell align="center" className="admin-table-cell">{user.phone || '-'}</TableCell>
                    <TableCell align="center" className="admin-table-cell">{user.gender || '-'}</TableCell>
                    <TableCell align="center" className="admin-table-cell">{user.birthday ? new Date(user.birthday).toLocaleDateString() : '-'}</TableCell>
                    <TableCell align="center" className="admin-table-cell">{user.role}</TableCell>
                    <TableCell align="center" className="admin-table-cell">
                      <button onClick={() => handleDelete(user._id)} className="admin-table-delete-btn" title="Xóa"><span role="img" aria-label="delete">🗑️</span></button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {/* Responsive styles moved to AdminUsers.css */}
    </div>
  );
};

export default AdminUsers;
