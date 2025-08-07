import { useRef } from 'react';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { getOrders } from '../services/api';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  // Lưu trữ trạng thái đã đánh giá từ backend cho từng sản phẩm
  const [productReviewedMap, setProductReviewedMap] = useState({});
  // Gửi đánh giá sản phẩm (API addReview)
  const addReview = async (productId, reviewData) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      if (!res.ok) throw new Error('Lỗi khi gửi đánh giá');
      return await res.json();
    } catch (err) {
      throw err;
    }
  };
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const reviewTextareaRef = useRef(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy orderId từ location.state
  const orderId = location.state?.orderId;

  useEffect(() => {
    // Kiểm tra trạng thái đã đánh giá từ backend cho từng sản phẩm trong đơn hàng
    const fetchReviewedStatus = async () => {
      if (!order || !order.items) return;
      const map = {};
      for (const item of order.items) {
        let productId = (item.productId && item.productId._id) ? item.productId._id : (item.productId && item.productId.id) ? item.productId.id : item.productId;
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${productId}/reviews`);
          if (res.ok) {
            const reviews = await res.json();
            map[productId] = Array.isArray(reviews) && reviews.some(r => r.user === user.username) ? reviews.find(r => r.user === user.username) : null;
          } else {
            map[productId] = null;
          }
        } catch {
          map[productId] = null;
        }
      }
      setProductReviewedMap(map);
    };
    if (order && user) fetchReviewedStatus();
  }, [order, user]);

  useEffect(() => {
    if (!user || !(user._id || user.id)) {
      navigate('/login');
      return;
    }
    if (!orderId) {
      navigate('/');
      return;
    }
    // Lấy tất cả đơn hàng của user, tìm đơn hàng vừa đặt
    getOrders(user._id || user.id)
      .then(res => {
        const found = res.data.find(o => o._id === orderId || o.id === orderId);
        setOrder(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, orderId, navigate]);

  // Kiểm tra trạng thái đã đánh giá từ backend cho từng sản phẩm trong đơn hàng
  useEffect(() => {
    const fetchReviewedStatus = async () => {
      if (!order || !order.items) return;
      const map = {};
      for (const item of order.items) {
        let productId = (item.productId && item.productId._id) ? item.productId._id : (item.productId && item.productId.id) ? item.productId.id : item.productId;
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${productId}/reviews`);
          if (res.ok) {
            const reviews = await res.json();
            map[productId] = Array.isArray(reviews) && reviews.some(r => r.user === user.username) ? reviews.find(r => r.user === user.username) : null;
          } else {
            map[productId] = null;
          }
        } catch {
          map[productId] = null;
        }
      }
      setProductReviewedMap(map);
    };
    if (order && user) fetchReviewedStatus();
  }, [order, user]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Đang tải đơn hàng...</div>;
  if (!order) return <div style={{ textAlign: 'center', marginTop: 40 }}>Không tìm thấy đơn hàng!</div>;

  return (
    <div className="order-detail-container">
      <h2 className="order-detail-title">Chi tiết đơn hàng</h2>
      <div className="order-detail-summary">
        <div className="order-detail-summary-row"><strong>Mã đơn hàng:</strong> {order._id || order.id}</div>
        <div className="order-detail-summary-row">
          <strong>Trạng thái:</strong> <span
            className="order-detail-status"
            style={{
              background: order.status === 'completed' ? '#e0f7fa'
                : order.status === 'shipping' ? '#fffde7'
                : order.status === 'waiting' ? '#e3fcec'
                : order.status === 'pending' ? '#e3fcec'
                : '#fbe9e7',
              color: order.status === 'completed' ? '#009688'
                : order.status === 'shipping' ? '#fbc02d'
                : order.status === 'waiting' ? '#388e3c'
                : order.status === 'pending' ? '#388e3c'
                : '#d84315',
            }}
          >
            {order.status === 'completed' && 'Đã giao'}
            {order.status === 'shipping' && 'Đang vận chuyển'}
            {order.status === 'waiting' && 'Chờ giao hàng'}
            {order.status === 'pending' && 'Chờ xác nhận'}
            {order.status === 'cancelled' && 'Đã hủy'}
            {['completed','shipping','waiting','pending','cancelled'].indexOf(order.status) === -1 && order.status}
          </span>
        </div>
        <div>
          <strong>Tổng tiền:</strong> <span className="order-detail-total">{Number(order.total).toLocaleString('vi-VN')}₫</span>
        </div>
      </div>
      <h3 className="order-detail-products-title">Sản phẩm</h3>
      <ul className="order-detail-products-list">
        {order.items.map((item, idx) => {
          // Lấy hình sản phẩm nếu có
          let imgUrl = '';
          const prod = item.productId;
          if (prod && prod.image) {
            imgUrl = prod.image.startsWith('/uploads/')
              ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${prod.image}`
              : prod.image;
          }
          // Kiểm tra user đã đánh giá sản phẩm này chưa (từ backend)
          const productId = (item.productId && item.productId._id) ? item.productId._id : (item.productId && item.productId.id) ? item.productId.id : item.productId;
          const userReview = productReviewedMap[productId];
          return (
            <li key={idx} className="order-detail-product-item" style={{ gap: 16 }}>
              {imgUrl ? (
                <img src={imgUrl} alt="Sản phẩm" style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 8, boxShadow: '0 1px 4px #1976d211' }} />
              ) : (
                <span style={{ color: '#bbb', fontSize: 13, width: 54, height: 54, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f3f6fa', borderRadius: 8 }}>Không có ảnh</span>
              )}
              <span className="order-detail-product-name">{item.productId?.name || item.productName || item.productId}</span>
              <span className="order-detail-product-qty">x {item.quantity}</span>
              {userReview ? (
                <button
                  style={{
                    marginLeft: 10,
                    background: '#e3eafc',
                    color: '#1976d2',
                    border: '1px solid #e3eafc',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #1976d211',
                    transition: 'background 0.18s',
                  }}
                  onClick={() => {
                    setReviewingProduct(item.productId || item.productName || item.productId);
                    setShowReviewModal(true);
                    setReviewContent(userReview.comment);
                    setReviewRating(userReview.rating);
                    setTimeout(() => { reviewTextareaRef.current && reviewTextareaRef.current.focus(); }, 100);
                  }}
                >Sửa đánh giá</button>
              ) : (
                <button
                  style={{
                    marginLeft: 10,
                    background: '#fffbe7',
                    color: '#1976d2',
                    border: '1px solid #e3eafc',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #1976d211',
                    transition: 'background 0.18s',
                  }}
                  onClick={() => {
                    setReviewingProduct(item.productId || item.productName || item.productId);
                    setShowReviewModal(true);
                    setReviewContent('');
                    setReviewRating(5);
                    setTimeout(() => { reviewTextareaRef.current && reviewTextareaRef.current.focus(); }, 100);
                  }}
                >Đánh giá</button>
              )}
            </li>
          );
        })}
      {/* Modal đánh giá */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.18)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #1976d233', padding: 32, minWidth: 320, maxWidth: 380, width: '100%', position: 'relative' }}>
            <button onClick={() => setShowReviewModal(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} title="Đóng">×</button>
            <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>Đánh giá sản phẩm</h3>
            <div style={{ marginBottom: 10, textAlign: 'center', fontWeight: 500 }}>{typeof reviewingProduct === 'object' ? reviewingProduct.name : reviewingProduct}</div>
            <div style={{ marginBottom: 12, textAlign: 'center' }}>
              <span style={{ fontWeight: 500, marginRight: 8 }}>Chọn số sao:</span>
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  style={{
                    color: star <= reviewRating ? '#ffc107' : '#e3eafc',
                    fontSize: 22,
                    cursor: 'pointer',
                    marginRight: 2,
                  }}
                  onClick={() => setReviewRating(star)}
                >★</span>
              ))}
            </div>
            <textarea
              ref={reviewTextareaRef}
              value={reviewContent}
              onChange={e => setReviewContent(e.target.value)}
              placeholder="Nhập nhận xét của bạn về sản phẩm này..."
              style={{ width: '100%', minHeight: 70, borderRadius: 8, border: '1px solid #e3eafc', padding: 10, fontSize: 15, marginBottom: 16, resize: 'vertical' }}
            />
            <button
              style={{
                background: 'linear-gradient(90deg, #1976d2 60%, #2196f3 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 2px 8px #1976d233',
                cursor: 'pointer',
                display: 'block',
                margin: '0 auto',
              }}
              onClick={async () => {
                if (!reviewContent.trim()) return;
                let productId = null;
                if (typeof reviewingProduct === 'object' && reviewingProduct._id) productId = reviewingProduct._id;
                else if (typeof reviewingProduct === 'string') productId = reviewingProduct;
                else productId = reviewingProduct && reviewingProduct.id;
                const reviewData = {
                  user: user.username,
                  rating: reviewRating,
                  comment: reviewContent,
                  date: new Date().toLocaleString('vi-VN')
                };
                try {
                  // Nếu đã có review, gọi API updateReview, ngược lại gọi addReview
                  if (productReviewedMap[productId]) {
                    // Sửa đánh giá
                    const reviewId = productReviewedMap[productId]._id || productReviewedMap[productId].id;
                    const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${productId}/reviews/${reviewId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(reviewData)
                    });
                    if (!res.ok) throw new Error('Lỗi khi sửa đánh giá');
                    // Cập nhật lại trạng thái đã đánh giá
                    setProductReviewedMap(prev => ({
                      ...prev,
                      [productId]: { ...reviewData, _id: reviewId }
                    }));
                    alert('Đã cập nhật đánh giá!');
                  } else {
                    // Gửi mới
                    await addReview(productId, reviewData);
                    setProductReviewedMap(prev => ({
                      ...prev,
                      [productId]: reviewData
                    }));
                    alert('Đã gửi đánh giá thành công!');
                  }
                  setShowReviewModal(false);
                } catch (err) {
                  alert('Lỗi khi gửi/sửa đánh giá!');
                }
              }}
              disabled={reviewContent.trim().length === 0}
            >Gửi đánh giá</button>
          </div>
        </div>
      )}
      </ul>
      <button
        className="order-detail-back-btn"
        onClick={() => navigate(-1)}
      >Quay lại</button>
    </div>
  );
};

export default OrderDetailPage;
