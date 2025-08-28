import React, { useState, useEffect } from 'react';
import vietnamAdminData from '../data/vietnam_admin.json';

export default function AddressSelect({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(value?.province || '');
  const [selectedDistrict, setSelectedDistrict] = useState(value?.district || '');
  const [selectedWard, setSelectedWard] = useState(value?.ward || '');
  
  // Filtered data based on selections
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredWards, setFilteredWards] = useState([]);

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

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);
    setSelectedDistrict('');
    setSelectedWard('');
    onChange({ 
      province: provinceName, 
      district: '', 
      ward: '' 
    });
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    setSelectedWard('');
    onChange({ 
      province: selectedProvince, 
      district: districtName, 
      ward: '' 
    });
  };

  const handleWardChange = (e) => {
    const wardName = e.target.value;
    setSelectedWard(wardName);
    onChange({ 
      province: selectedProvince, 
      district: selectedDistrict, 
      ward: wardName 
    });
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
        Đang tải dữ liệu địa chỉ...
      </div>
    );
  }

  return (
    <div>
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
  );
}
