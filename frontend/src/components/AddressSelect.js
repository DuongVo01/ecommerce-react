import React, { useState } from 'react';

const addressData = {
  'Hà Nội': {
    'Ba Đình': ['Phúc Xá', 'Trúc Bạch'],
    'Hoàn Kiếm': ['Hàng Bạc', 'Hàng Đào'],
    'Cầu Giấy': ['Dịch Vọng', 'Nghĩa Tân'],
  },
  'Hồ Chí Minh': {
    'Quận 1': ['Bến Nghé', 'Bến Thành'],
    'Quận 3': ['Phường 1', 'Phường 2'],
    'Quận 7': ['Tân Phong', 'Tân Quy'],
  },
  'Đà Nẵng': {
    'Hải Châu': ['Thạch Thang', 'Hải Châu 1'],
    'Thanh Khê': ['Thanh Khê Đông', 'Thanh Khê Tây'],
  },
};

export default function AddressSelect({ value, onChange }) {
  const [city, setCity] = useState(value?.city || '');
  const [district, setDistrict] = useState(value?.district || '');
  const [ward, setWard] = useState(value?.ward || '');

  const handleCity = e => {
    setCity(e.target.value);
    setDistrict('');
    setWard('');
    onChange({ city: e.target.value, district: '', ward: '' });
  };
  const handleDistrict = e => {
    setDistrict(e.target.value);
    setWard('');
    onChange({ city, district: e.target.value, ward: '' });
  };
  const handleWard = e => {
    setWard(e.target.value);
    onChange({ city, district, ward: e.target.value });
  };

  return (
    <div>
      <select value={city} onChange={handleCity} style={{ marginBottom: 8, width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbeafe', fontSize: 15 }}>
        <option value="">Chọn Tỉnh/Thành phố</option>
        {Object.keys(addressData).map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={district} onChange={handleDistrict} disabled={!city} style={{ marginBottom: 8, width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbeafe', fontSize: 15 }}>
        <option value="">Chọn Quận/Huyện</option>
        {city && Object.keys(addressData[city]).map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select value={ward} onChange={handleWard} disabled={!district} style={{ marginBottom: 8, width: '100%', padding: 10, borderRadius: 6, border: '1px solid #dbeafe', fontSize: 15 }}>
        <option value="">Chọn Phường/Xã</option>
        {city && district && addressData[city][district].map(w => <option key={w} value={w}>{w}</option>)}
      </select>
    </div>
  );
}
