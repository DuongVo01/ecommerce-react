import React, { useEffect, useState, useContext } from 'react';
import './AdminOrders.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TableSortLabel, TablePagination, Button, Chip, useTheme
} from '@mui/material';
import { green, blue, orange, red } from '@mui/material/colors';
import { FaBoxOpen, FaSearch, FaSignOutAlt, FaHome, FaShoppingCart, FaHeadset, FaListAlt, FaUser } from 'react-icons/fa';

const API = 'http://localhost:5000/api/orders';

const statusColor = {
  shipping: blue[600],
  waiting: orange[600],
  completed: green[600]
};
const statusLabel = {
  shipping: 'Vận chuyển',
  waiting: 'Chờ giao hàng',
  completed: 'Hoàn thành'
};
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const AdminOrders = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user || user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
    axios.get(API + '/admin')
      .then(res => {
        // Chuyển dữ liệu về đúng format cho sort
        setOrders(res.data.map(o => ({
          ...o,
          id: o._id,
          user: o.userId?.email || o.userId,
          date: o.createdAt ? new Date(o.createdAt).toLocaleString() : '-',
          products: o.items.map(i => ({ name: i.productId?.name || i.productId, quantity: i.quantity })),
          total: o.total,
          status: o.status
        })));
        setLoading(false);
      });
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };
  const handleStatus = async (id, status) => {
    await axios.put(`${API}/${id}`, { status });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
    await axios.delete(`${API}/${id}`);
    setOrders(orders.filter(o => o.id !== id));
  };
  const handleSort = (property) => (event) => {
    setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div style={{ background: theme.palette.mode === 'dark' ? '#181818' : '#f6f8fa', minHeight: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      {/* Header giống trang sản phẩm */}
      <header className="admin-orders-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo192.png" alt="ShopStore" style={{ width: 40, height: 40, borderRadius: 8, boxShadow: '0 2px 8px #1976d233' }} />
          <span style={{ fontWeight: 700, fontSize: 22, color: '#d32f2f', letterSpacing: 1 }}>ShopStore Admin</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaHome /> Trang chủ</button>
          <button onClick={() => navigate('/admin/products')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaBoxOpen /> Sản phẩm</button>
          <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: '#d32f2f', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaShoppingCart /> Đơn hàng</button>
          <button onClick={() => navigate('/admin/categories')} style={{ background: 'none', border: 'none', color: '#388e3c', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaListAlt /> Danh mục</button>
          <button onClick={() => navigate('/admin/users')} style={{ background: 'none', border: 'none', color: '#d32f2f', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaUser /> Người dùng</button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="admin-search-bar">
            <FaSearch style={{ color: '#d32f2f', fontSize: 18, marginRight: 6 }} />
            <input type="text" placeholder="Tìm đơn hàng..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 15, width: 120 }} />
          </div>
          <button style={{ background: 'none', border: 'none', color: '#ff9800', fontSize: 22, cursor: 'pointer' }} title="Hỗ trợ khách hàng"><FaHeadset /></button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#d32f2f', fontSize: 22, cursor: 'pointer' }} title="Đăng xuất"><FaSignOutAlt /></button>
        </div>
      </header>
      {/* Banner */}
      <section style={{ width: '100%', background: 'linear-gradient(90deg, #d32f2f 60%, #ff9800 100%)', borderRadius: 0, margin: '0 0 32px 0', boxShadow: '0 4px 24px #d32f2f33', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, width: '100%', maxWidth: 1100, padding: '32px 24px' }}>
          <span role="img" aria-label="order" style={{ fontSize: 72, color: '#fff', background: '#d32f2f', borderRadius: 16, boxShadow: '0 2px 12px #0002', padding: 12 }}>📝</span>
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 36, marginBottom: 10, letterSpacing: 1 }}>Quản lý đơn hàng</h2>
            <p style={{ color: '#fff', fontSize: 18, marginBottom: 8, fontWeight: 400 }}>Kiểm soát, cập nhật và quản lý đơn hàng của hệ thống một cách chuyên nghiệp.</p>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 600, marginBottom: 10 }}>
              Tổng số đơn hàng: {orders.length}
            </div>
          </div>
        </div>
      </section>
      {/* Bảng danh sách đơn hàng */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'id' ? order : false}>
                <TableSortLabel active={orderBy === 'id'} direction={order} onClick={handleSort('id')}>Mã đơn</TableSortLabel>
              </TableCell>
              <TableCell>Người đặt</TableCell>
              <TableCell sortDirection={orderBy === 'date' ? order : false}>
                <TableSortLabel active={orderBy === 'date'} direction={order} onClick={handleSort('date')}>Ngày đặt</TableSortLabel>
              </TableCell>
              <TableCell>Sản phẩm</TableCell>
              <TableCell sortDirection={orderBy === 'total' ? order : false}>
                <TableSortLabel active={orderBy === 'total'} direction={order} onClick={handleSort('total')}>Tổng tiền</TableSortLabel>
              </TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .slice()
              .sort(getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {row.products.map((p, idx) => (
                        <li key={idx}>{p.name} x {p.quantity}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    {row.total.toLocaleString()}₫
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabel[row.status]}
                      sx={{ bgcolor: statusColor[row.status], color: '#fff', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" size="small" sx={{ bgcolor: blue[600], mr: 1 }} onClick={() => handleStatus(row.id, 'shipping')}>Vận chuyển</Button>
                    <Button variant="contained" size="small" sx={{ bgcolor: orange[600], color: '#fff', mr: 1 }} onClick={() => handleStatus(row.id, 'waiting')}>Chờ giao hàng</Button>
                    <Button variant="contained" size="small" sx={{ bgcolor: green[600], color: '#fff', mr: 1 }} onClick={() => handleStatus(row.id, 'completed')}>Hoàn thành</Button>
                    <Button variant="contained" size="small" sx={{ bgcolor: red[600], color: '#fff' }} onClick={() => handleDelete(row.id)}>Xóa</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );

  if (user === undefined) return <div>Đang kiểm tra quyền truy cập...</div>;
  if (!user || user.role !== 'admin') return null;
  if (loading) return <div>Đang tải đơn hàng...</div>;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: theme.palette.mode === 'dark' ? '#181818' : '#fff', boxShadow: 3, borderRadius: 3, mt: 3 }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'id' ? order : false}>
                <TableSortLabel active={orderBy === 'id'} direction={order} onClick={handleSort('id')}>Mã đơn</TableSortLabel>
              </TableCell>
              <TableCell>Người đặt</TableCell>
              <TableCell sortDirection={orderBy === 'date' ? order : false}>
                <TableSortLabel active={orderBy === 'date'} direction={order} onClick={handleSort('date')}>Ngày đặt</TableSortLabel>
              </TableCell>
              <TableCell>Sản phẩm</TableCell>
              <TableCell sortDirection={orderBy === 'total' ? order : false}>
                <TableSortLabel active={orderBy === 'total'} direction={order} onClick={handleSort('total')}>Tổng tiền</TableSortLabel>
              </TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .slice()
              .sort(getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {row.products.map((p, idx) => (
                        <li key={idx}>{p.name} x {p.quantity}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    {row.total.toLocaleString()}₫
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabel[row.status]}
                      sx={{ bgcolor: statusColor[row.status], color: '#fff', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" size="small" sx={{ bgcolor: blue[600], mr: 1 }} onClick={() => handleStatus(row.id, 'shipping')}>Vận chuyển</Button>
                    <Button variant="contained" size="small" sx={{ bgcolor: orange[600], color: '#fff', mr: 1 }} onClick={() => handleStatus(row.id, 'waiting')}>Chờ giao hàng</Button>
                    <Button variant="contained" size="small" sx={{ bgcolor: green[600], color: '#fff', mr: 1 }} onClick={() => handleStatus(row.id, 'completed')}>Hoàn thành</Button>
                    <Button variant="contained" size="small" sx={{ bgcolor: red[600], color: '#fff' }} onClick={() => handleDelete(row.id)}>Xóa</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default AdminOrders;
