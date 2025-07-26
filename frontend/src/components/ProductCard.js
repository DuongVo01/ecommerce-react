





import React from 'react';
import './ProductCard.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleBuyNow = (e) => {
    e.stopPropagation(); // Không chuyển trang khi bấm nút
    addToCart(product);
    showToast('Đã thêm vào giỏ hàng!');
  };

  const handleCardClick = () => {
    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <img src={product.image ? `http://localhost:5000${product.image}` : ''} alt={product.name} className="product-image" />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-shortdesc">{product.shortDesc}</p>
      <p className="product-price">{Number(product.price).toLocaleString('vi-VN')}₫</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {/* Nút 'Mua ngay' không chuyển trang */}
        <button className="product-buy-btn" onClick={handleBuyNow}>Mua ngay</button>
      </div>
    </div>
  );
};

export default ProductCard;