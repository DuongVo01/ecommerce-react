import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import { addressService } from '../services/addressService';
import vietnamAdminData from '../data/vietnam_admin.json';

export default function AddressSelect({ value, onChange, mode = 'select' }) {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(value?.province || '');
  const [selectedDistrict, setSelectedDistrict] = useState(value?.district || '');
  const [selectedWard, setSelectedWard] = useState(value?.ward || '');
  const [detailAddress, setDetailAddress] = useState(value?.detailAddress || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressType, setAddressType] = useState('Nhà Riêng');
  const [isDefault, setIsDefault] = useState(false);
  
  // Filtered data based on selections
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredWards, setFilteredWards] = useState([]);

  // Load user addresses
  useEffect(() => {
    if (user && mode === 'select') {
      loadUserAddresses();
    }
  }, [user, mode]);

  const loadUserAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAddresses();
      setUserAddresses(response.data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find selected province data
  const selectedProvinceData = vietnamAdminData.find(
    province => province.name === selectedProvince
  );

  // Find selected district data
  const selectedDistrictData = selectedProvinceData?.districts?.find(
    district => district.name === selectedDistrict
  );

  // Update filtered districts when province changes
  useEffect(() => {
    if (selectedProvinceData) {
      setFilteredDistricts(selectedProvinceData.districts || []);
    } else {
      setFilteredDistricts([]);
    }
    setSelectedDistrict('');
    setSelectedWard('');
    setFilteredWards([]);
  }, [selectedProvinceData]);

  // Update filtered wards when district changes
  useEffect(() => {
    if (selectedDistrictData) {
      setFilteredWards(selectedDistrictData.wards || []);
    } else {
      setFilteredWards([]);
    }
    setSelectedWard('');
  }, [selectedDistrictData]);

  // Handle existing address selection
  const handleExistingAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const address = userAddresses.find(addr => addr._id === addressId);
    if (address) {
      onChange(address);
    }
  };

  // Handle new address creation
  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);
    setSelectedDistrict('');
    setSelectedWard('');
    setSelectedAddressId('');
    if (mode === 'create') {
      updateAddressData();
    } else {
      onChange({ 
        province: provinceName, 
        district: '', 
        ward: '',
        detailAddress 
      });
    }
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    setSelectedWard('');
    setSelectedAddressId('');
    if (mode === 'create') {
      updateAddressData();
    } else {
      onChange({ 
        province: selectedProvince, 
        district: districtName, 
        ward: '',
        detailAddress 
      });
    }
  };

  const handleWardChange = (e) => {
    const wardName = e.target.value;
    setSelectedWard(wardName);
    setSelectedAddressId('');
    if (mode === 'create') {
      updateAddressData();
    } else {
      onChange({ 
        province: selectedProvince, 
        district: selectedDistrict, 
        ward: wardName,
        detailAddress 
      });
    }
  };

  const handleDetailAddressChange = (e) => {
    const detail = e.target.value;
    setDetailAddress(detail);
    if (mode === 'create') {
      updateAddressData();
    } else {
      onChange({ 
        province: selectedProvince, 
        district: selectedDistrict, 
        ward: selectedWard,
        detailAddress: detail 
      });
    }
  };

  const updateAddressData = () => {
    const addressData = {
      name,
      phone,
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      detailAddress,
      addressType,
      isDefault
    };
    onChange(addressData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !phone || !selectedProvince || !selectedDistrict || !selectedWard || !detailAddress) {
      alert('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }

    const addressData = {
      name,
      phone,
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      detailAddress,
      addressType,
      isDefault
    };

    try {
      const response = await addressService.addAddress(addressData);
      onChange(response.data);
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Có lỗi khi thêm địa chỉ mới');
    }
  };

  const selectStyle = {
    marginBottom: 8,
    width: '100%',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #dbeafe',
    fontSize: 15,
    backgroundColor: '#fff',
    cursor: 'pointer'
  };

  const disabledStyle = {
    ...selectStyle,
    backgroundColor: '#f8f9fa',
    cursor: 'not-allowed',
    color: '#6c757d'
  };

  const addressCardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    cursor: 'pointer',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s'
  };

  const selectedAddressCardStyle = {
    ...addressCardStyle,
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd'
  };

  const inputStyle = {
    width: '100%',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #dbeafe',
    fontSize: 15,
    marginBottom: 8
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
        Đang tải dữ liệu địa chỉ...
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Họ và tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <input
          type="text"
          placeholder="Số nhà, đường, khu phố..."
          value={detailAddress}
          onChange={handleDetailAddressChange}
          style={inputStyle}
          required
        />

        {/* Province/Thành phố Dropdown */}
        <select 
          value={selectedProvince} 
          onChange={handleProvinceChange} 
          style={selectStyle}
          required
        >
          <option value="">Chọn Tỉnh/Thành phố</option>
          {vietnamAdminData.map(province => (
            <option key={province.code} value={province.name}>
              {province.name}
            </option>
          ))}
        </select>

        {/* District/Quận/Huyện Dropdown */}
        <select 
          value={selectedDistrict} 
          onChange={handleDistrictChange} 
          disabled={!selectedProvince}
          style={selectedProvince ? selectStyle : disabledStyle}
          required
        >
          <option value="">Chọn Quận/Huyện</option>
          {filteredDistricts.map(district => (
            <option key={district.code} value={district.name}>
              {district.name}
            </option>
          ))}
        </select>

        {/* Ward/Phường/Xã Dropdown */}
        <select 
          value={selectedWard} 
          onChange={handleWardChange} 
          disabled={!selectedDistrict}
          style={selectedDistrict ? selectStyle : disabledStyle}
          required
        >
          <option value="">Chọn Phường/Xã</option>
          {filteredWards.map(ward => (
            <option key={ward.code} value={ward.name}>
              {ward.name}
            </option>
          ))}
        </select>

        {/* Address Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Loại địa chỉ:</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setAddressType('Nhà Riêng')}
              style={{
                padding: '8px 16px',
                border: `2px solid ${addressType === 'Nhà Riêng' ? '#1976d2' : '#e0e0e0'}`,
                borderRadius: 6,
                background: addressType === 'Nhà Riêng' ? '#1976d2' : '#fff',
                color: addressType === 'Nhà Riêng' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Nhà Riêng
            </button>
            <button
              type="button"
              onClick={() => setAddressType('Văn Phòng')}
              style={{
                padding: '8px 16px',
                border: `2px solid ${addressType === 'Văn Phòng' ? '#1976d2' : '#e0e0e0'}`,
                borderRadius: 6,
                background: addressType === 'Văn Phòng' ? '#1976d2' : '#fff',
                color: addressType === 'Văn Phòng' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Văn Phòng
            </button>
          </div>
        </div>

        {/* Default Address Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          <span>Đặt làm địa chỉ mặc định</span>
        </label>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Thêm địa chỉ
        </button>
      </form>
    );
  }

  return (
    <div>
      {/* Existing Addresses Section */}
      {mode === 'select' && userAddresses.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ marginBottom: 12, color: '#1976d2' }}>Chọn từ địa chỉ đã lưu:</h4>
          {userAddresses.map((address) => (
            <div
              key={address._id}
              style={selectedAddressId === address._id ? selectedAddressCardStyle : addressCardStyle}
              onClick={() => handleExistingAddressSelect(address._id)}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {address.name} - {address.phone}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                {address.detailAddress}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                {address.ward}, {address.district}, {address.province}
              </div>
              {address.isDefault && (
                <span style={{ 
                  background: '#e0f2fe', 
                  color: '#0369a1', 
                  padding: '2px 8px', 
                  borderRadius: 12, 
                  fontSize: 12,
                  fontWeight: 500 
                }}>
                  Mặc định
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Address Section */}
      <div style={{ marginTop: mode === 'select' ? 20 : 0 }}>
        <h4 style={{ marginBottom: 12, color: '#1976d2' }}>
          {mode === 'select' ? 'Hoặc tạo địa chỉ mới:' : 'Địa chỉ giao hàng:'}
        </h4>
        
        {/* Detail Address Input */}
        <input
          type="text"
          placeholder="Số nhà, đường, khu phố..."
          value={detailAddress}
          onChange={handleDetailAddressChange}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            border: '1px solid #dbeafe',
            fontSize: 15,
            marginBottom: 8
          }}
        />

        {/* Province/Thành phố Dropdown */}
        <select 
          value={selectedProvince} 
          onChange={handleProvinceChange} 
          style={selectStyle}
        >
          <option value="">Chọn Tỉnh/Thành phố</option>
          {vietnamAdminData.map(province => (
            <option key={province.code} value={province.name}>
              {province.name}
            </option>
          ))}
        </select>

        {/* District/Quận/Huyện Dropdown */}
        <select 
          value={selectedDistrict} 
          onChange={handleDistrictChange} 
          disabled={!selectedProvince}
          style={selectedProvince ? selectStyle : disabledStyle}
        >
          <option value="">Chọn Quận/Huyện</option>
          {filteredDistricts.map(district => (
            <option key={district.code} value={district.name}>
              {district.name}
            </option>
          ))}
        </select>

        {/* Ward/Phường/Xã Dropdown */}
        <select 
          value={selectedWard} 
          onChange={handleWardChange} 
          disabled={!selectedDistrict}
          style={selectedDistrict ? selectStyle : disabledStyle}
        >
          <option value="">Chọn Phường/Xã</option>
          {filteredWards.map(ward => (
            <option key={ward.code} value={ward.name}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
