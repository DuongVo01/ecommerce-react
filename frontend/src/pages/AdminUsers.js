
import React, { useEffect, useState, useContext } from 'react';
import { FaUser, FaSearch, FaSignOutAlt, FaHome, FaShoppingCart, FaHeadset, FaBoxOpen, FaListAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { useToast } from '../ToastContext';
import axios from 'axios';

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
    axios.get(API)
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
      <header style={{ background: '#fff', boxShadow: '0 2px 12px #0001', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, position: 'sticky', top: 0, zIndex: 10 }}>
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
          <div className="admin-search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f6f8fa', borderRadius: 8, padding: '6px 12px', boxShadow: '0 1px 4px #0001', minWidth: 180 }}>
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
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 32, margin: '0 auto', maxWidth: 1100, width: '100%' }}>
        <h3 style={{ marginBottom: 24, color: '#d32f2f', fontWeight: 600, fontSize: 22 }}>Danh sách người dùng</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#fdecea', color: '#d32f2f', fontWeight: 600 }}>
                <th style={{ padding: 14, borderBottom: '2px solid #d32f2f', borderTopLeftRadius: 12 }}>Username</th>
                <th style={{ padding: 14, borderBottom: '2px solid #d32f2f' }}>Tên</th>
                <th style={{ padding: 14, borderBottom: '2px solid #d32f2f' }}>Email</th>
                <th style={{ padding: 14, borderBottom: '2px solid #d32f2f' }}>Số điện thoại</th>
                <th style={{ padding: 14, borderBottom: '2px solid #d32f2f' }}>Giới tính</th>
                <th style={{ padding: 14, borderBottom: '2px solid #d32f2f' }}>Ngày sinh</th>
                <th style={{ padding: 14, borderBottom: '2px solid #d32f2f' }}>Role</th>
                <th style={{ padding: 14, borderBottom: '2px solid #d32f2f', borderTopRightRadius: 12 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id} style={{ background: idx % 2 === 0 ? '#f6f8fa' : '#fff', transition: 'background 0.2s', borderBottom: '1px solid #fdecea', borderRadius: 8, boxShadow: '0 1px 4px #0001' }}>
                  <td style={{ padding: 12, fontWeight: 500, maxWidth: 180, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{user.username}</td>
                  <td style={{ padding: 12 }}>{user.name || '-'}</td>
                  <td style={{ padding: 12 }}>{user.email}</td>
                  <td style={{ padding: 12 }}>{user.phone || '-'}</td>
                  <td style={{ padding: 12 }}>{user.gender || '-'}</td>
                  <td style={{ padding: 12 }}>{user.birthday ? new Date(user.birthday).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: 12 }}>{user.role}</td>
                  <td style={{ padding: 12, height: 72, position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
                      <button onClick={() => handleDelete(user._id)} style={{ background: '#fdecea', color: '#d32f2f', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #d32f2f33', transition: 'background 0.2s' }} title="Xóa"><span role="img" aria-label="delete">🗑️</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        @media (max-width: 1100px) {
          header { padding: 0 12px !important; }
          section { padding: 0 !important; }
        }
        @media (max-width: 900px) {
          section { min-height: 80px !important; }
          h2 { font-size: 18px !important; }
          .admin-products-form, .admin-products-table { padding: 4px !important; }
          table { font-size: 12px !important; }
          th, td { padding: 6px !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;
