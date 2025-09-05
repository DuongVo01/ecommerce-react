import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as addToCartAPI, removeFromCart as removeFromCartAPI, clearCart as clearCartAPI } from './services/api';
import { UserContext } from './UserContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  // Load cart from backend when user changes
  useEffect(() => {
    if (user) {
      loadCartFromBackend();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCartFromBackend = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await getCart(user._id || user.id);
      const backendCart = response.data;
      
      if (backendCart && backendCart.items) {
        const itemsWithPrice = backendCart.items.map(item => ({
          ...item.productId,
          quantity: item.quantity,
          priceAtAddTime: item.priceAtAddTime
        }));
        setCartItems(itemsWithPrice);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ
  const addToCart = async (product, quantityToAdd = 1) => {
    if (!user) {
      alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    try {
      const productId = product._id || product.id;
      const currentItem = cartItems.find(item => (item._id || item.id) === productId);
      const newQuantity = currentItem ? currentItem.quantity + quantityToAdd : quantityToAdd;
      
      await addToCartAPI(user._id || user.id, {
        productId,
        quantity: newQuantity
      });
      
      await loadCartFromBackend();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi khi thêm sản phẩm vào giỏ hàng');
    }
  };

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = async (id) => {
    if (!user) return;

    try {
      await removeFromCartAPI(user._id || user.id, id);
      await loadCartFromBackend();
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Có lỗi khi xóa sản phẩm khỏi giỏ hàng');
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (id, quantity) => {
    if (!user) return;

    try {
      await addToCartAPI(user._id || user.id, {
        productId: id,
        quantity: Math.max(1, quantity)
      });
      await loadCartFromBackend();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Có lỗi khi cập nhật số lượng');
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!user) return;

    try {
      await clearCartAPI(user._id || user.id);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Có lỗi khi xóa giỏ hàng');
    }
  };

  // Tính tổng tiền
  const getTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.priceAtAddTime || item.price;
      return sum + (parseInt(price, 10) * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getTotal,
      loading,
      refreshCart: loadCartFromBackend
    }}>
      {children}
    </CartContext.Provider>
  );
}; 