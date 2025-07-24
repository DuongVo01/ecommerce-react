import React from 'react';
import './HeroBanner.css';


import { useNavigate } from 'react-router-dom';

const HeroBanner = () => {
  const navigate = useNavigate();
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <h1>Chào mừng đến với cửa hàng!</h1>
        <p>Khám phá hàng ngàn sản phẩm chất lượng.</p>
        <button className="hero-button" onClick={() => navigate('/products')}>Mua ngay</button>
      </div>
    </div>
  );
};

export default HeroBanner; 