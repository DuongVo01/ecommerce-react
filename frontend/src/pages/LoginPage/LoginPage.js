import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { loginUser } = React.useContext(require('../../UserContext').UserContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ login: loginField, password });
      // Lưu token vào localStorage để các API sau gửi đúng Authorization
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      console.log('User login:', res.data.user);
      loginUser(res.data.user);
      if (res.data.user.role === 'admin') {
        alert('Chào mừng Admin!');
        navigate('/admin');
      } else {
        alert('Đăng nhập thành công!');
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Đăng nhập thất bại!');
    }
  };

  return (
    <div className="login-page">
      <h1>Đăng nhập</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label>Email hoặc Tên đăng nhập:</label>
          <input
            type="text"
            value={loginField}
            onChange={e => setLoginField(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
      <p style={{ marginTop: 18, textAlign: 'center' }}>
        Chưa có tài khoản? <Link to="/register" className="register-link">Đăng ký</Link>
      </p>
      <p className="admin-note">
        Nếu bạn là Admin, sau khi đăng nhập sẽ được chuyển đến trang quản trị riêng.
      </p>
    </div>
  );
};

export default LoginPage;
