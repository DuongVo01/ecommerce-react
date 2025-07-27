
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import { updateUser } from "../services/api";
import "./AccountPage.css";

const AccountPage = () => {
  const { user, loginUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [birthday, setBirthday] = useState(user?.birthday ? user.birthday.slice(0,10) : "");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="account-container">
        <div className="account-form" style={{ textAlign: "center", maxWidth: 400 }}>
          <h2 className="account-title">Tài khoản của tôi</h2>
          <p style={{ color: "#374151", fontWeight: 500, marginBottom: 18 }}>Bạn chưa đăng nhập.</p>
          <Link to="/login" className="account-btn" style={{ marginTop: 24 }}>Đăng nhập</Link>
        </div>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUser(user._id || user.id, {
        name,
        phone,
        gender,
        birthday
      });
      loginUser({ ...user, name, phone, gender, birthday });
      setSaving(false);
      alert("Đã lưu thông tin hồ sơ!");
    } catch (err) {
      setSaving(false);
      alert("Lưu thất bại! Vui lòng thử lại.");
    }
  };

  // ...existing code...

  // Nội dung từng tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form className="account-form" onSubmit={handleSave} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%' }}>
            <h2 className="account-title">Hồ sơ của tôi</h2>
            <div className="account-desc">Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
            <div className="account-row">
              <strong>Tên đăng nhập:</strong> <span style={{ color: "#1976d2", fontWeight: 600 }}>{user.username || "-"}</span>
            </div>
            <div className="account-row">
              <strong>Tên:</strong>
              <input
                className="account-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="account-row">
              <strong>Email:</strong> <span style={{ color: "#374151", fontWeight: 500 }}>{user.email || "-"}</span>
            </div>
            <div className="account-row">
              <strong>Số điện thoại:</strong>
              <input
                className="account-input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                pattern="[0-9]{10,11}"
                required
              />
            </div>
            <div className="account-row">
              <strong>Giới tính:</strong>
              <select
                className="account-select"
                value={gender}
                onChange={e => setGender(e.target.value)}
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="account-row">
              <strong>Ngày sinh:</strong>
              <input
                className="account-input"
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="account-btn"
              disabled={saving}
            >{saving ? "Đang lưu..." : "Lưu thông tin"}</button>
          </form>
        );
      case 'address':
        return (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%', textAlign: 'center' }}>
            <h2 className="account-title">Địa chỉ</h2>
            <div className="account-desc">Quản lý địa chỉ nhận hàng của bạn tại đây.</div>
            <div style={{ color: '#888', marginTop: 24 }}>Chức năng này sẽ được phát triển sau.</div>
          </div>
        );
      case 'privacy':
        return (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%', textAlign: 'center' }}>
            <h2 className="account-title">Thiết Lập Riêng Tư</h2>
            <div className="account-desc">Quản lý các thiết lập bảo mật và quyền riêng tư.</div>
            <div style={{ color: '#888', marginTop: 24 }}>Chức năng này sẽ được phát triển sau.</div>
          </div>
        );
      case 'info':
        return (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%', textAlign: 'center' }}>
            <h2 className="account-title">Thông tin cá nhân</h2>
            <div className="account-desc">Xem thông tin cá nhân của bạn.</div>
            <div style={{ color: '#888', marginTop: 24 }}>Chức năng này sẽ được phát triển sau.</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="orders-container">
      {/* Sidebar */}
      <aside className="orders-sidebar">
        <div
          className="orders-sidebar-title"
          onClick={() => setActiveTab('profile')}
        >Tài khoản của tôi</div>
        <div className="orders-sidebar-list">
          <div
            className={`orders-sidebar-item${activeTab === 'profile' ? ' active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >Hồ sơ</div>
          <div
            className={`orders-sidebar-item${activeTab === 'address' ? ' active' : ''}`}
            onClick={() => setActiveTab('address')}
          >Địa chỉ</div>
          <div
            className={`orders-sidebar-item${activeTab === 'privacy' ? ' active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >Những Thiết Lập Riêng Tư</div>
          <div
            className={`orders-sidebar-item${activeTab === 'info' ? ' active' : ''}`}
            onClick={() => setActiveTab('info')}
          >Thông tin cá nhân</div>
        </div>
        <div
          className="orders-sidebar-purchase"
          onClick={() => navigate('/my-orders')}
        >Đơn mua</div>
      </aside>
      {/* Main content: Tab content */}
      <div className="orders-main">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AccountPage;
