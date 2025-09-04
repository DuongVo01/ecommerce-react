import React, { useState, useEffect, useContext, useCallback } from "react";
import { UserContext } from "../../UserContext";
import { addressService } from "../../services/addressService";
import ProfileForm from "../../components/Profile/ProfileForm";
import AddressForm from "../../components/AddressManagement/AddressForm";
import AddressList from "../../components/AddressManagement/AddressList";
import { useNavigate, Link } from "react-router-dom";
import AddressSelect from "../../components/AddressSelect";
import Sidebar from "../../components/Sidebar/Sidebar";
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
  
  // Address Management State
  const [addresses, setAddresses] = useState([]);
  const [showAddressList, setShowAddressList] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
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
  const [loading, setLoading] = useState(false);

  // Load addresses từ backend khi component mount
  useEffect(() => {
    if (user && user.id) {
      loadAddresses();
    } else {
      // Reset addresses khi không có user
      setAddresses([]);
    }
  }, [user?.id]); // Chỉ chạy khi user.id thay đổi

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const addressesData = await addressService.getAddresses();
      console.log('Loaded addresses from backend:', addressesData);
      setAddresses(addressesData);
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

  // Address Management Functions
  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setShowAddressList(false);
    setEditingAddressId(null);
    setAddressForm({ 
      name: '', 
      phone: '', 
      province: '', 
      district: '', 
      ward: '',
      detailAddress: '',
      addressType: 'Nhà Riêng',
      isDefault: false
    });
  };

  const handleEditAddress = (address) => {
    setShowAddressForm(true);
    setShowAddressList(false);
    setEditingAddressId(address._id);
    setAddressForm(address);
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setShowAddressList(true);
    setEditingAddressId(null);
    setAddressForm({ 
      name: '', 
      phone: '', 
      province: '', 
      district: '', 
      ward: '',
      detailAddress: '',
      addressType: 'Nhà Riêng',
      isDefault: false
    });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!addressForm.province || !addressForm.district || !addressForm.ward) {
      alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã');
      return;
    }
    
    try {
      setLoading(true);
      
      if (editingAddressId) {
        // Cập nhật địa chỉ
        await addressService.updateAddress(editingAddressId, addressForm);
        alert('Cập nhật địa chỉ thành công!');
      } else {
        // Thêm địa chỉ mới
        await addressService.addAddress(addressForm);
        alert('Thêm địa chỉ thành công!');
      }
      
      // Refresh danh sách và chuyển về view list
      await loadAddresses();
      setShowAddressForm(false);
      setShowAddressList(true);
      setEditingAddressId(null);
      
    } catch (error) {
      console.error('Address operation failed:', error);
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      try {
        setLoading(true);
        console.log('Deleting address with ID:', addressId);
        await addressService.deleteAddress(addressId);
        console.log('Address deleted successfully, refreshing list...');
        // Refresh danh sách từ backend thay vì chỉ cập nhật local state
        await loadAddresses();
        alert('Xóa địa chỉ thành công!');
      } catch (error) {
        console.error('Delete address failed:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa địa chỉ.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      await addressService.setDefaultAddress(addressId);
      await loadAddresses();
      alert('Đã đặt làm địa chỉ mặc định!');
    } catch (error) {
      console.error('Set default address failed:', error);
      alert(error.message || 'Có lỗi xảy ra khi đặt địa chỉ mặc định.');
    } finally {
      setLoading(false);
    }
  };

  // Avatar
  const [avatar, setAvatar] = useState(null);
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
        break;
      case 'address':
        return (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 800, width: '100%' }}>
            {/* Address Section Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 24
            }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  cursor: 'pointer'
                }} 
                onClick={() => setShowAddressList(!showAddressList)}
              >
                <h2 className="account-title" style={{ margin: 0, cursor: 'pointer' }}>Địa chỉ của tôi</h2>
                <span style={{ 
                  fontSize: 20, 
                  color: '#1976d2', 
                  transition: 'transform 0.3s ease',
                  transform: showAddressList ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
              <button 
                onClick={loadAddresses}
                disabled={loading}
                style={{ 
                  background: '#f3f4f6', 
                  color: '#374151', 
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  padding: '6px 12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                title="Làm mới danh sách"
              >
                {loading ? '⏳' : '🔄'}
              </button>
            </div>

            {/* Address List View */}
            {showAddressList && !showAddressForm && (
              <div>
                {/* Add New Address Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                  <button 
                    onClick={handleAddNewAddress}
                    style={{ 
                      background: '#1976d2', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 8, 
                      padding: '12px 20px', 
                      cursor: 'pointer', 
                      fontWeight: 600,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#1565c0'}
                    onMouseOut={(e) => e.target.style.background = '#1976d2'}
                  >
                    <span>+</span>
                    Thêm địa chỉ mới
                  </button>
                </div>

                {/* Address List */}
                {loading && <div style={{ textAlign: 'center', color: '#1976d2', margin: '20px 0' }}>Đang tải...</div>}
                
                {!loading && addresses.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', margin: '40px 0' }}>
                    Chưa có địa chỉ nào. Hãy thêm địa chỉ mới.
                  </div>
                )}

                {!loading && addresses.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {addresses.map((addr, idx) => (
                      <div key={addr._id || idx} style={{ 
                        background: '#f9f9f9', 
                        borderRadius: 12, 
                        padding: '20px', 
                        border: '1px solid #e8e8e8',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}>
                        {/* Address Header */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start', 
                          marginBottom: 12,
                          flexWrap: 'wrap',
                          gap: 12
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 12,
                              flexWrap: 'wrap',
                              marginBottom: 8
                            }}>
                              <strong style={{ fontSize: 16, color: '#2c3e50' }}>{addr.name}</strong>
                              <span style={{ color: '#1976d2', fontWeight: 500, fontSize: 15 }}>{addr.phone}</span>
                              
                              {/* Address Type Badge */}
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
                              
                              {/* Default Badge */}
                              {addr.isDefault && (
                                <span style={{ 
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  padding: '4px 8px',
                                  borderRadius: 12,
                                  fontSize: 12,
                                  fontWeight: 500,
                                  border: '1px solid #bae6fd'
                                }}>
                                  Mặc định
                                </span>
                              )}
                            </div>
                            
                            {/* Full Address */}
                            <div style={{ color: '#374151', fontSize: 15, lineHeight: 1.4 }}>
                              <div style={{ marginBottom: 4 }}>
                                {addr.detailAddress}
                              </div>
                              <div style={{ 
                                color: '#6b7280', 
                                fontSize: 14,
                                fontStyle: 'italic'
                              }}>
                                {[addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div style={{ 
                            display: 'flex', 
                            gap: 8, 
                            alignItems: 'center',
                            flexWrap: 'wrap'
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
                              onClick={() => handleEditAddress(addr)}
                            >
                              Cập nhật
                            </button>
                            
                            {!addr.isDefault && (
                              <button 
                                style={{ 
                                  background: '#ffffff', 
                                  color: '#374151', 
                                  border: '1px solid #d1d5db', 
                                  borderRadius: 6, 
                                  padding: '8px 16px', 
                                  cursor: 'pointer', 
                                  fontWeight: 500,
                                  fontSize: 14,
                                  minHeight: 36,
                                  transition: 'all 0.2s ease'
                                }} 
                                onMouseOver={(e) => {
                                  e.target.style.background = '#f8fafc';
                                  e.target.style.borderColor = '#1976d2';
                                  e.target.style.color = '#1976d2';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = '#ffffff';
                                  e.target.style.borderColor = '#d1d5db';
                                  e.target.style.color = '#374151';
                                }}
                                onClick={() => handleSetDefaultAddress(addr._id)}
                                disabled={loading}
                              >
                                Thiết lập mặc định
                              </button>
                            )}
                            
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
                              onClick={() => handleDeleteAddress(addr._id)}
                              disabled={loading}
                            >
                              Xóa
                            </button>
                          </div>
                  </div>
                  </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address Form View */}
            {showAddressForm && (
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 12, 
                padding: '24px', 
                border: '1px solid #e3eafc'
              }}>
                <h3 style={{ 
                  color: '#1976d2', 
                  fontWeight: 600, 
                  marginBottom: 20,
                  fontSize: 18
                }}>
                  {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                </h3>
                
                <form onSubmit={handleSaveAddress}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Họ và tên */}
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        Họ và tên *
                      </label>
              <input
                type="text"
                        placeholder="Nhập họ và tên người nhận"
                value={addressForm.name}
                onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                required
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          borderRadius: 8, 
                          border: '1px solid #d1d5db', 
                          fontSize: 15,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        Số điện thoại *
                      </label>
              <input
                type="tel"
                        placeholder="Nhập số điện thoại"
                value={addressForm.phone}
                onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                required
                pattern="[0-9]{10,11}"
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          borderRadius: 8, 
                          border: '1px solid #d1d5db', 
                          fontSize: 15,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Address Select */}
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        Tỉnh/Thành phố - Quận/Huyện - Phường/Xã *
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

                    {/* Địa chỉ chi tiết */}
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        Địa chỉ chi tiết *
                      </label>
              <input
                type="text"
                        placeholder="Số nhà, tên đường, tòa nhà..."
                        value={addressForm.detailAddress}
                        onChange={e => setAddressForm({ ...addressForm, detailAddress: e.target.value })}
                required
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          borderRadius: 8, 
                          border: '1px solid #d1d5db', 
                          fontSize: 15,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Address Type Selection */}
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        Loại địa chỉ
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setAddressForm({ ...addressForm, addressType: 'Nhà Riêng' })}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: addressForm.addressType === 'Nhà Riêng' ? '2px solid #1976d2' : '1px solid #d1d5db',
                            background: addressForm.addressType === 'Nhà Riêng' ? '#e3eafc' : '#ffffff',
                            color: addressForm.addressType === 'Nhà Riêng' ? '#1976d2' : '#374151',
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
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: addressForm.addressType === 'Văn Phòng' ? '2px solid #1976d2' : '1px solid #d1d5db',
                            background: addressForm.addressType === 'Văn Phòng' ? '#e3eafc' : '#ffffff',
                            color: addressForm.addressType === 'Văn Phòng' ? '#1976d2' : '#374151',
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
                    <div>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12, 
                        cursor: 'pointer',
                        opacity: (!addressForm.name || !addressForm.phone || !addressForm.province || !addressForm.district || !addressForm.ward || !addressForm.detailAddress) ? 0.5 : 1
                      }}>
                        <div style={{
                          width: 20,
                          height: 20,
                          border: addressForm.isDefault ? '2px solid #1976d2' : '2px solid #d1d5db',
                          borderRadius: 4,
                          background: addressForm.isDefault ? '#1976d2' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}>
                          {addressForm.isDefault && (
                            <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>✓</span>
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

                    {/* Form Buttons */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        onClick={handleCancelAddressForm}
                        style={{ 
                          background: '#f3f4f6', 
                          color: '#374151', 
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          padding: '12px 24px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: 14,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                        onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                          background: '#1976d2', 
                          color: '#ffffff', 
                          border: 'none',
                          borderRadius: 8,
                          padding: '12px 24px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontWeight: 500,
                          fontSize: 14,
                          opacity: loading ? 0.7 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => !loading && (e.target.style.background = '#1565c0')}
                        onMouseOut={(e) => !loading && (e.target.style.background = '#1976d2')}
                      >
                        {loading ? 'Đang xử lý...' : 'Lưu'}
                      </button>
                    </div>
              </div>
            </form>
              </div>
            )}
          </div>
        );
        break;
      case 'privacy':
        return (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%', textAlign: 'center' }}>
            <h2 className="account-title">Thiết Lập Riêng Tư</h2>
            <div className="account-desc">Quản lý các thiết lập bảo mật và quyền riêng tư.</div>
            <div style={{ color: '#888', marginTop: 24 }}>Chức năng này sẽ được phát triển sau.</div>
          </div>
        );
        break;
      case 'info':
        return (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, maxWidth: 500, width: '100%', textAlign: 'center' }}>
            <h2 className="account-title">Thông tin cá nhân</h2>
            <div className="account-desc">Xem thông tin cá nhân của bạn.</div>
            <div style={{ color: '#888', marginTop: 24 }}>Chức năng này sẽ được phát triển sau.</div>
          </div>
        );
        break;
      default:
        return null;
        break;
    }
  };

  return (
    <div className="orders-container" style={{ display: 'flex', gap: 32 }}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onNavigateOrders={() => navigate('/my-orders')}
      />
      {/* Main content: Tab content */}
      <div className="orders-main" style={{ flex: 1 }}>
        {renderTabContent()}
      </div>
    </div>
  );
}

export default AccountPage;