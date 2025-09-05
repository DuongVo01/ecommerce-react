import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to automatically add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401) {
      // Handle specific token errors
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message;

      // Clear tokens and redirect to login if token is invalid or expired
      if (errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_EXPIRED' || 
          errorCode === 'INVALID_TOKEN_FORMAT' || errorMessage?.includes('Invalid or expired token')) {
        
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Save the current URL for redirect after login
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('loginRedirect', currentPath);
        
        // Redirect to login with error message
        window.location.href = `/login?error=${encodeURIComponent(errorMessage)}&redirect=${encodeURIComponent(currentPath)}`;
        return Promise.reject(error);
      }

      // Try to refresh token only if it's not already a refresh token request
      if (!originalRequest._retry && !originalRequest.url.includes('/auth/refresh-token')) {
        originalRequest._retry = true;
        
        try {
          const response = await api.post('/auth/refresh-token');
          const { token } = response.data;
          
          if (token) {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear auth and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?error=${encodeURIComponent('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')}&redirect=${encodeURIComponent(currentPath)}`;
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Chỉnh sửa và xóa đánh giá sản phẩm
export const updateReview = (productId, reviewId, data, isFormData = false) => {
  if (isFormData) {
    return api.put(`/products/${productId}/reviews/${reviewId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.put(`/products/${productId}/reviews/${reviewId}`, data);
};
export const deleteReview = (productId, reviewId, data) => api.delete(`/products/${productId}/reviews/${reviewId}`, { data });

// Đánh giá sản phẩm
export const getReviews = (productId) => api.get(`/products/${productId}/reviews`);
export const addReview = (productId, data, isFormData = false) => {
  if (isFormData) {
    return api.post(`/products/${productId}/reviews`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post(`/products/${productId}/reviews`, data);
};

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

// User APIs
export const updateUser = (userId, data) => api.put(`/user/${userId}`, data);

// Cart APIs
export const getCart = (userId) => api.get(`/cart/${userId}`);
export const getCheckoutItems = (userId) => api.get(`/cart/${userId}/checkout`);
export const addToCart = (userId, data) => api.post(`/cart/${userId}`, data);
export const removeFromCart = (userId, productId) => api.delete(`/cart/${userId}/${productId}`);
export const clearCart = (userId) => api.delete(`/cart/${userId}/clear`);

// Order APIs
export const getOrders = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await api.get(`/orders/${userId}`);
    return response;
  } catch (error) {
    console.error('Error in getOrders:', error);
    
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message;

      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || 
          errorCode === 'INVALID_TOKEN_FORMAT' || 
          errorMessage?.includes('Invalid or expired token')) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }
    
    throw error;
  }
};
export const createOrder = (userId, data) => api.post(`/orders/${userId}`, data);
export const updateOrderStatus = (orderId, status) => api.put(`/orders/${orderId}`, { status });

// Like/unlike review
export const likeReview = (productId, reviewId, user) =>
  api.post(`/products/${productId}/reviews/${reviewId}/like`, { user });

// Notification APIs
export const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ page, limit, unreadOnly });
  
  const response = await fetch(`${API_BASE_URL}/notifications/user?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  
  return response.json();
};

export const getUnreadCount = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch unread count');
  }
  
  return response.json();
};

export const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  
  return response.json();
};

export const markAllNotificationsAsRead = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
  
  return response.json();
};

export const deleteNotification = async (notificationId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
  
  return response.json();
};

export const deleteReadNotifications = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/notifications/delete-read`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete read notifications');
  }
  
  return response.json();
};
