import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';
import { fetchProductById, fetchProducts } from '../services/api';
import './ProductDetailPage.css';


const reviews = [
  {
    id: 1,
    user: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Sản phẩm rất đẹp, chất lượng tốt, giao hàng nhanh!'
  },
  {
    id: 2,
    user: 'Trần Thị B',
    rating: 4,
    comment: 'Áo mặc thoải mái, sẽ ủng hộ tiếp.'
  },
  {
    id: 3,
    user: 'Lê Văn C',
    rating: 5,
    comment: 'Đóng gói cẩn thận, giá hợp lý.'
  },
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <p className="product-detail-price">{product.price}₫</p>
          <p className="product-detail-category">Danh mục: {product.category}</p>
          <pre className="product-detail-desc">{product.description}</pre>
          <button className="add-to-cart-btn" onClick={() => { addToCart(product); showToast('Đã thêm vào giỏ hàng!'); }}>Thêm vào giỏ hàng</button>
        </div>
      </div>

      {/* Đánh giá sản phẩm */}
      <div className="product-reviews">
        <h3>Đánh giá sản phẩm</h3>
        {reviews.length === 0 ? (
          <p>Chưa có đánh giá nào.</p>
        ) : (
          <ul className="review-list">
            {reviews.map(review => (
              <li key={review.id} className="review-item">
                <div className="review-user">{review.user}</div>
                <div className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                <div className="review-comment">{review.comment}</div>
              </li>
            ))}
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
