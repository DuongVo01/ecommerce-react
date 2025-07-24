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
            <>
              <li className="navbar-item">Xin chào, <b>{user.username || user.email}</b></li>
              <li className="navbar-item"><button onClick={handleLogout} className="navbar-btn" style={{ background: '#fdecea', color: '#d32f2f' }}>Đăng xuất</button></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 