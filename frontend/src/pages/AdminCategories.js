import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { useToast } from '../ToastContext';
import axios from 'axios';

const API = 'http://localhost:5000/api/categories';

const AdminCategories = () => {
  const { showToast } = useToast();
  const { user } = React.useContext(UserContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', image: null });
  const [editId, setEditId] = useState(null);
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
        setCategories(res.data);
        setLoading(false);
      });
  }, [user, navigate]);

  if (user === undefined) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user || user.role !== 'admin') return null;

  const handleChange = e => {
    if (e.target.name === 'image') {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    if (form.image) formData.append('image', form.image);
    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Cập nhật danh mục thành công!', 'success');
      } else {
        await axios.post(API, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Thêm danh mục thành công!', 'success');
      }
      // Reload categories list
      axios.get(API)
        .then(res => setCategories(res.data))
        .catch(() => {});
      setEditId(null);
      setForm({ name: '', image: null });
    } catch {
      showToast('Lỗi khi lưu danh mục', 'error');
    }
  };

  const handleEdit = cat => {
    setEditId(cat._id);
    setForm({ name: cat.name, image: null });
  };

  const handleDelete = async id => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await axios.delete(`${API}/${id}`);
        showToast('Xóa danh mục thành công!', 'success');
        axios.get(API)
          .then(res => setCategories(res.data))
          .catch(() => {});
      } catch {
        showToast('Lỗi khi xóa danh mục', 'error');
      }
    }
  };

  if (loading) return <div>Đang tải danh mục...</div>;

  return (
    <div style={{ padding: 32, background: '#f6f8fa', minHeight: '100vh' }}>
      <h2 style={{ color: '#388e3c', marginBottom: 24 }}>Quản lý danh mục</h2>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24, marginBottom: 32, maxWidth: 500 }}>
        <h3 style={{ marginBottom: 16 }}>{editId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'grid', gap: 16 }}>
          <input name="name" placeholder="Tên danh mục" value={form.name} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
          <input name="image" type="file" accept="image/*" onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 500 }}>{editId ? 'Cập nhật' : 'Thêm mới'}</button>
            {editId && <button type="button" style={{ background: '#ccc', color: '#333', border: 'none', borderRadius: 6, padding: '8px 16px' }} onClick={() => { setEditId(null); setForm({ name: '', image: null }); }}>Hủy</button>}
          </div>
        </form>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Danh sách danh mục</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#e3fcec' }}>
                <th style={{ padding: 12, borderBottom: '2px solid #388e3c' }}>Tên</th>
                <th style={{ padding: 12, borderBottom: '2px solid #388e3c' }}>Ảnh</th>
                <th style={{ padding: 12, borderBottom: '2px solid #388e3c' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                  <td style={{ padding: 10 }}>{cat.name}</td>
                  <td style={{ padding: 10 }}>
                    <img src={cat.image ? `http://localhost:5000${cat.image}` : ''} alt={cat.name} style={{ width: 60, borderRadius: 8, boxShadow: '0 1px 4px #0002' }} />
                  </td>
                  <td style={{ padding: 10 }}>
                    <button onClick={() => handleEdit(cat)} style={{ background: '#e3fcec', color: '#388e3c', border: 'none', borderRadius: 6, padding: '6px 12px', marginRight: 8, cursor: 'pointer', fontWeight: 500 }} title="Sửa"><span role="img" aria-label="edit">✏️</span></button>
                    <button onClick={() => handleDelete(cat._id)} style={{ background: '#fdecea', color: '#d32f2f', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }} title="Xóa"><span role="img" aria-label="delete">🗑️</span></button>
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

export default AdminCategories;
