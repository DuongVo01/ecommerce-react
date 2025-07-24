import React, { useEffect, useState, useContext } from 'react';
import { FaBoxOpen, FaSearch, FaSignOutAlt, FaHome, FaShoppingCart, FaHeadset } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { useToast } from '../ToastContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCategories } from '../services/api';


const AdminProducts = () => {
  // Hooks & logic đặt đúng vị trí
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', image: null, stock: '', oldImage: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (user === undefined) return; // Đợi user xác định
    if (!user || user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
    fetchProducts()
      .then(res => {
        setProducts(res.data);
      });
    fetchCategories()
      .then(res => {
        setCategories(res.data);
      });
  }, [user, navigate]);

  // Header navigation
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChange = e => {
    if (e.target.name === 'image') {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'image') {
          if (form.image) formData.append('image', form.image);
        } else if (key !== 'oldImage') {
          formData.append(key, value);
        }
      });
      if (editId && !form.image && form.oldImage) {
        formData.append('oldImage', form.oldImage);
      }
      if (editId) {
        await updateProduct(editId, formData);
        showToast('Cập nhật sản phẩm thành công!', 'success');
      } else {
        await createProduct(formData);
        showToast('Thêm sản phẩm thành công!', 'success');
      }
      fetchProducts()
        .then(res => setProducts(res.data));
      setEditId(null);
      setForm({ name: '', price: '', category: '', description: '', image: null, stock: '', oldImage: '' });
    } catch {
      showToast('Lỗi khi lưu sản phẩm', 'error');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id);
      showToast('Xóa sản phẩm thành công!', 'success');
      fetchProducts()
        .then(res => setProducts(res.data));
    } catch {
      showToast('Lỗi khi xóa sản phẩm', 'error');
    }
  };

  // --- RETURN JSX ---
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
          <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaShoppingCart /> Đơn hàng</button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="admin-search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f6f8fa', borderRadius: 8, padding: '6px 12px', boxShadow: '0 1px 4px #0001', minWidth: 180 }}>
            <FaSearch style={{ color: '#1976d2', fontSize: 18, marginRight: 6 }} />
            <input type="text" placeholder="Tìm sản phẩm..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 15, width: 120 }} />
          </div>
          <button style={{ background: 'none', border: 'none', color: '#ff9800', fontSize: 22, cursor: 'pointer' }} title="Hỗ trợ khách hàng"><FaHeadset /></button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#d32f2f', fontSize: 22, cursor: 'pointer' }} title="Đăng xuất"><FaSignOutAlt /></button>
        </div>
      </header>
      {/* Banner */}
      <section style={{ width: '100%', background: 'linear-gradient(90deg, #1976d2 60%, #ff9800 100%)', borderRadius: 0, margin: '0 0 32px 0', boxShadow: '0 4px 24px #1976d233', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, width: '100%', maxWidth: 1100, padding: '32px 24px' }}>
          <FaBoxOpen style={{ fontSize: 72, color: '#fff', background: '#1976d2', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: 12 }} />
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 36, marginBottom: 10, letterSpacing: 1 }}>Quản lý sản phẩm</h2>
            <p style={{ color: '#fff', fontSize: 18, marginBottom: 18, fontWeight: 400 }}>Kiểm soát, cập nhật và quản lý sản phẩm của cửa hàng một cách chuyên nghiệp.</p>
            <button onClick={() => { setEditId(null); setForm({ name: '', price: '', category: '', description: '', image: null, stock: '', oldImage: '' }); window.scrollTo({ top: 400, behavior: 'smooth' }); }} style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #ff980033', cursor: 'pointer', transition: 'background 0.2s' }}>Thêm sản phẩm mới</button>
          </div>
        </div>
      </section>
      {/* Form thêm/sửa sản phẩm */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 32, margin: '0 auto 40px', maxWidth: 700, width: '100%' }}>
        <h3 style={{ marginBottom: 24, color: '#1976d2', fontWeight: 600, fontSize: 22 }}>{editId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Tên sản phẩm</label>
            <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }} />
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Giá</label>
            <input name="price" placeholder="Giá" value={form.price} onChange={handleChange} required type="number" style={{ padding: 10, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }} />
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Danh mục</label>
            <select name="category" value={form.category} onChange={handleChange} required style={{ padding: 10, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }}>
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Mô tả</label>
            <input name="description" placeholder="Mô tả" value={form.description} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }} />
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Ảnh sản phẩm</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input name="image" type="file" accept="image/*" onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }} />
              {editId && form.oldImage && (
                <img src={`http://localhost:5000${form.oldImage}`} alt="Ảnh hiện tại" style={{ width: 56, borderRadius: 8, boxShadow: '0 2px 8px #0002', border: '1px solid #eee' }} />
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Kho</label>
            <input name="stock" placeholder="Kho" value={form.stock} onChange={handleChange} type="number" style={{ padding: 10, borderRadius: 8, border: '1px solid #dbeafe', fontSize: 16 }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #1976d233', transition: 'background 0.2s', cursor: 'pointer' }}>{editId ? 'Cập nhật' : 'Thêm mới'}</button>
            {editId && <button type="button" style={{ background: '#e3eafc', color: '#1976d2', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #1976d233', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => { setEditId(null); setForm({ name: '', price: '', category: '', description: '', image: null, stock: '', oldImage: '' }); }}>Hủy</button>}
          </div>
        </form>
      </div>
      {/* Bảng danh sách sản phẩm */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 32, margin: '0 auto', maxWidth: 1100, width: '100%' }}>
        <h3 style={{ marginBottom: 24, color: '#1976d2', fontWeight: 600, fontSize: 22 }}>Danh sách sản phẩm</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#e3eafc', color: '#1976d2', fontWeight: 600 }}>
                <th style={{ padding: 14, borderBottom: '2px solid #1976d2', borderTopLeftRadius: 12 }}>Tên</th>
                <th style={{ padding: 14, borderBottom: '2px solid #1976d2' }}>Giá</th>
                <th style={{ padding: 14, borderBottom: '2px solid #1976d2' }}>Danh mục</th>
                <th style={{ padding: 14, borderBottom: '2px solid #1976d2' }}>Mô tả</th>
                <th style={{ padding: 14, borderBottom: '2px solid #1976d2' }}>Ảnh</th>
                <th style={{ padding: 14, borderBottom: '2px solid #1976d2' }}>Kho</th>
                <th style={{ padding: 14, borderBottom: '2px solid #1976d2', borderTopRightRadius: 12 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={product._id} style={{ background: idx % 2 === 0 ? '#f6f8fa' : '#fff', transition: 'background 0.2s', borderBottom: '1px solid #e3eafc', borderRadius: 8, boxShadow: '0 1px 4px #0001' }}>
                  <td style={{ padding: 12, fontWeight: 500, maxWidth: 180, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{product.name}</td>
                  <td style={{ padding: 12, color: '#d32f2f', fontWeight: 600 }}>{Number(product.price).toLocaleString('vi-VN')}₫</td>
                  <td style={{ padding: 12 }}>{product.category}</td>
                  <td style={{ padding: 12, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.description}</td>
                  <td style={{ padding: 12 }}>
                    <img src={product.image ? `http://localhost:5000${product.image}` : ''} alt={product.name} style={{ width: 60, borderRadius: 8, boxShadow: '0 2px 8px #0002', border: '1px solid #eee' }} />
                  </td>
                  <td style={{ padding: 12 }}>{product.stock}</td>
                  <td style={{ padding: 12, height: 72, position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => {
                          setEditId(product._id);
                          setForm({
                            name: product.name,
                            price: product.price,
                            category: product.category,
                            description: product.description,
                            image: null,
                            stock: product.stock,
                            oldImage: product.image || '',
                          });
                          window.scrollTo({ top: 200, behavior: 'smooth' });
                        }}
                        style={{ background: '#e3eafc', color: '#1976d2', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #1976d233', transition: 'background 0.2s' }}
                        title="Sửa"
                      >
                        <span role="img" aria-label="edit">✏️</span>
                      </button>
                      <button onClick={() => handleDelete(product._id)} style={{ background: '#fdecea', color: '#d32f2f', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px #d32f2f33', transition: 'background 0.2s' }} title="Xóa"><span role="img" aria-label="delete">🗑️</span></button>
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
}


export default AdminProducts;
