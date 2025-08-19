
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/api';
import './RegisterPage.css';
const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const { loginUser } = React.useContext(require('../../UserContext').UserContext);
  const { login } = require('../../services/api');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      await register({ name, username, email, password });
      // Đăng nhập tự động sau khi đăng ký thành công
      const res = await login({ login: username, password });
      loginUser(res.data.user);
      alert('Đăng ký và đăng nhập thành công!');
      navigate('/account');
    } catch (err) {
      alert(err.response?.data?.error || 'Đăng ký thất bại!');
    }
  };
  return (
    <div className="register-page">
      <h1>Đăng ký</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label>Họ tên:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
        <div style={{ marginBottom: 18 }}>
          <label>Xác nhận mật khẩu:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng ký</button>
      </form>
      <p style={{ marginTop: 18, textAlign: 'center' }}>
        Đã có tài khoản? <Link to="/login" className="login-link">Đăng nhập</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
