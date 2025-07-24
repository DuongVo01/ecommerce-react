import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Về chúng tôi</h4>
          <p>Website thương mại điện tử mẫu cho mục đích học tập.</p>
        </div>
        <div className="footer-section">
          <h4>Liên hệ</h4>
          <p>Email: votrungduong1@gmail.com</p>
          <p>SĐT: 0363 606 398</p>
        </div>
        <div className="footer-section">
          <h4>Chính sách</h4>
          <p>Chính sách bảo mật</p>
          <p>Chính sách đổi trả</p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Project ShopOnline. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 