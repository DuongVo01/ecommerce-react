import React from 'react';
import './PromotionBanner.css';

const PromotionBanner = () => {
  return (
    <div className="promotion-banner">
      <div className="promotion-content">
        <h2>Ưu đãi đặc biệt!</h2>
        <p>Giảm giá lên đến <span className="highlight">50%</span> cho hàng trăm sản phẩm.</p>
        <button className="promotion-btn">Xem ngay</button>
      </div>
    </div>
  );
};

export default PromotionBanner; 