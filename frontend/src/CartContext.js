import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    setCartItems(prev => {
      const getId = p => p._id || p.id;
      const prodId = getId(product);
      const found = prev.find(item => getId(item) === prodId);
      let newCart;
      if (found) {
        newCart = prev.map(item =>
          getId(item) === prodId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = (id) => {
    setCartItems(prev => {
      const getId = p => p._id || p.id;
      const newCart = prev.filter(item => getId(item) !== id);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (id, quantity) => {
    setCartItems(prev => {
      const getId = p => p._id || p.id;
      const newCart = prev.map(item =>
        getId(item) === id ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // Tính tổng tiền
  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (parseInt(item.price, 10) * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotal }}>
      {children}
    </CartContext.Provider>
  );
}; 