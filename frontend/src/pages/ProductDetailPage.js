import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';
import { fetchProductById, fetchProducts } from '../services/api';
import { getReviews, addReview } from '../services/api';
import { updateReview, deleteReview } from '../services/api';


import ReportCommentModal from '../components/ReportCommentModal';
import axios from 'axios';
import './ProductDetailPage.css';


// Xóa đánh giá mẫu, khởi tạo reviewList là mảng rỗng

const ProductDetailPage = () => {
  // State cho báo cáo comment
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCommentId, setReportCommentId] = useState(null);

  // ...existing code...
  // Hàm gửi báo cáo comment
  const handleReportSubmit = async ({ commentId, reason }) => {
    // Gửi báo cáo lên backend (cần backend nhận)
    try {
      await axios.post('http://localhost:5000/api/reports', {
        commentId,
        reason,
        productId: id,
        user: user.username
      });
      showToast('Đã gửi báo cáo!');
    } catch {
      showToast('Lỗi khi gửi báo cáo!');
    }
  };
  // Hàm lọc review theo số sao và người dùng (đặt trong component để dùng state trực tiếp)
  const filteredReviews = () => {
    let reviews = reviewList;
    if (filterStar > 0) {
      reviews = reviews.filter(r => r.rating === filterStar);
    }
    if (showOnlyMine) {
      reviews = reviews.filter(r => r.user === user.username);
    }
    return reviews;
  };
  // State cho bộ lọc đánh giá
  const [filterStar, setFilterStar] = useState(0); // 0: tất cả
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  // State & hooks chỉ khai báo 1 lần duy nhất
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewList, setReviewList] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  // Giả sử có context người dùng
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Ẩn danh', role: 'user' };

  useEffect(() => {
    if (reviewList && reviewList.length > 0) {
      console.log('Review List:', reviewList);
      // Hiển thị rõ tên người dùng từng review
      reviewList.forEach((review, idx) => {
        console.log(`Review #${idx + 1}: user=`, review.user, 'rating=', review.rating, 'comment=', review.comment, 'date=', review.date);
      });
    }
  }, [reviewList]);

  useEffect(() => {
    fetchProductById(id)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không tìm thấy sản phẩm');
        setLoading(false);
      });
    // Lấy đánh giá từ backend
    getReviews(id)
      .then(res => {
        // Đưa review của user hiện tại lên đầu danh sách
        const allReviews = res.data || [];
        const myReview = allReviews.filter(r => r.user === user.username);
        const otherReviews = allReviews.filter(r => r.user !== user.username);
        setReviewList([...myReview, ...otherReviews]);
      })
      .catch(() => {
        setReviewList([]);
      });
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchProducts()
        .then(res => {
          const related = res.data.filter(
            p => p.category === product.category && p._id !== product._id
          );
          setRelatedProducts(related);
        });
    }
  }, [product]);

  if (loading) return <div className="product-detail-page">Đang tải sản phẩm...</div>;
  if (error || !product) {
    return (
      <div className="product-detail-page">
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/products">Quay lại danh sách sản phẩm</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <img src={product.image ? `http://localhost:5000${product.image}` : ''} alt={product.name} className="product-detail-image" />
        <div className="product-detail-info">
          <h2>{product.name}</h2>
          <p
            className="product-detail-price"
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#e11d48',
              textShadow: '0 2px 8px #fbb6ce77',
              margin: '16px 0 0 0',
              letterSpacing: '1px',
              display: 'block'
            }}
          >
            {Number(product.price).toLocaleString('vi-VN')}₫
          </p>
          <p className="product-detail-category" style={{margin: '8px 0 8px 0', fontWeight: 500, color: '#334155'}}>Danh mục: {product.category}</p>
          <pre className="product-detail-desc">{product.description}</pre>
          <button className="add-to-cart-btn" onClick={() => { addToCart(product); showToast('Đã thêm vào giỏ hàng!'); }}>Thêm vào giỏ hàng</button>
        </div>
      </div>

      {/* Đánh giá sản phẩm */}
      <div className="product-reviews">
        <h3>Đánh giá sản phẩm</h3>
        {/* Bộ lọc đánh giá */}
        <div style={{marginBottom:'1rem',display:'flex',alignItems:'center',gap:'1.5rem'}}>
          <div>
            <span>Lọc theo số sao: </span>
            {[0,1,2,3,4,5].map(star => (
              <button
                key={star}
                style={{background:filterStar===star?'#f59e0b':'#e5e7eb',color:filterStar===star?'white':'#374151',border:'none',borderRadius:'6px',padding:'0.3rem 0.7rem',marginRight:'0.2rem',cursor:'pointer'}}
                onClick={()=>setFilterStar(star)}
              >{star===0?'Tất cả':star+'★'}</button>
            ))}
          </div>
          <div>
            <label style={{cursor:'pointer'}}>
              <input type="checkbox" checked={showOnlyMine} onChange={e=>setShowOnlyMine(e.target.checked)} style={{marginRight:'0.5rem'}} />
              Chỉ xem đánh giá của tôi
            </label>
          </div>
        </div>
        <form
          style={{ marginBottom: "2rem", background: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}
          onSubmit={async e => {
            e.preventDefault();
            if (!newComment.trim()) return;
            // Kiểm tra nếu user đã có đánh giá cho sản phẩm này
            const hasReviewed = reviewList.some(r => r.user === user.username);
            if (hasReviewed) {
              showToast("Bạn chỉ được gửi một đánh giá cho mỗi sản phẩm!");
              return;
            }
            const reviewData = {
              user: user.username,
              rating: newRating,
              comment: newComment,
              date: new Date().toLocaleString('vi-VN')
            };
            try {
              await addReview(id, reviewData);
              // Lấy lại danh sách đánh giá mới nhất
              const res = await getReviews(id);
              setReviewList(res.data);
              setNewComment("");
              setNewRating(5);
              showToast("Cảm ơn bạn đã đánh giá!");
            } catch {
              showToast("Lỗi khi gửi đánh giá!");
            }
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Đánh giá:</span>
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  style={{ cursor: "pointer", color: star <= newRating ? "#f59e0b" : "#e5e7eb", fontSize: "1.3rem" }}
                  onClick={() => setNewRating(star)}
                >★</span>
              ))}
            </div>
            <textarea
              placeholder="Nhận xét của bạn"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "1rem", minHeight: "60px" }}
              required
            />
            <button type="submit" style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>Gửi đánh giá</button>
          </div>
        </form>
        {filteredReviews().length === 0 ? (
          <p>Không có đánh giá phù hợp.</p>
        ) : (
          <ul className="review-list">
            {filteredReviews().map(review => (
              <li key={review._id || review.id} className="review-item">
                <div className="review-user">{review.user} <span style={{color:'#64748b', fontSize:'0.9em', marginLeft:'8px'}}>{review.date ? review.date : ''}</span></div>
                <div className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                {editingReviewId === (review._id || review.id) ? (
                  <form
                    style={{marginTop:'0.5rem'}}
                    onSubmit={async e => {
                      e.preventDefault();
                      try {
                        await updateReview(id, review._id || review.id, {
                          user: user.username,
                          rating: editRating,
                          comment: editComment
                        });
                        const res = await getReviews(id);
                        setReviewList(res.data);
                        setEditingReviewId(null);
                        showToast('Đã cập nhật đánh giá!');
                      } catch {
                        showToast('Lỗi khi cập nhật đánh giá!');
                      }
                    }}
                  >
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <span>Đánh giá:</span>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{cursor:'pointer',color:star<=editRating?'#f59e0b':'#e5e7eb',fontSize:'1.3rem'}} onClick={()=>setEditRating(star)}>★</span>
                      ))}
                    </div>
                    <textarea value={editComment} onChange={e=>setEditComment(e.target.value)} style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'1rem',minHeight:'60px',margin:'0.5rem 0'}} required />
                    <button type="submit" style={{background:'#10b981',color:'white',border:'none',borderRadius:'8px',padding:'0.5rem 1rem',fontWeight:700,marginRight:'0.5rem'}}>Lưu</button>
                    <button type="button" style={{background:'#e5e7eb',color:'#374151',border:'none',borderRadius:'8px',padding:'0.5rem 1rem',fontWeight:700}} onClick={()=>setEditingReviewId(null)}>Hủy</button>
                  </form>
                ) : (
                  <div className="review-comment">{review.comment}</div>
                )}
                {/* Nút báo cáo comment */}
                <div style={{marginTop:'0.5rem',display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  <button
                    style={{background:'#f87171',color:'white',border:'none',borderRadius:'8px',padding:'0.3rem 0.8rem',fontWeight:600,cursor:'pointer'}}
                    onClick={()=>{
                      setReportCommentId(review._id || review.id);
                      setReportOpen(true);
                    }}
                  >Báo cáo</button>
                  {/* Chỉ cho phép sửa/xóa nếu là user hiện tại hoặc admin (xóa) */}
                  {(review.user === user.username && editingReviewId !== (review._id || review.id)) && (
                    <>
                      <button
                        style={{background:'#3b82f6',color:'white',border:'none',borderRadius:'8px',padding:'0.3rem 0.8rem',fontWeight:600,cursor:'pointer'}}
                        onClick={()=>{
                          setEditingReviewId(review._id || review.id);
                          setEditRating(review.rating);
                          setEditComment(review.comment);
                        }}
                      >Sửa</button>
                      <button
                        style={{background:'#ef4444',color:'white',border:'none',borderRadius:'8px',padding:'0.3rem 0.8rem',fontWeight:600,cursor:'pointer'}}
                        onClick={async()=>{
                          if(window.confirm('Bạn có chắc muốn xóa đánh giá này?')){
                            try {
                              await deleteReview(id, review._id || review.id, { user: user.username });
                              const res = await getReviews(id);
                              setReviewList(res.data);
                              showToast('Đã xóa đánh giá!');
                            } catch {
                              showToast('Lỗi khi xóa đánh giá!');
                            }
                          }
                        }}
                      >Xóa</button>
                    </>
                  )}
                  {/* Admin có thể xóa mọi đánh giá */}
                  {user.role === 'admin' && review.user !== user.username && (
                    <button
                      style={{background:'#ef4444',color:'white',border:'none',borderRadius:'8px',padding:'0.3rem 0.8rem',fontWeight:600,cursor:'pointer'}}
                      onClick={async()=>{
                        if(window.confirm('Admin: Bạn có chắc muốn xóa đánh giá này?')){
                          try {
                            await deleteReview(id, review._id || review.id, { user: user.username, admin: true });
                            const res = await getReviews(id);
                            setReviewList(res.data);
                            showToast('Admin đã xóa đánh giá!');
                          } catch {
                            showToast('Lỗi khi admin xóa đánh giá!');
                          }
                        }
                      }}
                    >Admin Xóa</button>
                  )}
                </div>
              </li>
            ))}
      {/* Modal báo cáo comment */}
      <ReportCommentModal
        open={reportOpen}
        onClose={()=>setReportOpen(false)}
        onSubmit={handleReportSubmit}
        commentId={reportCommentId}
      />
          </ul>
        )}
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h3>Sản phẩm liên quan</h3>
          <div className="related-products-list">
            {relatedProducts.map(rp => (
              <ProductCard key={rp._id} product={rp} />
            ))}
          </div>
        </div>
      )}

      <Link to="/products" className="back-link">← Quay lại danh sách sản phẩm</Link>
    </div>
  );
};

export default ProductDetailPage;
