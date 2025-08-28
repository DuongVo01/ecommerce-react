import { api } from './api';

export const addressService = {
  // Lấy danh sách địa chỉ của user
  getAddresses: async () => {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thêm địa chỉ mới
  addAddress: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật địa chỉ
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa địa chỉ
  deleteAddress: async (addressId) => {
    try {
      console.log('Calling deleteAddress with ID:', addressId);
      const response = await api.delete(`/addresses/${addressId}`);
      console.log('Delete response:', response);
      return response.data;
    } catch (error) {
      console.error('Delete address error:', error);
      console.error('Error response:', error.response);
      // Throw the entire error object for better debugging
      throw error;
    }
  },

  // Đặt địa chỉ mặc định
  setDefaultAddress: async (addressId) => {
    try {
      const response = await api.put(`/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy địa chỉ mặc định
  getDefaultAddress: async () => {
    try {
      const response = await api.get('/addresses/default');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật toàn bộ danh sách địa chỉ (cho tương thích với code cũ)
  updateAllAddresses: async (userId, addresses) => {
    try {
      const response = await api.put(`/user/${userId}`, { addresses });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
