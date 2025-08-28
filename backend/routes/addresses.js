const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/auth');

// Tất cả routes đều yêu cầu authentication
router.use(authenticateToken);

// GET /api/addresses - Lấy danh sách địa chỉ của user
router.get('/', addressController.getAddresses);

// POST /api/addresses - Thêm địa chỉ mới
router.post('/', addressController.addAddress);

// PUT /api/addresses/:addressId - Cập nhật địa chỉ
router.put('/:addressId', addressController.updateAddress);

// DELETE /api/addresses/:addressId - Xóa địa chỉ
router.delete('/:addressId', addressController.deleteAddress);

// PUT /api/addresses/:addressId/default - Đặt địa chỉ mặc định
router.put('/:addressId/default', addressController.setDefaultAddress);

// GET /api/addresses/default - Lấy địa chỉ mặc định
router.get('/default', addressController.getDefaultAddress);

module.exports = router;
