
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
  // Địa chỉ
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', address: '' });
  const [editAddressId, setEditAddressId] = useState(null);

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
            <h2 className="account-title">Địa chỉ nhận hàng</h2>
            <div className="account-desc">Quản lý địa chỉ nhận hàng của bạn tại đây.</div>
            {/* Danh sách địa chỉ */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0' }}>
              {addresses.length === 0 && <li style={{ color: '#888', marginBottom: 12 }}>Chưa có địa chỉ nào.</li>}
              {addresses.map((addr, idx) => (
                <li key={idx} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 16px', marginBottom: 10, boxShadow: '0 1px 4px #1976d211', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div><strong>{addr.name}</strong> <span style={{ color: '#1976d2', fontWeight: 500 }}>{addr.phone}</span></div>
                    <div style={{ color: '#374151', fontSize: 15 }}>{addr.address}</div>
                  </div>
                  <div>
                    <button style={{ background: '#e3eafc', color: '#1976d2', border: 'none', borderRadius: 6, padding: '6px 14px', marginRight: 8, cursor: 'pointer', fontWeight: 500 }} onClick={() => { setEditAddressId(idx); setAddressForm(addr); }}>Sửa</button>
                    <button style={{ background: '#fdecea', color: '#d32f2f', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 500 }} onClick={() => {
                      setAddresses(addresses.filter((_, i) => i !== idx));
                      if (user) loginUser({ ...user, addresses: addresses.filter((_, i) => i !== idx) });
                    }}>Xóa</button>
                  </div>
                </li>
              ))}
            </ul>
            {/* Form thêm/sửa địa chỉ */}
            <form style={{ marginTop: 12 }} onSubmit={e => {
              e.preventDefault();
              if (editAddressId !== null) {
                const newList = addresses.map((a, i) => i === editAddressId ? addressForm : a);
                setAddresses(newList);
                if (user) loginUser({ ...user, addresses: newList });
                setEditAddressId(null);
              } else {
                setAddresses([...addresses, addressForm]);
                if (user) loginUser({ ...user, addresses: [...addresses, addressForm] });
              }
              setAddressForm({ name: '', phone: '', address: '' });
            }}>
              <h3 style={{ color: '#1976d2', fontWeight: 600, marginBottom: 10 }}>{editAddressId !== null ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
              <input
                type="text"
                placeholder="Tên người nhận"
                value={addressForm.name}
                onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                required
                style={{ marginBottom: 8, width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbeafe', fontSize: 15 }}
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={addressForm.phone}
                onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                required
                pattern="[0-9]{10,11}"
                style={{ marginBottom: 8, width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbeafe', fontSize: 15 }}
              />
              <input
                type="text"
                placeholder="Địa chỉ nhận hàng"
                value={addressForm.address}
                onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                required
                style={{ marginBottom: 8, width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbeafe', fontSize: 15 }}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'center' }}>
                <button type="submit" className="account-btn" style={{ minWidth: 120 }}>{editAddressId !== null ? 'Cập nhật' : 'Thêm mới'}</button>
                {editAddressId !== null && (
                  <button type="button" className="account-btn" style={{ background: '#e3eafc', color: '#1976d2', minWidth: 80 }} onClick={() => { setEditAddressId(null); setAddressForm({ name: '', phone: '', address: '' }); }}>Hủy</button>
                )}
              </div>
            </form>
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
