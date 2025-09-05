import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../../CartContext';
import { useToast } from '../../ToastContext';
import { api } from '../../services/api';
import './ProductDetailPage.css';

/**
 * ProductDetailPage Component
 * Hiển thị chi tiết sản phẩm bao gồm hình ảnh, thông tin và chức năng thêm vào giỏ hàng
 */
const ProductDetailPage = () => {
  // Lấy id sản phẩm từ URL params
  const { id } = useParams();
  
  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  
  // Hooks
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Fetch dữ liệu sản phẩm khi component mount hoặc id thay đổi
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        showToast('Không thể tải thông tin sản phẩm', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, showToast]);

  // Xử lý tăng giảm số lượng
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    // Kiểm tra số lượng tồn kho
    if (quantity > (product?.stock || 0)) {
      showToast('Số lượng vượt quá tồn kho!', 'error');
      return;
    }

    // Truyền sản phẩm và số lượng cần thêm
    addToCart(product, quantity);
    showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    
    // Log thông tin cho mục đích debug
    console.log('Added to cart:', {
      productId: product._id,
      name: product.name,
      quantity: quantity,
      price: product.price
    });

    // Reset số lượng về 1 sau khi thêm thành công
    setQuantity(1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-page loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Error state - sản phẩm không tồn tại
  if (!product) {
    return (
      <div className="product-detail-page error">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm này có thể đã bị xóa hoặc không tồn tại</p>
      </div>
    );
  }

  // Tính giá khuyến mãi nếu có
  const discountedPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Phần hình ảnh */}
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

        {/* Phần thông tin sản phẩm */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-category">
              Danh mục: <span>{product.category}</span>
            </div>
          </div>

          {/* Phần giá */}
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

          {/* Mô tả ngắn */}
          <div className="product-short-desc">
            <p>{product.shortDesc}</p>
          </div>

          {/* Chọn số lượng và thêm vào giỏ */}
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

          {/* Tình trạng kho */}
          <div className="product-stock">
            Tình trạng: <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </span>
          </div>

          {/* Mô tả chi tiết */}
          <div className="product-description">
            <h3>Mô tả sản phẩm</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
