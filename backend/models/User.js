const mongoose = require('mongoose');

// Address schema for Vietnam administrative structure
const addressSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên người nhận
  phone: { type: String, required: true }, // Số điện thoại
  province: { type: String, required: true }, // Tỉnh/Thành phố
  district: { type: String, required: true }, // Quận/Huyện
  ward: { type: String, required: true }, // Phường/Xã
  detailAddress: { type: String, required: true }, // Địa chỉ chi tiết
  addressType: { 
    type: String, 
    enum: ['Nhà Riêng', 'Văn Phòng'], 
    default: 'Nhà Riêng' 
  }, // Loại địa chỉ
  isDefault: { type: Boolean, default: false } // Địa chỉ mặc định
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
  birthday: { type: Date },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [addressSchema], // Array of addresses
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
