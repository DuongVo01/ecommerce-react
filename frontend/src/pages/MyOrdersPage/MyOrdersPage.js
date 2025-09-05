import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import { getOrders } from '../../services/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import OrderCard from '../../components/OrderCard/OrderCard';
import {
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(() => {
    const status = searchParams.get('status');
    return status ? `${status}` : 'all-orders';
  });

  const currentStatus = searchParams.get('status') || 'all';

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (currentStatus && currentStatus !== 'all') {
      filtered = filtered.filter(order => {
        switch (currentStatus) {
          case 'processing':
            return ['pending', 'confirmed', 'waiting'].includes(order.status);
          case 'shipping':
            return order.status === 'shipping';
          case 'completed':
            return ['delivered', 'completed'].includes(order.status);
          case 'cancelled':
            return order.status === 'cancelled';
          default:
            return true;
        }
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(query) ||
        order.items?.some(item =>
          item.product?.name?.toLowerCase().includes(query)
        ) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(query)
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      filtered = filtered.filter(order =>
        new Date(order.createdAt) >= filterDate
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, currentStatus, searchQuery, dateFilter]);

  const orderStats = useMemo(() => {
    const stats = {
      all: orders.length,
      processing: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      // Chờ xử lý: pending, confirmed, waiting
      if (order.status === 'pending' || order.status === 'confirmed' || order.status === 'waiting') {
        stats.processing++;
      }
      // Đang giao: shipping
      else if (order.status === 'shipping') {
        stats.shipping++;
      }
      // Hoàn thành: delivered, completed
      else if (order.status === 'delivered' || order.status === 'completed') {
        stats.completed++;
      }
      // Đã hủy: cancelled
      else if (order.status === 'cancelled') {
        stats.cancelled++;
      }
    });
    
    return stats;
  }, [orders]);

  const fetchOrders = async () => {
    if (!user || !(user._id || user.id)) {
      navigate('/login', { 
        state: { 
          returnUrl: window.location.pathname + window.location.search,
          message: 'Vui lòng đăng nhập để xem đơn hàng của bạn'
        } 
      });
      return;
    }
    try {
      setError(null);
      setLoading(true);
      
      // Verify token first
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      const res = await getOrders(user._id || user.id);
      
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        navigate('/login', { 
          state: { 
            returnUrl: window.location.pathname + window.location.search,
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          } 
        });
      } else {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải đơn hàng. Vui lòng thử lại sau.');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const statusMap = {
      'all-orders': null,
      'processing': 'processing',
      'shipping': 'shipping',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    const status = statusMap[tabId];
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchOrders();
  };

  const getStatusDisplay = () => {
    const statusLabels = {
      all: 'Tất cả đơn hàng',
      processing: 'Chờ xử lý',
      shipping: 'Đang giao',
      completed: 'Đã hoàn thành',
      cancelled: 'Đã hủy'
    };
    return statusLabels[currentStatus] || 'Tất cả đơn hàng';
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setActiveTab(status);
    } else {
      setActiveTab('all-orders');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="loading-container">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="loading-main">
          <div className="loading-wrapper">
            <div className="skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton-item"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-icon">
            <ShoppingBag className="icon-blue" />
          </div>
          <h2 className="login-title">Đăng nhập để xem đơn hàng</h2>
          <p className="login-text">
            Bạn cần đăng nhập để theo dõi và quản lý các đơn hàng của mình
          </p>
          <button
            className="btn-login"
            onClick={() => navigate('/login', {
              state: { returnUrl: window.location.pathname + window.location.search }
            })}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="page-main">
        <div className="page-wrapper">
          {/* Header */}
          <div className="card header-card">
            <div className="header-top">
              <div>
                <h1 className="page-title">Đơn mua của tôi</h1>
                <p className="page-subtitle">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-refresh"
              >
                <RefreshCw className={loading ? 'icon-spin' : ''} />
                Làm mới
              </button>
            </div>

            {/* Order Statistics */}
            <div className="stats-grid">
              {Object.entries(orderStats).map(([status, count]) => {
                const getStatusConfig = (status) => {
                  switch (status) {
                    case 'all': return { icon: ShoppingBag, bg: 'bg-blue', iconColor: 'icon-blue', label: 'Tổng cộng' };
                    case 'processing': return { icon: Clock, bg: 'bg-yellow', iconColor: 'icon-yellow', label: 'Chờ xử lý' };
                    case 'shipping': return { icon: Package, bg: 'bg-indigo', iconColor: 'icon-indigo', label: 'Đang giao' };
                    case 'completed': return { icon: CheckCircle, bg: 'bg-green', iconColor: 'icon-green', label: 'Hoàn thành' };
                    case 'cancelled': return { icon: XCircle, bg: 'bg-red', iconColor: 'icon-red', label: 'Đã hủy' };
                    default: return { icon: ShoppingBag, bg: 'bg-gray', iconColor: 'icon-gray', label: status };
                  }
                };
                const config = getStatusConfig(status);
                const IconComponent = config.icon;
                const statusToTab = {
                  all: 'all-orders',
                  processing: 'processing',
                  shipping: 'shipping',
                  completed: 'completed',
                  cancelled: 'cancelled'
                };
                
                return (
                  <div 
                    key={status} 
                    className={`stat-card ${config.bg} ${activeTab === statusToTab[status] ? 'active' : ''}`}
                    onClick={() => handleTabChange(statusToTab[status])}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stat-top">
                      <IconComponent className={config.iconColor} />
                      <span className="stat-count">{count}</span>
                    </div>
                    <div className="stat-label">{config.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="card filter-card">
            <div className="filter-wrapper">
              <div className="search-box">
                <div className="search-icon">
                  <Search />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng theo ID, sản phẩm, hoặc tên người nhận..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear">✕</button>
                )}
              </div>

              <div className="date-filter">
                <Calendar className="date-icon" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="date-select"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                  <option value="3months">3 tháng qua</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="card content-card">
            <div className="content-header">
              <div className="content-left">
                <div className="content-icon">
                  <Package className="icon-blue" />
                </div>
                <div>
                  <h2 className="content-title">{getStatusDisplay()}</h2>
                  <p className="content-subtitle">{filteredOrders.length} đơn hàng được tìm thấy</p>
                </div>
              </div>
              <div className="content-right">
                <div className="total-label">Tổng giá trị</div>
                <div className="total-value">
                  {filteredOrders.reduce((total, order) => total + (order.totalAmount || 0), 0).toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>

            <div className="content-body">
              {error && (
                <div className="error-box">
                  <div className="error-row">
                    <div className="error-icon">
                      <AlertCircle className="icon-red" />
                    </div>
                    <div className="error-text">
                      <h4>Có lỗi xảy ra</h4>
                      <p>{error}</p>
                      <button onClick={handleRefresh} className="btn-retry">
                        <RefreshCw /> Thử lại
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {filteredOrders.length === 0 ? (
                <div className="empty-box">
                  <div className="empty-icon">
                    <ShoppingBag className="icon-empty" />
                  </div>
                  {searchQuery || dateFilter !== 'all' ? (
                    <div className="empty-filter">
                      <h3>Không tìm thấy đơn hàng nào</h3>
                      <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm được đơn hàng bạn cần</p>
                      <button
                        onClick={() => { setSearchQuery(''); setDateFilter('all'); }}
                        className="btn-clear-filter"
                      >
                        <Filter /> Xóa tất cả bộ lọc
                      </button>
                    </div>
                  ) : (
                    <div className="empty-default">
                      <h3>{currentStatus === 'all' ? 'Chưa có đơn hàng nào' : `Chưa có đơn hàng ${getStatusDisplay().toLowerCase()}`}</h3>
                      <p>Khám phá hàng ngàn sản phẩm chất lượng và tạo đơn hàng đầu tiên của bạn ngay hôm nay</p>
                      <button onClick={() => navigate('/')} className="btn-shopping">
                        <ShoppingBag /> Bắt đầu mua sắm
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="orders-list">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyOrdersPage;
