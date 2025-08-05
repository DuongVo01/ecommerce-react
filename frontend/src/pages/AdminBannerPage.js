import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';


const AdminBannerPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editUploading, setEditUploading] = useState(false);
  const [editError, setEditError] = useState("");


  // Chặn truy cập nếu không phải admin
  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [user, navigate]);

  let accessContent = null;
  if (user === undefined) {
    accessContent = <div>Đang kiểm tra quyền truy cập...</div>;
  } else if (!user || user.role !== 'admin') {
    accessContent = null;
  }



  // Fetch banners
  const fetchBanners = () => {
    axios.get('http://localhost:5000/api/banners')
      .then(res => setBanners(res.data))
      .catch(() => setBanners([]));
  };
  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle upload
  const handleBannerUpload = async e => {
    e.preventDefault();
    setBannerError("");
    if (!bannerFile) {
      setBannerError("Vui lòng chọn file ảnh!");
      return;
    }
    setBannerUploading(true);
    const formData = new FormData();
    formData.append('banner', bannerFile);
    try {
      await axios.post('http://localhost:5000/api/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchBanners();
      setBannerFile(null);
    } catch {
      setBannerError("Lỗi khi tải lên banner!");
    }
    setBannerUploading(false);
  };

  // Handle delete
  const handleDeleteBanner = async (banner, idx) => {
    if (!window.confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/banners/${banner._id || idx}`);
      fetchBanners();
    } catch {
      alert('Lỗi khi xóa banner!');
    }
  };

  // Handle edit (replace image)
  const handleEditBanner = idx => {
    setEditIndex(idx);
    setEditFile(null);
    setEditError("");
  };

  const handleEditFileChange = e => {
    setEditFile(e.target.files[0]);
  };

  const handleEditSave = async (banner, idx) => {
    setEditError("");
    if (!editFile) {
      setEditError("Vui lòng chọn file ảnh mới!");
      return;
    }
    setEditUploading(true);
    const formData = new FormData();
    formData.append('banner', editFile);
    try {
      await axios.put(`http://localhost:5000/api/banners/${banner._id || idx}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchBanners();
      setEditIndex(null);
      setEditFile(null);
    } catch {
      setEditError("Lỗi khi cập nhật banner!");
    }
    setEditUploading(false);
  };

  const handleEditCancel = () => {
    setEditIndex(null);
    setEditFile(null);
    setEditError("");
  };

  if (accessContent !== null) return accessContent;

  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-dashboard-title">Quản lý Banner trang chủ</h1>
      <div className="admin-dashboard-card" style={{maxWidth:700,margin:'0 auto',marginTop:32}}>
        <div style={{fontWeight:700, fontSize:18, marginBottom:8}}>Tải lên Banner mới</div>
        <form onSubmit={handleBannerUpload} style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <label htmlFor="banner-upload" style={{background:'#f1f5f9',border:'1px solid #cbd5e1',borderRadius:6,padding:'7px 16px',fontWeight:600,cursor:'pointer',color:'#2563eb',marginRight:8}}>
            Chọn ảnh
            <input id="banner-upload" type="file" accept="image/*" style={{display:'none'}} onChange={e=>setBannerFile(e.target.files[0])} />
          </label>
          <button type="submit" disabled={bannerUploading} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'8px 20px',fontWeight:700,cursor:'pointer',boxShadow:'0 2px 8px #2563eb22'}}>
            {bannerUploading ? 'Đang tải...' : 'Tải lên'}
          </button>
        </form>
        {bannerError && <div style={{color:'#d32f2f',marginBottom:12,fontWeight:500}}>{bannerError}</div>}
        {bannerFile && (
          <div style={{marginBottom:18,display:'flex',alignItems:'center',gap:16}}>
            <span style={{fontWeight:500,color:'#475569'}}>Xem trước:</span>
            <img src={URL.createObjectURL(bannerFile)} alt="Preview" style={{maxWidth:320,maxHeight:100,objectFit:'cover',borderRadius:8,border:'1px solid #e2e8f0',boxShadow:'0 2px 8px #0001'}} />
            <button type="button" onClick={()=>setBannerFile(null)} style={{background:'#f87171',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:600,cursor:'pointer'}}>Hủy</button>
          </div>
        )}
        <div style={{fontWeight:700, fontSize:16, margin:'24px 0 10px'}}>Danh sách Banner hiện tại</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            marginTop: 8,
            justifyItems: 'center',
            alignItems: 'start',
            minHeight: 120
          }}
        >
          {banners.length === 0 ? (
            <span style={{color:'#64748b',gridColumn:'1/-1'}}>Chưa có banner nào.</span>
          ) : banners.map((b, i) => (
            <div key={i} style={{border:'1px solid #e2e8f0',borderRadius:12,padding:8,background:'#f9fafb',boxShadow:'0 2px 8px #0001',display:'flex',flexDirection:'column',alignItems:'center',width:'100%',maxWidth:320,minWidth:0}}>
              <img src={`http://localhost:5000${b.url || b}`} alt="Banner" style={{width:'100%',maxWidth:320,maxHeight:100,objectFit:'cover',borderRadius:8,marginBottom:8}} />
              <span style={{fontSize:13,color:'#64748b'}}>Banner #{i+1}</span>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button onClick={()=>handleEditBanner(i)} style={{background:'#fbbf24',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',fontWeight:600,cursor:'pointer'}}>Sửa</button>
                <button onClick={()=>handleDeleteBanner(b, i)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',fontWeight:600,cursor:'pointer'}}>Xóa</button>
              </div>
              {editIndex === i && (
                <div style={{marginTop:10,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                  <input type="file" accept="image/*" onChange={handleEditFileChange} />
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>handleEditSave(b, i)} disabled={editUploading} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'4px 16px',fontWeight:600,cursor:'pointer'}}>Lưu</button>
                    <button onClick={handleEditCancel} style={{background:'#64748b',color:'#fff',border:'none',borderRadius:6,padding:'4px 16px',fontWeight:600,cursor:'pointer'}}>Hủy</button>
                  </div>
                  {editError && <div style={{color:'#d32f2f',fontWeight:500}}>{editError}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBannerPage;
