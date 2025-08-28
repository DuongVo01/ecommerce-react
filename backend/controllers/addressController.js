const User = require('../models/User');

// Lấy danh sách địa chỉ của user
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get addresses', details: err.message });
  }
};

// Thêm địa chỉ mới
exports.addAddress = async (req, res) => {
  try {
    const { name, phone, province, district, ward, detailAddress, addressType, isDefault } = req.body;
    
    // Validation
    if (!name || !phone || !province || !district || !ward || !detailAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'phone', 'province', 'district', 'ward', 'detailAddress']
      });
    }

    // Validate addressType
    if (addressType && !['Nhà Riêng', 'Văn Phòng'].includes(addressType)) {
      return res.status(400).json({ 
        error: 'Invalid addressType',
        allowedValues: ['Nhà Riêng', 'Văn Phòng']
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Nếu địa chỉ mới là mặc định, bỏ mặc định tất cả địa chỉ cũ
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Thêm địa chỉ mới
    const newAddress = {
      name,
      phone,
      province,
      district,
      ward,
      detailAddress,
      addressType: addressType || 'Nhà Riêng',
      isDefault: isDefault || false
    };

    user.addresses.push(newAddress);
    await user.save();

    // Lấy địa chỉ vừa thêm với _id
    const savedAddress = user.addresses[user.addresses.length - 1];

    res.status(201).json({
      message: 'Address added successfully',
      address: savedAddress
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add address', details: err.message });
  }
};

// Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, phone, province, district, ward, detailAddress, addressType, isDefault } = req.body;
    
    // Validation
    if (!name || !phone || !province || !district || !ward || !detailAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'phone', 'province', 'district', 'ward', 'detailAddress']
      });
    }

    // Validate addressType
    if (addressType && !['Nhà Riêng', 'Văn Phòng'].includes(addressType)) {
      return res.status(400).json({ 
        error: 'Invalid addressType',
        allowedValues: ['Nhà Riêng', 'Văn Phòng']
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Tìm địa chỉ cần cập nhật
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Nếu địa chỉ này được set làm mặc định, bỏ mặc định tất cả địa chỉ khác
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Cập nhật địa chỉ
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      name,
      phone,
      province,
      district,
      ward,
      detailAddress,
      addressType: addressType || user.addresses[addressIndex].addressType || 'Nhà Riêng',
      isDefault: isDefault || false
    };

    await user.save();

    res.json({
      message: 'Address updated successfully',
      address: user.addresses[addressIndex]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address', details: err.message });
  }
};

// Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    console.log('Delete address request:', {
      addressId,
      userId: req.user.id,
      userAddresses: req.user.addresses?.length || 0
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User addresses:', user.addresses.map(addr => ({
      _id: addr._id.toString(),
      name: addr.name
    })));

    // Tìm và xóa địa chỉ
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    console.log('Address index found:', addressIndex);
    
    if (addressIndex === -1) {
      console.log('Address not found with ID:', addressId);
      return res.status(404).json({ error: 'Address not found' });
    }

    const deletedAddress = user.addresses.splice(addressIndex, 1)[0];
    await user.save();

    console.log('Address deleted successfully:', deletedAddress);

    res.json({
      message: 'Address deleted successfully',
      deletedAddress
    });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ error: 'Failed to delete address', details: err.message });
  }
};

// Đặt địa chỉ mặc định
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Tìm địa chỉ cần set mặc định
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Bỏ mặc định tất cả địa chỉ
    user.addresses.forEach(addr => addr.isDefault = false);
    
    // Set địa chỉ mới làm mặc định
    user.addresses[addressIndex].isDefault = true;
    
    await user.save();

    res.json({
      message: 'Default address set successfully',
      defaultAddress: user.addresses[addressIndex]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set default address', details: err.message });
  }
};

// Lấy địa chỉ mặc định
exports.getDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const defaultAddress = user.addresses.find(addr => addr.isDefault);
    
    res.json({
      defaultAddress: defaultAddress || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get default address', details: err.message });
  }
};
