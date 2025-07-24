import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { useToast } from '../ToastContext';
import axios from 'axios';

const API = 'http://localhost:5000/api/auth/users';

const AdminUsers = () => {
  const { showToast } = useToast();
  const { user } = React.useContext(UserContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return; // Đợi user xác định
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

  if (user === undefined) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user || user.role !== 'admin') return null;

  const handleDelete = async id => {
    if (window.confirm('Bạn có chắc muốn xóa user này?')) {
      try {
        await axios.delete(`${API}/${id}`);
        showToast('Xóa người dùng thành công!', 'success');
        axios.get(API)
          .then(res => setUsers(res.data))
          .catch(() => {});
      } catch {
        showToast('Lỗi khi xóa người dùng', 'error');
      }
    }
  };

  if (loading) return <div>Đang tải người dùng...</div>;

  return (
    <div style={{ padding: 32, background: '#f6f8fa', minHeight: '100vh' }}>
      <h2 style={{ color: '#d32f2f', marginBottom: 24 }}>Quản lý người dùng</h2>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Danh sách người dùng</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#fdecea' }}>
                <th style={{ padding: 12, borderBottom: '2px solid #d32f2f' }}>Username</th>
                <th style={{ padding: 12, borderBottom: '2px solid #d32f2f' }}>Email</th>
                <th style={{ padding: 12, borderBottom: '2px solid #d32f2f' }}>Role</th>
                <th style={{ padding: 12, borderBottom: '2px solid #d32f2f' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                  <td style={{ padding: 10 }}>{user.username}</td>
                  <td style={{ padding: 10 }}>{user.email}</td>
                  <td style={{ padding: 10 }}>{user.role}</td>
                  <td style={{ padding: 10 }}>
                    <button onClick={() => handleDelete(user._id)} style={{ background: '#fdecea', color: '#d32f2f', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }} title="Xóa"><span role="img" aria-label="delete">🗑️</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
