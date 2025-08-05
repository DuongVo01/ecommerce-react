
import React, { useEffect, useState, useContext } from 'react';
import './AdminCategories.css';
import { FaBoxOpen, FaSearch, FaSignOutAlt, FaHome, FaShoppingCart, FaHeadset, FaListAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { useToast } from '../ToastContext';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button
} from '@mui/material';

const API = 'http://localhost:5000/api/categories';

const AdminCategories = () => {
  const { showToast } = useToast();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', image: null });
  const [editId, setEditId] = useState(null);
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
        setCategories(res.data);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

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
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await axios.delete(`${API}/${id}`);
      showToast('Xóa danh mục thành công!', 'success');
      axios.get(API)
        .then(res => setCategories(res.data))
        .catch(() => {});
    } catch {
      showToast('Lỗi khi xóa danh mục', 'error');
    }
  };

  if (loading) return <div>Đang tải danh mục...</div>;

  return (
    <div style={{ background: '#f6f8fa', minHeight: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#fff', boxShadow: '0 2px 12px #0001', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo192.png" alt="ShopStore" style={{ width: 40, height: 40, borderRadius: 8, boxShadow: '0 2px 8px #1976d233' }} />
          <span style={{ fontWeight: 700, fontSize: 22, color: '#1976d2', letterSpacing: 1 }}>ShopStore Admin</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaHome /> Trang chủ</button>
          <button onClick={() => navigate('/admin/products')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaBoxOpen /> Sản phẩm</button>
          <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: '#d32f2f', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaShoppingCart /> Đơn hàng</button>
          <button onClick={() => navigate('/admin/categories')} style={{ background: 'none', border: 'none', color: '#388e3c', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaListAlt /> Danh mục</button>
          <button onClick={() => navigate('/admin/users')} style={{ background: 'none', border: 'none', color: '#d32f2f', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaUser /> Người dùng</button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="admin-search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f6f8fa', borderRadius: 8, padding: '6px 12px', boxShadow: '0 1px 4px #0001', minWidth: 180 }}>
            <FaSearch style={{ color: '#388e3c', fontSize: 18, marginRight: 6 }} />
            <input type="text" placeholder="Tìm danh mục..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 15, width: 120 }} />
          </div>
          <button style={{ background: 'none', border: 'none', color: '#ff9800', fontSize: 22, cursor: 'pointer' }} title="Hỗ trợ khách hàng"><FaHeadset /></button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#d32f2f', fontSize: 22, cursor: 'pointer' }} title="Đăng xuất"><FaSignOutAlt /></button>
        </div>
      </header>
      {/* Banner */}
      <section style={{ width: '100%', background: 'linear-gradient(90deg, #388e3c 60%, #ff9800 100%)', borderRadius: 0, margin: '0 0 32px 0', boxShadow: '0 4px 24px #388e3c33', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, width: '100%', maxWidth: 1100, padding: '32px 24px' }}>
          <FaListAlt style={{ fontSize: 72, color: '#fff', background: '#388e3c', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: 12 }} />
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 36, marginBottom: 10, letterSpacing: 1 }}>Quản lý danh mục</h2>
            <p style={{ color: '#fff', fontSize: 18, marginBottom: 18, fontWeight: 400 }}>Kiểm soát, cập nhật và quản lý danh mục sản phẩm một cách chuyên nghiệp.</p>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 600, marginBottom: 10 }}>
              Tổng số danh mục: {categories.length}
            </div>
            <button onClick={() => { setEditId(null); setForm({ name: '', image: null }); window.scrollTo({ top: 400, behavior: 'smooth' }); }} style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #ff980033', cursor: 'pointer', transition: 'background 0.2s' }}>Thêm danh mục mới</button>
          </div>
        </div>
      </section>
      {/* Form thêm/sửa danh mục */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 32, margin: '0 auto 40px', maxWidth: 700, width: '100%' }}>
        <h3 style={{ marginBottom: 24, color: '#388e3c', fontWeight: 600, fontSize: 22 }}>{editId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Tên danh mục</label>
            <input name="name" placeholder="Tên danh mục" value={form.name} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }} />
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Ảnh danh mục</label>
            <input name="image" type="file" accept="image/*" onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button type="submit" style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #388e3c33', transition: 'background 0.2s', cursor: 'pointer' }}>{editId ? 'Cập nhật' : 'Thêm mới'}</button>
            {editId && <button type="button" style={{ background: '#e3fcec', color: '#388e3c', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #388e3c33', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => { setEditId(null); setForm({ name: '', image: null }); }}>Hủy</button>}
          </div>
        </form>
      </div>
      {/* Bảng danh sách danh mục */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 32, margin: '0 auto', maxWidth: 1100, width: '100%' }}>
        <h3 style={{ marginBottom: 24, color: '#388e3c', fontWeight: 600, fontSize: 22 }}>Danh sách danh mục</h3>
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ background: '#e3fcec' }}>
                <TableCell sx={{ fontWeight: 700, color: '#388e3c' }}>Tên danh mục</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#388e3c' }}>Ảnh</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#388e3c' }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat, idx) => (
                <TableRow key={cat._id} sx={{ background: idx % 2 === 0 ? '#f6f8fa' : '#fff', transition: 'background 0.2s' }}>
                  <TableCell sx={{ fontWeight: 500 }}>{cat.name}</TableCell>
                  <TableCell>
                    {cat.image && <img src={`http://localhost:5000${cat.image}`} alt={cat.name} style={{ width: 60, borderRadius: 8, boxShadow: '0 2px 8px #0002', border: '1px solid #eee' }} />}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      onClick={() => {
                        setEditId(cat._id);
                        setForm({ name: cat.name, image: null });
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      sx={{ mr: 1 }}
                    >Sửa</Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(cat._id)}
                    >Xóa</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {/* Responsive styles moved to AdminCategories.css */}
    </div>
  );
};

export default AdminCategories;
