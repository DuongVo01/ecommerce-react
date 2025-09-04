import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersSidebar.css';

const OrdersSidebar = ({ activeTab, setActiveTab, sidebarExpanded, setSidebarExpanded }) => {
  const navigate = useNavigate();

  return (
    <aside className={`orders-sidebar${!sidebarExpanded ? ' collapsed' : ''}`}>
      <div className="orders-sidebar-header">
        <div 
          className="orders-sidebar-title"
          onClick={() => navigate('/account')}
        >
          Đơn hàng của tôi
        </div>
        <button 
          className="sidebar-toggle" 
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
        >
          {sidebarExpanded ? '◄' : '►'}
        </button>
      </div>
      <div className="orders-sidebar-list">
        <div
          className={`orders-sidebar-item${activeTab === 'orders' ? ' active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Tất cả đơn
        </div>
        <div
          className={`orders-sidebar-item${activeTab === 'processing' ? ' active' : ''}`}
          onClick={() => setActiveTab('processing')}
        >
          Chờ xử lý
        </div>
        <div
          className={`orders-sidebar-item${activeTab === 'shipping' ? ' active' : ''}`}
          onClick={() => setActiveTab('shipping')}
        >
          Đang giao
        </div>
        <div
          className={`orders-sidebar-item${activeTab === 'completed' ? ' active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Đã giao
        </div>
        <div
          className={`orders-sidebar-item${activeTab === 'cancelled' ? ' active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Đã hủy
        </div>
      </div>
      <div
        className="orders-sidebar-profile"
        onClick={() => navigate('/account')}
      >
        Tài khoản của tôi
      </div>
    </aside>
  );
};

export default OrdersSidebar;
