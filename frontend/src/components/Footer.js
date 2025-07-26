import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      {/* Thêm các section nội dung tại đây */}
      <div className="footer-section">
        <h4>Về chúng tôi</h4>
        <p>Shop chuyên cung cấp sản phẩm chất lượng, giá tốt.</p>
      </div>
      <div className="footer-section">
        <h4>Liên hệ</h4>
        <p>Email: votrungduong1@gmail.com</p>
        <p>Hotline: 0363 606 398</p>
      </div>
      <div className="footer-section">
        <h4>Kết nối</h4>
        <a href="https://www.facebook.com/duong.vo.881060/?locale=vi_VN" target="_blank" rel="noopener noreferrer">Facebook</a> |
        <a href="https://www.linkedin.com/in/duongvo1" target="_blank" rel="noopener noreferrer">LinkedIn</a> |
        <a href="#">Instagram</a>
      </div>
    </div>
    <div className="footer-bottom">
      © 2025 Your Company. All rights reserved.
    </div>
  </footer>
);

export default Footer;