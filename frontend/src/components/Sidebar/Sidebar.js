import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Shield, 
  FileText,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  const [expandedSection, setExpandedSection] = useState('account');

  const menuSections = {
    account: {
      id: 'account',
      title: 'Tài khoản của tôi',
      icon: User,
      items: [
        { id: 'profile', label: 'Hồ sơ', icon: User },
        { id: 'address', label: 'Địa chỉ', icon: MapPin },
        { id: 'privacy', label: 'Những Thiết Lập Riêng Tư', icon: Shield },
        { id: 'info', label: 'Thông tin cá nhân', icon: FileText },
      ],
    },
    orders: {
      id: 'orders',
      title: 'Đơn hàng của tôi',
      icon: ShoppingBag,
      items: [
        { id: 'all-orders', label: 'Tất cả đơn', icon: ShoppingBag, href: '/my-orders' },
        { id: 'processing', label: 'Chờ xử lý', icon: Clock, href: '/my-orders?status=processing' },
        { id: 'shipping', label: 'Đang giao', icon: Truck, href: '/my-orders?status=shipping' },
        { id: 'completed', label: 'Đã giao', icon: CheckCircle, href: '/my-orders?status=completed' },
        { id: 'cancelled', label: 'Đã hủy', icon: XCircle, href: '/my-orders?status=cancelled' },
      ],
    },
  };

  const MenuItem = ({ item }) => {
    const navigate = useNavigate();
    const isActive = activeTab === item.id;
    const IconComponent = item.icon;

    const handleClick = () => {
      if (item.href) {
        navigate(item.href);
      }
      onTabChange(item.id);
    };
    
    return (
      <button
        onClick={() => {
          onTabChange(item.id);
          if (item.href) {
            navigate(item.href);
          }
        }}
        className={`sidebar-menu-item ${isActive ? 'sidebar-menu-item--active' : ''}`}
      >
        <IconComponent className="sidebar-menu-item__icon" size={16} />
        <span className="sidebar-menu-item__label">{item.label}</span>
      </button>
    );
  };

  const SectionHeader = ({ section }) => {
    const isExpanded = expandedSection === section.id;
    const SectionIcon = section.icon;
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
    
    return (
      <button
        onClick={() => setExpandedSection(isExpanded ? '' : section.id)}
        className="sidebar-section-header"
      >
        <div className="sidebar-section-header__content">
          <SectionIcon className="sidebar-section-header__icon" size={18} />
          <span className="sidebar-section-header__title">{section.title}</span>
        </div>
        <ChevronIcon className="sidebar-section-header__chevron" size={16} />
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {Object.values(menuSections).map((section) => (
          <div key={section.id} className="sidebar-section">
            <SectionHeader section={section} />
            {expandedSection === section.id && (
              <div className="sidebar-submenu">
                {section.items.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;