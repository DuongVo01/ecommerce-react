import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../../CartContext';
import { useToast } from '../../ToastContext';
import { UserContext } from '../../UserContext';
import { api } from '../../services/api';
import ReviewsSection from '../../components/ReviewsSection/ReviewsSection';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [reviews, setReviews] = useState([]);

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        // Fetch product details
        const productResponse = await api.get(`/products/${id}`);
        setProduct(productResponse.data);

        // Fetch reviews
        const reviewsResponse = await api.get(`/products/${id}/reviews`);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast(error.response?.data?.message || 'Không thể tải thông tin sản phẩm', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id, showToast]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (quantity > (product?.stock || 0)) {
      showToast('Số lượng vượt quá tồn kho!', 'error');
      return;
    }
    addToCart(product, quantity);
    showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    setQuantity(1);
  };

  const handleLikeReview = async (reviewId) => {
    try {
      if (!user) {
        showToast('Vui lòng đăng nhập để thích đánh giá', 'warning');
        return;
      }

      const response = await api.post(
        `/products/${id}/reviews/${reviewId}/like`,
        { username: user.username }
      );
      // Refresh reviews after liking
      const reviewsResponse = await api.get(`/products/${id}/reviews`);
      setReviews(reviewsResponse.data);
      showToast(response.data.message === 'Review liked' ? 'Đã thích đánh giá!' : 'Đã bỏ thích đánh giá!');
    } catch (error) {
      console.error('Error liking review:', error);
      showToast(
        error.response?.data?.message || 'Không thể thích đánh giá. Vui lòng thử lại.', 
        'error'
      );
    }
  };

  const handleAddReview = async (formData) => {
    try {
      // Convert FormData to proper structure for file upload
      const reviewFormData = new FormData();
      reviewFormData.append('rating', formData.get('rating'));
      reviewFormData.append('comment', formData.get('comment'));
      reviewFormData.append('user', formData.get('user'));

      // Log the files being sent
      const files = formData.getAll('images');
      console.log('Files being sent:', files);

      // Check if files are present
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          console.log(`Appending file ${index}:`, file.name);
          reviewFormData.append('images', file);
        });
      }

      const response = await api.post(
        `/products/${id}/reviews`, 
        reviewFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Refresh reviews after adding new one
      const reviewsResponse = await api.get(`/products/${id}/reviews`);
      setReviews(reviewsResponse.data);
      showToast('Đánh giá của bạn đã được gửi thành công!', 'success');
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      showToast(
        error.response?.data?.message || 'Không thể thêm đánh giá. Vui lòng thử lại.',
        'error'
      );
      throw error;
    }
  };

  const handleUpdateReview = async (reviewId, formData) => {
    try {
      // Convert FormData to proper structure for file upload
      const reviewFormData = new FormData();
      reviewFormData.append('rating', formData.get('rating'));
      reviewFormData.append('comment', formData.get('comment'));
      reviewFormData.append('user', formData.get('user'));

      // Get and append files
      const files = formData.getAll('images');
      if (files && files.length > 0) {
        console.log('Updating review with files:', files);
        files.forEach(file => {
          reviewFormData.append('images', file);
        });
      }

      // Send update request with proper headers
      await api.put(
        `/products/${id}/reviews/${reviewId}`, 
        reviewFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Refresh reviews after updating
      const reviewsResponse = await api.get(`/products/${id}/reviews`);
      setReviews(reviewsResponse.data);
      showToast('Đánh giá đã được cập nhật thành công!', 'success');
    } catch (error) {
      console.error('Error updating review:', error);
      showToast(
        error.response?.data?.message || 'Không thể cập nhật đánh giá',
        'error'
      );
      throw error;
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        showToast('Vui lòng đăng nhập để thực hiện thao tác này', 'error');
        return;
      }

      await api.delete(`/products/${id}/reviews/${reviewId}`, {
        data: { user: userData.username }
      });

      // Refresh reviews after deleting
      const reviewsResponse = await api.get(`/products/${id}/reviews`);
      setReviews(reviewsResponse.data);
      showToast('Đã xóa đánh giá thành công!', 'success');
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast(
        error.response?.data?.message || 'Không thể xóa đánh giá', 
        'error'
      );
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page error">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm này có thể đã bị xóa hoặc không tồn tại</p>
      </div>
    );
  }

  const discountedPrice = product.discountPrice || product.price;
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Hình ảnh */}
        <div className="product-image-section">
          <div
            className={`image-container ${isImageZoomed ? 'zoomed' : ''}`}
            onMouseEnter={() => setIsImageZoomed(true)}
            onMouseLeave={() => setIsImageZoomed(false)}
          >
            <img
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.image}`}
              alt={product.name}
              className="product-detail-image"
            />
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-category">
              Danh mục: <span>{product.category}</span>
            </div>
          </div>

          <div className="product-price-section">
            <p className="product-price">
              {Number(discountedPrice).toLocaleString('vi-VN')}₫
            </p>
            {hasDiscount && (
              <p className="original-price">
                {Number(product.price).toLocaleString('vi-VN')}₫
              </p>
            )}
          </div>

          <div className="product-short-desc">
            <p>{product.shortDesc}</p>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            </button>
          </div>

          <div className="product-stock">
            Tình trạng:{' '}
            <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
              {product.stock > 0
                ? `Còn ${product.stock} sản phẩm`
                : 'Hết hàng'}
            </span>
          </div>

          <div className="product-description">
            <h3>Mô tả sản phẩm</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-container">
        <h2 className="section-title">Đánh giá sản phẩm</h2>
        <ReviewsSection 
          reviews={reviews} 
          onAddReview={handleAddReview}
          onUpdateReview={handleUpdateReview}
          onDeleteReview={handleDeleteReview}
          onLikeReview={handleLikeReview}
          productId={id}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
