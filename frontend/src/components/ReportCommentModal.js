import React, { useState } from 'react';

const REPORT_REASONS = [
  'Đánh giá thô tục phản cảm',
  'Chứa hình ảnh phản cảm, khỏa thân, khiêu dâm',
  'Đánh giá trùng lặp (thông tin rác)',
  'Chứa thông tin cá nhân',
  'Quảng cáo trái phép',
  'Đánh giá không chính xác / gây hiểu lầm (ví dụ như: đánh giá và sản phẩm không khớp, ...)',
  'Vi phạm khác'
];

const ReportCommentModal = ({ open, onClose, onSubmit, commentId }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!reason) {
      setError('Vui lòng chọn lý do báo cáo!');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ commentId, reason });
      onClose();
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại!');
    }
    setSubmitting(false);
  };

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'#0007',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:12,padding:32,minWidth:340,maxWidth:400,boxShadow:'0 4px 32px #0003',position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute',top:12,right:16,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#64748b'}}>&times;</button>
        <h2 style={{fontSize:20,fontWeight:700,marginBottom:16}}>Báo cáo đánh giá này</h2>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:16}}>
            <div style={{fontWeight:600,marginBottom:8}}>Vui lòng chọn lý do báo cáo</div>
            {REPORT_REASONS.map(r => (
              <label key={r} style={{display:'block',marginBottom:6,cursor:'pointer'}}>
                <input
                  type="radio"
                  name="report-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  style={{marginRight:8}}
                />
                {r}
              </label>
            ))}
          </div>
          {error && <div style={{color:'#d32f2f',marginBottom:10}}>{error}</div>}
          <button type="submit" disabled={submitting} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'10px 24px',fontWeight:700,cursor:'pointer',fontSize:16}}>
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportCommentModal;
