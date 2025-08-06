import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './Navbar.css'; // Import file CSS


const Navbar = () => {
  const { user, logoutUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src="/logo192.png" alt="ShopStore" style={{ height: 36, marginRight: 10, verticalAlign: 'middle' }} />
            <span style={{ fontWeight: 700, fontSize: 22, color: '#1976d2', letterSpacing: 1 }}>ShopStore</span>
          </Link>
        </div>
        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="navbar-toggle-icon">☰</span>
        </button>
        <ul className={`navbar-list${menuOpen ? ' open' : ''}`}>
          <li className="navbar-item"><Link to="/">Trang chủ</Link></li>
          <li className="navbar-item"><Link to="/products">Sản phẩm</Link></li>
          <li className="navbar-item"><Link to="/cart">Giỏ hàng</Link></li>
          {user && user.role === 'admin' && (
            <li className="navbar-item"><Link to="/admin">Admin</Link></li>
          )}
          {!user ? (
            <li className="navbar-item"><Link to="/login" className="navbar-btn">Đăng nhập</Link></li>
          ) : (
            <li className="navbar-item navbar-dropdown">
              <button className="navbar-dropdown-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <img
                  src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.avatar}`) : '/default-avatar.png'}
                  alt="Avatar"
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 1px 4px #1976d211', border: '2px solid #e3eafc', marginRight: 4 }}
                />
                <span style={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>{user.username || user.email}</span>
                <span style={{fontSize:'1.2em'}}>▼</span>
              </button>
              {menuOpen && (
                <ul className="navbar-dropdown-menu">
                  <li><Link to="/account" onClick={()=>setMenuOpen(false)}>Tài khoản của tôi</Link></li>
                  <li><Link to="/my-orders" onClick={()=>setMenuOpen(false)}>Đơn mua của tôi</Link></li>
                  <li><button onClick={()=>{setMenuOpen(false);handleLogout();}} style={{ background: '#fdecea', color: '#d32f2f', width:'100%', textAlign:'left', border:'none', padding:'0.5rem 1rem', borderRadius:'6px', cursor:'pointer'}}>Đăng xuất</button></li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 