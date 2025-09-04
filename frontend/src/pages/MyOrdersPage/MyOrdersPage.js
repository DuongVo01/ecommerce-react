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

  // Get current status from URL or active tab
  const currentStatus = searchParams.get('status') || 'all';
  
  // Filter orders based on status, search, and date
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by status
    if (currentStatus && currentStatus !== 'all') {
      filtered = filtered.filter(order => order.status === currentStatus);
    }

    // Filter by search query
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

    // Filter by date
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
          filterDate = null;
      }
      
      if (filterDate) {
        filtered = filtered.filter(order => 
          new Date(order.createdAt) >= filterDate
        );
      }
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, currentStatus, searchQuery, dateFilter]);

  // Status statistics
  const orderStats = useMemo(() => {
    const stats = {
      all: orders.length,
      processing: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0
    };
    
    orders.forEach(order => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status]++;
      }
    });
    
    return stats;
  }, [orders]);

  const fetchOrders = async () => {
    if (!user || !(user._id || user.id)) {
      setError('Không tìm thấy thông tin người dùng');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await getOrders(user._id || user.id);
      
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Update URL based on tab selection
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
      processing: 'Đang xử lý',
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
    // Sync active tab with URL
    const status = searchParams.get('status');
    if (status) {
      setActiveTab(status);
    } else {
      setActiveTab('all-orders');
    }
  }, [searchParams]);

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
              <div style={{ height: '32px', backgroundColor: '#e5e7eb', borderRadius: '8px', width: '33%', marginBottom: '24px' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: '128px', backgroundColor: '#e5e7eb', borderRadius: '8px' }}></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f9fafb' 
      }}>
        <div style={{ 
          maxWidth: '448px', 
          width: '100%', 
          textAlign: 'center', 
          padding: '32px', 
          backgroundColor: 'white', 
          borderRadius: '24px', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#dbeafe', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px' 
          }}>
            <ShoppingBag style={{ width: '32px', height: '32px', color: '#2563eb' }} />
          </div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#111827', 
            marginBottom: '16px' 
          }}>
            Đăng nhập để xem đơn hàng
          </h2>
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '24px', 
            lineHeight: '1.6' 
          }}>
            Bạn cần đăng nhập để theo dõi và quản lý các đơn hàng của mình
          </p>
          <button
            onClick={() => navigate('/login', { 
              state: { returnUrl: window.location.pathname + window.location.search }
            })}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: '500',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                  Đơn mua của tôi
                </h1>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
                  Quản lý và theo dõi tất cả đơn hàng của bạn
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.color = '#111827';
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#6b7280';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <RefreshCw style={{ width: '16px', height: '16px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                Làm mới
              </button>
            </div>

            {/* Order Statistics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              {Object.entries(orderStats).map(([status, count]) => {
                const getStatusConfig = (status) => {
                  switch(status) {
                    case 'all': return { 
                      icon: ShoppingBag, 
                      bg: '#eff6ff', 
                      iconColor: '#2563eb',
                      label: 'Tổng cộng' 
                    };
                    case 'processing': return { 
                      icon: Clock, 
                      bg: '#fffbeb', 
                      iconColor: '#d97706',
                      label: 'Đang xử lý' 
                    };
                    case 'shipping': return { 
                      icon: Package, 
                      bg: '#eef2ff', 
                      iconColor: '#4f46e5',
                      label: 'Đang giao' 
                    };
                    case 'completed': return { 
                      icon: CheckCircle, 
                      bg: '#f0fdf4', 
                      iconColor: '#16a34a',
                      label: 'Hoàn thành' 
                    };
                    case 'cancelled': return { 
                      icon: XCircle, 
                      bg: '#fef2f2', 
                      iconColor: '#dc2626',
                      label: 'Đã hủy' 
                    };
                    default: return { 
                      icon: ShoppingBag, 
                      bg: '#f9fafb', 
                      iconColor: '#6b7280',
                      label: status 
                    };
                  }
                };
                
                const config = getStatusConfig(status);
                const IconComponent = config.icon;
                
                return (
                  <div key={status} style={{
                    backgroundColor: config.bg,
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <IconComponent style={{ width: '24px', height: '24px', color: config.iconColor }} />
                      <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{count}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      {config.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Search */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <Search style={{ height: '20px', width: '20px', color: '#9ca3af' }} />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng theo ID, sản phẩm, hoặc tên người nhận..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                    fontSize: '16px',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #d1d5db'
              }}>
                <Calendar style={{ color: '#6b7280', width: '20px', height: '20px' }} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
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
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{
              background: 'linear-gradient(to right, #eff6ff, #eef2ff)',
              padding: '24px',
              borderBottom: '1px solid #f3f4f6',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Package style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {getStatusDisplay()}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {filteredOrders.length} đơn hàng được tìm thấy
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Tổng giá trị</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    {filteredOrders.reduce((total, order) => total + (order.totalAmount || 0), 0).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {error && (
                <div style={{
                  marginBottom: '24px',
                  padding: '24px',
                  background: 'linear-gradient(to right, #fef2f2, #fdf2f8)',
                  border: '1px solid #fecaca',
                  borderRadius: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#fee2e2',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <AlertCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#991b1b', fontWeight: '600', marginBottom: '4px', margin: 0 }}>Có lỗi xảy ra</h4>
                      <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '12px', margin: '4px 0 12px 0' }}>{error}</p>
                      <button
                        onClick={handleRefresh}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#b91c1c',
                          backgroundColor: '#fee2e2',
                          border: 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#fecaca'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#fee2e2'}
                      >
                        <RefreshCw style={{ width: '16px', height: '16px' }} />
                        Thử lại
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
                  <div style={{
                    width: '128px',
                    height: '128px',
                    background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px'
                  }}>
                    <ShoppingBag style={{ width: '64px', height: '64px', color: '#93c5fd' }} />
                  </div>
                  
                  {searchQuery || dateFilter !== 'all' ? (
                    <div style={{ maxWidth: '448px', margin: '0 auto' }}>
                      <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                        Không tìm thấy đơn hàng nào
                      </h3>
                      <p style={{ color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm được đơn hàng bạn cần
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setDateFilter('all');
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 24px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          fontWeight: '500',
                          border: 'none',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#1d4ed8';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#2563eb';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <Filter style={{ width: '16px', height: '16px' }} />
                        Xóa tất cả bộ lọc
                      </button>
                    </div>
                  ) : (
                    <div style={{ maxWidth: '512px', margin: '0 auto' }}>
                      <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                        {currentStatus === 'all' ? 'Chưa có đơn hàng nào' : `Chưa có đơn hàng ${getStatusDisplay().toLowerCase()}`}
                      </h3>
                      <p style={{ color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
                        Khám phá hàng ngàn sản phẩm chất lượng và tạo đơn hàng đầu tiên của bạn ngay hôm nay
                      </p>
                      <button
                        onClick={() => navigate('/')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px 32px',
                          background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                          color: 'white',
                          fontWeight: '600',
                          border: 'none',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #1d4ed8, #4338ca)';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #2563eb, #4f46e5)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <ShoppingBag style={{ width: '20px', height: '20px' }} />
                        Bắt đầu mua sắm
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onStatusUpdate={fetchOrders}
                    />
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