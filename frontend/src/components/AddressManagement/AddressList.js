import React from 'react';
import './AddressList.css';

const AddressList = ({
  addresses,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  loading
}) => {
  return (
    <div className="address-list">
      {addresses.map((address) => (
        <div key={address._id} className="address-card">
          <div className="address-info">
            <div className="address-header">
              <span className="name">{address.name}</span>
              <span className="phone">{address.phone}</span>
              {address.isDefault && <span className="default-badge">Mặc định</span>}
            </div>
            <div className="address-details">
              <p className="detail-text">{address.detailAddress}</p>
              <p className="location-text">
                {address.ward}, {address.district}, {address.province}
              </p>
              <p className="type-text">{address.addressType}</p>
            </div>
          </div>
          <div className="address-actions">
            {!address.isDefault && (
              <button
                onClick={() => onSetDefaultAddress(address._id)}
                className="set-default-btn"
                disabled={loading}
              >
                Đặt làm mặc định
              </button>
            )}
            <button
              onClick={() => onEditAddress(address)}
              className="edit-btn"
              disabled={loading}
            >
              Sửa
            </button>
            <button
              onClick={() => onDeleteAddress(address._id)}
              className="delete-btn"
              disabled={loading}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressList;
