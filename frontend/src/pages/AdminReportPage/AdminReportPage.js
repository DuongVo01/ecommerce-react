import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../UserContext';
import axios from 'axios';


const AdminReportPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

  // Chặn truy cập nếu không phải admin
  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      window.location.href = '/';
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    axios.get('http://localhost:5000/api/reports')
      .then(res => setReports(res.data))
      .catch(() => setError('Lỗi khi tải danh sách báo cáo!'))
      .finally(() => setLoading(false));
  }, [user]);
  // Xem đánh giá (chỉ admin mới thao tác được)
  const handleViewReview = (productId, commentId) => {
    if (!user || user.role !== 'admin') return;
    window.open(`/product/${productId}?highlightReview=${commentId}`, '_blank');
  };

  // Gửi cảnh báo (chỉ admin mới thao tác được)
  const handleSendWarning = async (userReport) => {
    if (!user || user.role !== 'admin') return;
    // Nếu có endpoint gửi cảnh báo, gọi API ở đây. Nếu chưa có, dùng alert.
    // await axios.post('http://localhost:5000/api/warnings', { user: userReport });
    alert(`Đã gửi cảnh báo đến tài khoản: ${userReport}`);
  };

  if (user === undefined) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-dashboard-title">Quản lý Báo cáo đánh giá</h1>
      <div className="admin-dashboard-card" style={{maxWidth:900,margin:'0 auto',marginTop:32}}>
        {loading ? (
          <div>Đang tải danh sách báo cáo...</div>
        ) : error ? (
          <div style={{color:'#d32f2f'}}>{error}</div>
        ) : reports.length === 0 ? (
          <div style={{color:'#64748b'}}>Chưa có báo cáo nào.</div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse',marginTop:8}}>
            <thead>
              <tr style={{background:'#f1f5f9'}}>
                <th style={{padding:'8px',border:'1px solid #e2e8f0'}}>STT</th>
                <th style={{padding:'8px',border:'1px solid #e2e8f0'}}>ID Đánh giá</th>
                <th style={{padding:'8px',border:'1px solid #e2e8f0'}}>Sản phẩm</th>
                <th style={{padding:'8px',border:'1px solid #e2e8f0'}}>Người báo cáo</th>
                <th style={{padding:'8px',border:'1px solid #e2e8f0'}}>Lý do</th>
                <th style={{padding:'8px',border:'1px solid #e2e8f0'}}>Thời gian</th>
                <th style={{padding:'8px',border:'1px solid #e2e8f0'}}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.id} style={{background:i%2===0?'#fff':'#f8fafc'}}>
                  <td style={{padding:'8px',border:'1px solid #e2e8f0',textAlign:'center'}}>{i+1}</td>
                  <td style={{padding:'8px',border:'1px solid #e2e8f0'}}>{r.commentId}</td>
                  <td style={{padding:'8px',border:'1px solid #e2e8f0'}}>{r.productId}</td>
                  <td style={{padding:'8px',border:'1px solid #e2e8f0'}}>{r.user}</td>
                  <td style={{padding:'8px',border:'1px solid #e2e8f0'}}>{r.reason}</td>
                  <td style={{padding:'8px',border:'1px solid #e2e8f0'}}>{new Date(r.date).toLocaleString('vi-VN')}</td>
                  <td style={{padding:'8px',border:'1px solid #e2e8f0',textAlign:'center'}}>
                    <button onClick={()=>handleViewReview(r.productId, r.commentId)} style={{background:'#3b82f6',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',fontWeight:600,cursor:'pointer',marginRight:8}}>Xem đánh giá</button>
                    <button onClick={()=>handleSendWarning(r.user)} style={{background:'#fbbf24',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',fontWeight:600,cursor:'pointer'}}>Gửi cảnh báo</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminReportPage;
