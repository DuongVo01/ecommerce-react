import React from 'react';
import './HeroBanner.css';
import { useNavigate } from 'react-router-dom';

const HeroBanner = () => {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate('/products');
    // Có thể thêm hành động khác như theo dõi sự kiện tại đây nếu cần
  };

  return (
    <div className="hero-banner">
      <div className="hero-content">
        <h1>Chào mừng đến với ShopStore!</h1>
        <p>Khám phá hàng ngàn sản phẩm chất lượng với ưu đãi hấp dẫn.</p>
        <button className="hero-button" onClick={handleBuyNow}>
          Mua ngay
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;