
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      await register({ name, username, email, password });
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Đăng ký thất bại!');
    }
  };

  return (
    <div className="register-page" style={{
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
      }}>Đăng ký</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500, color: '#1976d2' }}>Họ tên:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
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
          <label style={{ fontWeight: 500, color: '#1976d2' }}>Tên đăng nhập:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
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
          <label style={{ fontWeight: 500, color: '#1976d2' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500, color: '#1976d2' }}>Xác nhận mật khẩu:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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
        }}>Đăng ký</button>
      </form>
      <p style={{ marginTop: 18, textAlign: 'center' }}>
        Đã có tài khoản? <Link to="/login" style={{ color: '#1976d2', fontWeight: 500 }}>Đăng nhập</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
