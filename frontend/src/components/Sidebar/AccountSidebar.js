import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountSidebar.css';

const AccountSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <aside className="orders-sidebar">
      <div
        className="orders-sidebar-title"
        onClick={() => setActiveTab('profile')}
      >
        Tài khoản của tôi
      </div>
      <div className="orders-sidebar-list">
        <div
          className={`orders-sidebar-item${activeTab === 'profile' ? ' active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Hồ sơ
        </div>
        <div
          className={`orders-sidebar-item${activeTab === 'address' ? ' active' : ''}`}
          onClick={() => setActiveTab('address')}
        >
          Địa chỉ
        </div>
        <div
          className={`orders-sidebar-item${activeTab === 'privacy' ? ' active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          Những Thiết Lập Riêng Tư
        </div>
        <div
          className={`orders-sidebar-item${activeTab === 'info' ? ' active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Thông tin cá nhân
        </div>
      </div>
      <div
        className="orders-sidebar-purchase"
        onClick={() => navigate('/my-orders')}
      >
        Đơn mua
      </div>
    </aside>
  );
};

export default AccountSidebar;
