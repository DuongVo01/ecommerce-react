import React from 'react';
import AddressSelect from '../AddressSelect';
import './AddressForm.css';

const AddressForm = ({
  addressForm,
  setAddressForm,
  handleAddressSelectChange,
  handleSaveAddress,
  handleCancelAddressForm,
  loading
}) => {
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAddressForm(prev => ({ ...prev, phone: value }));
    }
  };

  return (
    <form onSubmit={handleSaveAddress} className="address-form">
      {/* Name Input */}
      <div className="form-group">
        <label>Họ và tên *</label>
        <input
          type="text"
          value={addressForm.name}
          onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nhập họ và tên"
          required
        />
      </div>

      {/* Phone Input */}
      <div className="form-group">
        <label>Số điện thoại *</label>
        <input
          type="tel"
          value={addressForm.phone}
          onChange={handlePhoneChange}
          placeholder="Nhập số điện thoại (10 số)"
          maxLength={10}
          required
        />
      </div>

      {/* Address Select Component */}
      <div className="form-group">
        <label>Địa chỉ *</label>
        <AddressSelect
          value={{
            province: addressForm.province,
            district: addressForm.district,
            ward: addressForm.ward
          }}
          onChange={handleAddressSelectChange}
        />
      </div>

      {/* Detail Address */}
      <div className="form-group">
        <label>Địa chỉ chi tiết *</label>
        <input
          type="text"
          value={addressForm.detailAddress}
          onChange={(e) => setAddressForm(prev => ({ ...prev, detailAddress: e.target.value }))}
          placeholder="Số nhà, tên đường, tòa nhà..."
          required
        />
      </div>

      {/* Address Type */}
      <div className="form-group">
        <label>Loại địa chỉ</label>
        <div className="address-type-buttons">
          <button
            type="button"
            onClick={() => setAddressForm(prev => ({ ...prev, addressType: 'Nhà Riêng' }))}
            className={`type-btn ${addressForm.addressType === 'Nhà Riêng' ? 'active' : ''}`}
          >
            Nhà Riêng
          </button>
          <button
            type="button"
            onClick={() => setAddressForm(prev => ({ ...prev, addressType: 'Văn Phòng' }))}
            className={`type-btn ${addressForm.addressType === 'Văn Phòng' ? 'active' : ''}`}
          >
            Văn Phòng
          </button>
        </div>
      </div>

      {/* Default Address Checkbox */}
      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={addressForm.isDefault}
            onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
          />
          <span>Đặt làm địa chỉ mặc định</span>
        </label>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="button" onClick={handleCancelAddressForm} className="btn-cancel">
          Hủy
        </button>
        <button type="submit" className="btn-save" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
