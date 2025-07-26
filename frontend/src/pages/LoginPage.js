
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
    <div className="login-page" style={{
      maxWidth: 400,
      margin: '40px auto',
      padding: 28,
      border: '1px solid #e3eafc',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(25,118,210,0.10)',
      background: 'linear-gradient(135deg, #e3eafc 0%, #fff 100%)',
    }}>
      <h1 style={{
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '2rem',
        color: '#1976d2',
        marginBottom: 24,
      }}>Đăng nhập</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500, color: '#1976d2' }}>Email hoặc Tên đăng nhập:</label>
          <input
            type="text"
            value={loginField}
            onChange={e => setLoginField(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              marginTop: 6,
              border: '1.5px solid #e3eafc',
              borderRadius: 8,
              fontSize: '1rem',
              outline: 'none',
              background: '#f8fafc',
              color: '#334155',
              transition: 'border 0.2s',
            }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500, color: '#1976d2' }}>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              marginTop: 6,
              border: '1.5px solid #e3eafc',
              borderRadius: 8,
              fontSize: '1rem',
              outline: 'none',
              background: '#f8fafc',
              color: '#334155',
              transition: 'border 0.2s',
            }}
          />
        </div>
        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(90deg, #1976d2 60%, #2196f3 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '1.08rem',
          boxShadow: '0 2px 8px #1976d233',
          marginTop: 8,
          marginBottom: 4,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}>Đăng nhập</button>
      </form>
      <p style={{ marginTop: 18, textAlign: 'center' }}>
        Chưa có tài khoản? <Link to="/register" style={{ color: '#1976d2', fontWeight: 500 }}>Đăng ký</Link>
      </p>
      <p style={{ marginTop: 12, color: '#d32f2f', fontWeight: 'bold', textAlign: 'center', fontSize: '0.98rem' }}>
        Nếu bạn là Admin, sau khi đăng nhập sẽ được chuyển đến trang quản trị riêng.
      </p>
    </div>
  );
};

export default LoginPage;
