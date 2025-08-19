import React, { useEffect, useState, useMemo } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { useParams, Link } from 'react-router-dom';
import { FaThumbsUp } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../CartContext';
import { useToast } from '../../ToastContext';
import { fetchProductById, fetchProducts } from '../../services/api';
import { getReviews, addReview } from '../../services/api';
import { updateReview, deleteReview } from '../../services/api';


import ReportCommentModal from '../../components/ReportCommentModal';
import axios from 'axios';
import './ProductDetailPage.css';


// Xóa đánh giá mẫu, khởi tạo reviewList là mảng rỗng

const ProductDetailPage = () => {
  // ...existing code...
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
  // State cho menu đánh giá (mở/đóng từng review)
  const [openMenuReviewId, setOpenMenuReviewId] = useState(null);
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
  // Đóng dropdown menu đánh giá khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Nếu có menu đang mở và click không phải vào menu hoặc nút mở menu
      if (openMenuReviewId !== null) {
        const menu = document.querySelector('.review-menu.open');
        const btns = document.querySelectorAll('[aria-label="Tùy chọn đánh giá"]');
        if (
          menu && !menu.contains(event.target) &&
          !Array.from(btns).some(btn => btn.contains(event.target))
        ) {
          setOpenMenuReviewId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuReviewId]);
  // Like state: { [reviewId]: true }
  const [likedMap, setLikedMap] = useState({});
  // Giả sử có context người dùng
  const user = useMemo(() => {
    return JSON.parse(localStorage.getItem('user')) || { username: 'Ẩn danh', role: 'user' };
  }, []);

  // Khi reviewList thay đổi, đồng bộ likedMap dựa trên review.likes từ backend
  useEffect(() => {
    if (reviewList && user && user.username) {
      const newLikedMap = {};
      reviewList.forEach(r => {
        if (Array.isArray(r.likes) && r.likes.includes(user.username)) {
          newLikedMap[r._id || r.id] = true;
        }
      });
      setLikedMap(newLikedMap);
    }
  }, [reviewList, user, user.username]);

  // Hàm xử lý like/unlike review (gọi backend)
  const handleLikeReview = async (reviewId) => {
    try {
      // Gọi API backend để like/unlike
      await import('../../services/api').then(api => api.likeReview(id, reviewId, user.username));
      // Sau khi like/unlike, lấy lại danh sách review mới nhất
      const res = await import('../../services/api').then(api => api.getReviews(id));
      setReviewList(res.data || []);
    } catch (err) {
      showToast('Lỗi khi like đánh giá!');
    }
  };

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
  }, [id, user.username]);

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
          <div className="product-desc-block">
            <div className="desc-title">
              <span style={{fontWeight:700, fontSize:'1.15rem', color:'#1976d2'}}>Mô tả sản phẩm</span>
            </div>
            <pre className="product-detail-desc">{product.description}</pre>
          </div>
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
        {/* Chỉ hiển thị form nếu user chưa gửi đánh giá */}
        {reviewList.every(r => r.user !== user.username) && (
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
                // Hiển thị ngay đánh giá mới ở đầu danh sách
                setReviewList(prev => [reviewData, ...prev]);
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
              <button type="submit" className="btn-submit-review">Gửi đánh giá</button>
            </div>
          </form>
        )}
        {filteredReviews().length === 0 ? (
          <p>Không có đánh giá phù hợp.</p>
        ) : (
          <ul className="review-list">
            {filteredReviews().map(review => {
              const reviewId = review._id || review.id;
              return (
                <li key={reviewId} className="review-item" style={{position:'relative', marginBottom: 12}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    {(() => {
                      let avatarUrl = review.avatar;
                      if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
                        avatarUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${avatarUrl}`;
                      }
                      return (
                        <img
                          src={avatarUrl || '/default-avatar.png'}
                          alt="avatar"
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 8, border: '1.5px solid #e3eafc' }}
                        />
                      );
                    })()}
                    <div className="review-user">
                      {review.user}
                      <span style={{color:'#64748b', fontSize:'0.9em', marginLeft:'8px'}}>{review.date ? review.date : ''}</span>
                    </div>
                  </div>
                  <div style={{marginTop:2, marginBottom:2}}>
                    {[1,2,3,4,5].map(star => (
                      <span key={star} style={{color: star <= review.rating ? '#f59e0b' : '#e5e7eb', fontSize: '1.1em'}}>
                        ★
                      </span>
                    ))}
                  </div>
                  {editingReviewId === reviewId ? (
                    // ...existing code for edit form...
                    <form
                      style={{marginTop:'0.5rem'}}
                      onSubmit={async e => {
                        e.preventDefault();
                        try {
                          await updateReview(id, reviewId, {
                            user: user.username,
                            rating: editRating,
                            comment: editComment
                          });
                          // Lấy lại danh sách đánh giá mới nhất
                          const res = await getReviews(id);
                          // Đảm bảo chỉ có 1 đánh giá cho user này
                          setReviewList(prev => {
                            if (res.data.filter(r => r.user === user.username).length === 1) return res.data;
                            const others = res.data.filter(r => r.user !== user.username);
                            const myReview = res.data.filter(r => r.user === user.username).slice(-1);
                            return [...myReview, ...others];
                          });
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
                      <textarea value={editComment} onChange={e=>setEditComment(e.target.value)} style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'1rem',minHeight:'110px',minWidth:'320px',width:'100%',margin:'0.5rem 0',resize:'vertical'}} required />
                      <button type="submit" className="btn-save-review">Lưu</button>
                      <button type="button" className="btn-cancel-review" onClick={()=>setEditingReviewId(null)}>Hủy</button>
                    </form>
                  ) : (
                    <pre className="review-comment" style={{whiteSpace:'pre-line',margin:0, marginBottom:8}}>{review.comment}</pre>
                  )}
                  <div style={{display:'flex',alignItems:'center',marginTop:4}}>
                    <button
                      style={{
                        background: likedMap[reviewId] ? '#e0eaff' : '#f3f4f6',
                        color: likedMap[reviewId] ? '#1976d2' : '#64748b',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 12px',
                        fontWeight: 600,
                        cursor: review.user === user.username ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 15,
                        marginRight: 'auto',
                        opacity: review.user === user.username ? 0.7 : 1
                      }}
                      onClick={() => review.user !== user.username && handleLikeReview(reviewId)}
                      title={review.user === user.username ? 'Bạn không thể tự like đánh giá của mình' : (likedMap[reviewId] ? 'Bạn đã thích đánh giá này' : 'Thích đánh giá này')}
                      disabled={review.user === user.username}
                    >
                      <FaThumbsUp style={{marginRight:2}} />
                      {Array.isArray(review.likes) ? review.likes.length : (review.likes || 0)}
                    </button>
                    <div style={{position:'relative', marginLeft:'auto', display:'flex', alignItems:'center'}}>
                      <button
                        style={{background:'none',border:'none',cursor:'pointer',padding:'4px'}}
                        onClick={()=>setOpenMenuReviewId(openMenuReviewId===reviewId?null:reviewId)}
                        aria-label="Tùy chọn đánh giá"
                      >
                        <FaEllipsisV size={18} color="#64748b" />
                      </button>
                      {openMenuReviewId === reviewId && (
                        <div
                          className="review-menu open"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            zIndex: 10,
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            minWidth: 120,
                            boxShadow: '0 4px 16px #0001',
                            padding: 8,
                            marginTop: 4
                          }}
                        >
                          {review.user !== user.username && (
                            <button
                              onClick={()=>{
                                setReportCommentId(reviewId);
                                setReportOpen(true);
                                setOpenMenuReviewId(null);
                              }}
                            >Báo cáo</button>
                          )}
                          {(review.user === user.username && editingReviewId !== reviewId) && (
                            <>
                              <button
                                onClick={()=>{
                                  setEditingReviewId(reviewId);
                                  setEditRating(review.rating);
                                  setEditComment(review.comment);
                                  setOpenMenuReviewId(null);
                                }}
                              >Sửa</button>
                              <button
                                onClick={async()=>{
                                  if(window.confirm('Bạn có chắc muốn xóa đánh giá này?')){
                                    try {
                                      await deleteReview(id, reviewId, { user: user.username });
                                      const res = await getReviews(id);
                                      setReviewList(res.data);
                                      showToast('Đã xóa đánh giá!');
                                    } catch {
                                      showToast('Lỗi khi xóa đánh giá!');
                                    }
                                    setOpenMenuReviewId(null);
                                  }
                                }}
                              >Xóa</button>
                            </>
                          )}
                          {user.role === 'admin' && review.user !== user.username && (
                            <button
                              onClick={async()=>{
                                if(window.confirm('Admin: Bạn có chắc muốn xóa đánh giá này?')){
                                  try {
                                    await deleteReview(id, reviewId, { user: user.username, admin: true });
                                    const res = await getReviews(id);
                                    setReviewList(res.data);
                                    showToast('Admin đã xóa đánh giá!');
                                  } catch {
                                    showToast('Lỗi khi admin xóa đánh giá!');
                                  }
                                  setOpenMenuReviewId(null);
                                }
                              }}
                            >Admin Xóa</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Đã render comment ở trên, không lặp lại ở đây nữa */}
                </li>
              );
            })}
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
