import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chỉnh sửa và xóa đánh giá sản phẩm
export const updateReview = (productId, reviewId, data) => api.put(`/products/${productId}/reviews/${reviewId}`, data);
export const deleteReview = (productId, reviewId, data) => api.delete(`/products/${productId}/reviews/${reviewId}`, { data });

// Đánh giá sản phẩm
export const getReviews = (productId) => api.get(`/products/${productId}/reviews`);
export const addReview = (productId, data) => api.post(`/products/${productId}/reviews`, data);

// Lấy danh mục sản phẩm
export const fetchCategories = async () => {
  const res = await api.get('/categories');
  return res;
};

// Product APIs
export const fetchProducts = () => api.get('/products');
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => {
  return api.post('/products', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const updateProduct = (id, data) => {
  return api.put(`/products/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Auth APIs
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Cart APIs
export const getCart = (userId) => api.get(`/cart/${userId}`);
export const addToCart = (userId, data) => api.post(`/cart/${userId}`, data);
export const removeFromCart = (userId, productId) => api.delete(`/cart/${userId}/${productId}`);

// Order APIs
export const getOrders = (userId) => api.get(`/orders/${userId}`);
export const createOrder = (userId, data) => api.post(`/orders/${userId}`, data);
export const updateOrderStatus = (orderId, status) => api.put(`/orders/${orderId}`, { status });
