
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const LoginPage = () => {
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { loginUser } = React.useContext(require('../UserContext').UserContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ login: loginField, password });
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
    <div className="login-page" style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h1>Đăng nhập</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email hoặc Tên đăng nhập:</label>
          <input
            type="text"
            value={loginField}
            onChange={e => setLoginField(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Đăng nhập</button>
      </form>
      <p style={{ marginTop: 16 }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
      <p style={{ marginTop: 16, color: '#d32f2f', fontWeight: 'bold' }}>
        {`Nếu bạn là Admin, sau khi đăng nhập sẽ được chuyển đến trang quản trị riêng.`}
      </p>
    </div>
  );
};

export default LoginPage;
