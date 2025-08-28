import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../../UserContext";
import AddressSelect from "../../components/AddressSelect";
import { addressService } from "../../services/addressService";
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
  const [addressForm, setAddressForm] = useState({ 
    name: '', 
    phone: '', 
    province: '', 
    district: '', 
    ward: '',
    detailAddress: '',
    addressType: 'Nhà Riêng',
    isDefault: false
  });
  const [editAddressId, setEditAddressId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load addresses từ backend khi component mount
  useEffect(() => {
    if (user && user.id) {
      loadAddresses();
    }
  }, [user?.id]); // Chỉ chạy khi user.id thay đổi

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const addressesData = await addressService.getAddresses();
      setAddresses(addressesData);
      // Không cập nhật user context ở đây để tránh vòng lặp vô hạn
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Callback cho AddressSelect onChange
  const handleAddressSelectChange = useCallback(({ province, district, ward }) => {
    setAddressForm(prev => ({ ...prev, province, district, ward }));
  }, []);
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
            {loading && <div style={{ color: '#1976d2', marginTop: 10 }}>Đang tải...</div>}
                         {/* Danh sách địa chỉ */}
             <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0' }}>
               {addresses.length === 0 && <li style={{ color: '#888', marginBottom: 12, fontStyle: 'italic' }}>Chưa có địa chỉ nào. Hãy thêm địa chỉ mới bên dưới.</li>}
               {addresses.map((addr, idx) => (
                                  <li key={addr._id || idx} className="address-card" style={{ 
                   background: '#f9f9f9', 
                   borderRadius: 12, 
                   padding: '16px 20px', 
                   marginBottom: 16, 
                   boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
                   border: '1px solid #e8e8e8'
                 }}>
                   {/* Header row with name, phone, and buttons */}
                   <div className="address-card-header" style={{ 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center', 
                     marginBottom: 8,
                     flexWrap: 'wrap',
                     gap: 8
                   }}>
                     <div className="address-card-name-phone" style={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       gap: 12,
                       flexWrap: 'wrap'
                     }}>
                       <strong style={{ fontSize: 16, color: '#2c3e50' }}>{addr.name}</strong>
                       <span style={{ color: '#1976d2', fontWeight: 500, fontSize: 15 }}>{addr.phone}</span>
                       {addr.addressType && (
                         <span style={{ 
                           background: addr.addressType === 'Nhà Riêng' ? '#e8f5e8' : '#fff3e0',
                           color: addr.addressType === 'Nhà Riêng' ? '#2e7d32' : '#f57c00',
                           padding: '4px 8px',
                           borderRadius: 12,
                           fontSize: 12,
                           fontWeight: 500,
                           border: `1px solid ${addr.addressType === 'Nhà Riêng' ? '#c8e6c9' : '#ffe0b2'}`
                         }}>
                           {addr.addressType}
                         </span>
                       )}
                       {addr.isDefault && (
                         <span style={{ 
                           background: '#fff3e0',
                           color: '#f57c00',
                           padding: '4px 8px',
                           borderRadius: 12,
                           fontSize: 12,
                           fontWeight: 500,
                           border: '1px solid #ffe0b2'
                         }}>
                           Mặc định
                         </span>
                       )}
                     </div>
                     
                     {/* Button group */}
                     <div className="address-card-buttons" style={{ 
                       display: 'flex', 
                       gap: 8, 
                       alignItems: 'center' 
                     }}>
                       <button 
                         style={{ 
                           background: '#e3eafc', 
                           color: '#1976d2', 
                           border: 'none', 
                           borderRadius: 6, 
                           padding: '8px 16px', 
                           cursor: 'pointer', 
                           fontWeight: 500,
                           fontSize: 14,
                           minHeight: 36,
                           transition: 'all 0.2s ease'
                         }} 
                         onMouseOver={(e) => e.target.style.background = '#d1e7ff'}
                         onMouseOut={(e) => e.target.style.background = '#e3eafc'}
                         onClick={() => { setEditAddressId(addr._id); setAddressForm(addr); }}
                       >
                         Sửa
                       </button>
                       <button 
                         style={{ 
                           background: '#fdecea', 
                           color: '#d32f2f', 
                           border: 'none', 
                           borderRadius: 6, 
                           padding: '8px 16px', 
                           cursor: 'pointer', 
                           fontWeight: 500,
                           fontSize: 14,
                           minHeight: 36,
                           transition: 'all 0.2s ease'
                         }}
                         onMouseOver={(e) => e.target.style.background = '#ffcdd2'}
                         onMouseOut={(e) => e.target.style.background = '#fdecea'}
                         onClick={async () => {
                           if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
                             try {
                               setLoading(true);
                               console.log('Deleting address with ID:', addr._id);
                               console.log('Address object:', addr);
                               
                               if (!addr._id) {
                                 // Nếu không có _id, reload lại danh sách địa chỉ từ backend
                                 console.log('No _id found, reloading addresses...');
                                 await loadAddresses();
                                 alert('Đã tải lại danh sách địa chỉ. Vui lòng thử xóa lại.');
                                 return;
                               }
                               
                               await addressService.deleteAddress(addr._id);
                               // Cập nhật state local thay vì reload toàn bộ
                               setAddresses(prevAddresses => prevAddresses.filter(a => a._id !== addr._id));
                               alert('Xóa địa chỉ thành công!');
                             } catch (error) {
                               console.error('Delete address failed:', error);
                               console.error('Error details:', {
                                 message: error.message,
                                 response: error.response?.data,
                                 status: error.response?.status
                               });
                               
                               let errorMessage = 'Có lỗi xảy ra khi xóa địa chỉ.';
                               if (error.response?.data?.error) {
                                 errorMessage = error.response.data.error;
                               } else if (error.message) {
                                 errorMessage = error.message;
                               }
                               
                               alert(errorMessage);
                               
                               // Nếu lỗi 404 (Address not found), reload lại danh sách
                               if (error.response?.status === 404) {
                                 console.log('Address not found, reloading addresses...');
                                 await loadAddresses();
                               }
                             } finally {
                               setLoading(false);
                             }
                           }
                         }}
                       >
                         Xóa
                       </button>
                     </div>
                   </div>
                   
                   {/* Address details */}
                   <div style={{ color: '#374151', fontSize: 15, lineHeight: 1.4 }}>
                     {/* First line: Detailed address */}
                     <div style={{ marginBottom: 4 }}>
                       {addr.detailAddress}
                     </div>
                     {/* Second line: Administrative divisions */}
                     <div style={{ 
                       color: '#6b7280', 
                       fontSize: 14,
                       fontStyle: 'italic'
                     }}>
                       {[addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                     </div>
                   </div>
                 </li>
               ))}
             </ul>
            {/* Form thêm/sửa địa chỉ */}
            <form style={{ marginTop: 12 }} onSubmit={async e => {
              e.preventDefault();
              
              // Validation
              if (!addressForm.province || !addressForm.district || !addressForm.ward) {
                alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã');
                return;
              }
              
              try {
                setLoading(true);
                
                if (editAddressId !== null) {
                  // Cập nhật địa chỉ
                  const updatedAddress = await addressService.updateAddress(editAddressId, addressForm);
                  // Cập nhật state local
                  setAddresses(prevAddresses => 
                    prevAddresses.map(addr => 
                      addr._id === editAddressId ? { ...addr, ...addressForm } : addr
                    )
                  );
                  alert('Cập nhật địa chỉ thành công!');
                  setEditAddressId(null);
                                 } else {
                   // Thêm địa chỉ mới
                   const newAddress = await addressService.addAddress(addressForm);
                   // Cập nhật state local với địa chỉ có _id từ backend
                   setAddresses(prevAddresses => [...prevAddresses, newAddress.address]);
                   alert('Thêm địa chỉ thành công!');
                 }
                
                                 setAddressForm({ name: '', phone: '', province: '', district: '', ward: '', detailAddress: '', addressType: 'Nhà Riêng', isDefault: false });
              } catch (error) {
                console.error('Address operation failed:', error);
                alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
              } finally {
                setLoading(false);
              }
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
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                  Tỉnh/Thành phố - Quận/Huyện - Phường/Xã
                </label>
                <AddressSelect
                  value={{ 
                    province: addressForm.province, 
                    district: addressForm.district, 
                    ward: addressForm.ward 
                  }}
                  onChange={handleAddressSelectChange}
                />
              </div>
                             <input
                 type="text"
                 placeholder="Địa chỉ chi tiết (số nhà, tên đường, tòa nhà...)"
                 value={addressForm.detailAddress}
                 onChange={e => setAddressForm({ ...addressForm, detailAddress: e.target.value })}
                 required
                 style={{ marginBottom: 16, width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbeafe', fontSize: 15 }}
               />
               
               {/* Address Type Selection */}
               <div style={{ marginBottom: 16 }}>
                 <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                   Loại địa chỉ:
                 </label>
                 <div style={{ display: 'flex', gap: 8 }}>
                   <button
                     type="button"
                     onClick={() => setAddressForm({ ...addressForm, addressType: 'Nhà Riêng' })}
                     style={{
                       flex: 1,
                       padding: '10px 16px',
                       borderRadius: 6,
                       border: addressForm.addressType === 'Nhà Riêng' ? '2px solid #d32f2f' : '1px solid #d1d5db',
                       background: addressForm.addressType === 'Nhà Riêng' ? '#fef2f2' : '#ffffff',
                       color: addressForm.addressType === 'Nhà Riêng' ? '#d32f2f' : '#374151',
                       fontWeight: addressForm.addressType === 'Nhà Riêng' ? 600 : 500,
                       fontSize: 14,
                       cursor: 'pointer',
                       transition: 'all 0.2s ease'
                     }}
                   >
                     Nhà Riêng
                   </button>
                   <button
                     type="button"
                     onClick={() => setAddressForm({ ...addressForm, addressType: 'Văn Phòng' })}
                     style={{
                       flex: 1,
                       padding: '10px 16px',
                       borderRadius: 6,
                       border: addressForm.addressType === 'Văn Phòng' ? '2px solid #d32f2f' : '1px solid #d1d5db',
                       background: addressForm.addressType === 'Văn Phòng' ? '#fef2f2' : '#ffffff',
                       color: addressForm.addressType === 'Văn Phòng' ? '#d32f2f' : '#374151',
                       fontWeight: addressForm.addressType === 'Văn Phòng' ? 600 : 500,
                       fontSize: 14,
                       cursor: 'pointer',
                       transition: 'all 0.2s ease'
                     }}
                   >
                     Văn Phòng
                   </button>
                 </div>
               </div>
               
               {/* Default Address Checkbox */}
               <div style={{ marginBottom: 16 }}>
                 <label style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: 8, 
                   cursor: 'pointer',
                   opacity: (!addressForm.name || !addressForm.phone || !addressForm.province || !addressForm.district || !addressForm.ward || !addressForm.detailAddress) ? 0.5 : 1
                 }}>
                   <div style={{
                     width: 18,
                     height: 18,
                     border: addressForm.isDefault ? '2px solid #d32f2f' : '2px solid #d1d5db',
                     borderRadius: 3,
                     background: addressForm.isDefault ? '#d32f2f' : '#ffffff',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     transition: 'all 0.2s ease'
                   }}>
                     {addressForm.isDefault && (
                       <span style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>✓</span>
                     )}
                   </div>
                   <span style={{ 
                     fontSize: 14, 
                     color: '#374151',
                     fontWeight: 500
                   }}>
                     Đặt làm địa chỉ mặc định
                   </span>
                 </label>
                 <input
                   type="checkbox"
                   checked={addressForm.isDefault}
                   onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                   disabled={!addressForm.name || !addressForm.phone || !addressForm.province || !addressForm.district || !addressForm.ward || !addressForm.detailAddress}
                   style={{ display: 'none' }}
                 />
               </div>
               
               <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'center' }}>
                <button type="submit" className="account-btn" style={{ minWidth: 120 }} disabled={loading}>
                  {loading ? 'Đang xử lý...' : (editAddressId !== null ? 'Cập nhật' : 'Thêm mới')}
                </button>
                {editAddressId !== null && (
                                     <button type="button" className="account-btn" style={{ background: '#e3eafc', color: '#1976d2', minWidth: 80 }} onClick={() => { setEditAddressId(null); setAddressForm({ name: '', phone: '', province: '', district: '', ward: '', detailAddress: '', addressType: 'Nhà Riêng', isDefault: false }); }}>Hủy</button>
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
