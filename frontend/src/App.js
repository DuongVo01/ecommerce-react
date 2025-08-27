import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import MyOrdersPage from './pages/MyOrdersPage/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage/OrderDetailPage';
import HomePage from './pages/HomePage/HomePage';
import ProductListPage from './pages/ProductListPage/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import CategoryProductsPage from './pages/CategoryProductsPage/CategoryProductsPage';
import CartPage from './pages/CartPage/CartPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminBannerPage from './pages/AdminBannerPage/AdminBannerPage';
import AdminReportPage from './pages/AdminReportPage/AdminReportPage';
import AdminProducts from './pages/AdminProducts/AdminProducts';
import AdminCategories from './pages/AdminCategories/AdminCategories';
import AdminOrders from './pages/AdminOrders/AdminOrders';
import AdminUsers from './pages/AdminUsers/AdminUsers';
import AdminNotifications from './pages/AdminNotifications/AdminNotifications';
import AccountPage from './pages/AccountPage/AccountPage';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';

import Footer from './components/Footer/Footer';
import { CartProvider } from './CartContext';
import { UserProvider } from './UserContext';
import { ToastProvider } from './ToastContext';
import './ToastContext.css';

function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/category/:name" element={<CategoryProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order-detail" element={<OrderDetailPage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/banners" element={<AdminBannerPage />} />
              <Route path="/admin/reports" element={<AdminReportPage />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Routes>
            <Footer />
          </Router>
        </CartProvider>
      </UserProvider>
    </ToastProvider>
  );
}

export default App;
