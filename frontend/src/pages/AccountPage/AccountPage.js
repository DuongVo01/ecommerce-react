import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../../UserContext";
import "./AccountPage.css";

  
const AccountPage = () => {
  const [editMode, setEditMode] = useState(false);
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
  // Avatar
  // Always store avatar as File only when uploading, and avatarPreview as a string URL
  const [avatar, setAvatar] = useState(null);
  // Normalize avatar URL for preview
  let initialAvatarUrl = user?.avatar || null;
  if (initialAvatarUrl && initialAvatarUrl.startsWith('/uploads/')) {
    initialAvatarUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${initialAvatarUrl}`;
  }
  const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // ...
  if (user === undefined) {
    return <div style={{ textAlign: 'center', padding: 48, fontSize: 18, color: '#1976d2' }}>Đang tải thông tin tài khoản...</div>;
  }
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
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('gender', gender);
      formData.append('birthday', birthday);
      if (avatar) formData.append('avatar', avatar);
      // Gửi lên backend
      const updatedUser = await (await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/user/${user._id || user.id}`, {
        method: 'PUT',
        body: formData,
      })).json();
      if (updatedUser) {
        // Xử lý avatar thành URL đầy đủ nếu cần
        let avatarUrl = updatedUser.avatar;
        if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
          avatarUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${avatarUrl}`;
        }
        loginUser({ ...updatedUser, avatar: avatarUrl });
        setAvatarPreview(avatarUrl || '/default-avatar.png');
        setEditMode(false); // Chuyển về chế độ xem sau khi lưu thành công
      }
      setSaving(false);
      setAvatar(null);
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
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            {/* Chế độ xem thông tin */}
            {!editMode ? (
              <div className="account-form" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%' }}>
                <h2 className="account-title">Hồ sơ của tôi</h2>
                <div className="account-desc">Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
                <div className="account-row"><strong>Tên đăng nhập:</strong> <span style={{ color: '#1976d2', fontWeight: 600 }}>{user.username || '-'}</span></div>
                <div className="account-row"><strong>Tên:</strong> <span style={{ color: '#374151', fontWeight: 500 }}>{user.name || '-'}</span></div>
                <div className="account-row"><strong>Email:</strong> <span style={{ color: '#374151', fontWeight: 500 }}>{user.email || '-'}</span></div>
                <div className="account-row"><strong>Số điện thoại:</strong> <span style={{ color: '#374151', fontWeight: 500 }}>{user.phone || '-'}</span></div>
                <div className="account-row"><strong>Giới tính:</strong> <span style={{ color: '#374151', fontWeight: 500 }}>{user.gender || '-'}</span></div>
                <div className="account-row"><strong>Ngày sinh:</strong> <span style={{ color: '#374151', fontWeight: 500 }}>{user.birthday ? user.birthday.slice(0,10) : '-'}</span></div>
                <button className="account-btn" style={{ marginTop: 18, minWidth: 140 }} onClick={() => setEditMode(true)}>Sửa hồ sơ</button>
              </div>
            ) : (
              <form className="account-form" onSubmit={handleSave} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%' }}>
                <h2 className="account-title">Chỉnh sửa hồ sơ</h2>
                <div className="account-row"><strong>Tên đăng nhập:</strong> <span style={{ color: '#1976d2', fontWeight: 600 }}>{user.username || '-'}</span></div>
                <div className="account-row"><strong>Tên:</strong>
                  <input className="account-input" type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="account-row"><strong>Email:</strong> <span style={{ color: '#374151', fontWeight: 500 }}>{user.email || '-'}</span></div>
                <div className="account-row"><strong>Số điện thoại:</strong>
                  <input className="account-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} pattern="[0-9]{10,11}" required />
                </div>
                <div className="account-row"><strong>Giới tính:</strong>
                  <select className="account-select" value={gender} onChange={e => setGender(e.target.value)} required>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="account-row"><strong>Ngày sinh:</strong>
                  <input className="account-input" type="date" value={birthday} onChange={e => setBirthday(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
                  <button type="submit" className="account-btn" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thông tin"}</button>
                  <button type="button" className="account-btn" style={{ background: '#e3eafc', color: '#1976d2' }} onClick={() => setEditMode(false)}>Hủy</button>
                </div>
              </form>
            )}
            {/* Vertical divider */}
            <div style={{ width: 1, background: '#e3eafc', height: '100%', minHeight: 320, margin: '0 18px', boxShadow: '0 0 0 1px #e3eafc' }} />
            {/* Avatar section - Professional UI */}
            <div className="account-avatar-section" style={{ minWidth: 240, maxWidth: 280, background: 'linear-gradient(135deg, #f8fafc 80%, #e3eafc 100%)', borderRadius: 18, boxShadow: '0 4px 18px #1976d211', padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, border: '1.5px solid #e3eafc', position: 'relative' }}>
              <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 8, color: '#1976d2', letterSpacing: '0.02em' }}>Ảnh đại diện</div>
              <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', background: '#f8fafc', border: '2.5px solid #1976d2', marginBottom: 12, boxShadow: '0 2px 12px #1976d211', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'box-shadow 0.2s' }}>
                <img src={avatarPreview || '/default-avatar.png'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.18s' }} />
                {editMode && (
                  <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 8, right: 8, background: '#1976d2', color: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #1976d233', cursor: 'pointer', border: '2px solid #fff', fontSize: 18, transition: 'background 0.18s' }} title="Chọn ảnh">
                    <span style={{ fontWeight: 700 }}>✎</span>
                    <input type="file" accept="image/*" id="avatar-upload" style={{ display: 'none' }} onChange={handleAvatarChange} />
                  </label>
                )}
              </div>
              <div style={{ color: '#64748b', fontSize: 13, marginTop: 2, textAlign: 'center' }}>Chọn ảnh JPG, PNG, tối đa 2MB.<br />Ảnh đại diện giúp bạn nhận diện tài khoản dễ dàng hơn.</div>
            </div>
          </div>
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
    <div className="orders-container" style={{ display: 'flex', gap: 32 }}>
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
      <div className="orders-main" style={{ flex: 1 }}>
        {renderTabContent()}
      </div>
    </div>
  );
}

export default AccountPage;
