import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import axios from 'axios';

const API = 'http://localhost:5000/api/orders';

const AdminOrders = () => {
  const { user } = React.useContext(UserContext);
  console.log('Current user (AdminOrders):', user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return; // Đợi user xác định
    if (!user || user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
    axios.get(API + '/admin')
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      });
  }, [user, navigate]);

  if (user === undefined) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user || user.role !== 'admin') return null;

  const handleStatus = async (id, status) => {
    await axios.put(`${API}/${id}`, { status });
    window.location.reload();
  };

  if (loading) return <div>Đang tải đơn hàng...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h2>Quản lý đơn hàng</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', background: '#fff' }}>
        <thead>
          <tr>
            <th>Người đặt</th>
            <th>Sản phẩm</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order.userId?.email || order.userId}</td>
              <td>
                {order.items.map(item => (
                  <div key={item.productId?._id || item.productId}>
                    {(item.productId && item.productId.name) ? item.productId.name : String(item.productId)} x {item.quantity}
                  </div>
                ))}
              </td>
              <td>{order.total}</td>
              <td>{order.status}</td>
              <td>
                <button onClick={() => handleStatus(order._id, 'completed')}>Hoàn thành</button>
                <button onClick={() => handleStatus(order._id, 'pending')}>Chờ xử lý</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;
