import React, { useContext } from 'react';
import { useCart } from '../../CartContext';
import { UserContext } from '../../UserContext';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Xác nhận khi xóa sản phẩm
  const handleRemove = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      removeFromCart(id);
    }
  };

  // Xác nhận khi xóa toàn bộ giỏ hàng
  const handleClear = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  // Chuyển sang trang thanh toán
  const handleCheckout = () => {
    if (!user) {
      alert('Bạn cần đăng nhập để thanh toán!');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <h2>Giỏ hàng của bạn</h2>
      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Giỏ hàng đang trống.</p>
          <Link to="/products" className="cart-link">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id}>
                  <td className="cart-product">
                    <img src={item.image ? (item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image) : ''} alt={item.name} className="cart-product-image" />
                    <span>{item.name}</span>
                  </td>
                  <td>{parseInt(item.price, 10).toLocaleString()}₫</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateQuantity(item._id || item.id, Number(e.target.value))}
                      className="cart-qty-input"
                    />
                  </td>
                  <td>{(parseInt(item.price, 10) * item.quantity).toLocaleString()}₫</td>
                  <td>
                    <button className="cart-remove-btn" onClick={() => handleRemove(item._id || item.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-summary">
            <div className="cart-total">Tổng tiền: <span>{getTotal().toLocaleString()}₫</span></div>
            <button className="cart-clear-btn" onClick={handleClear}>Xóa toàn bộ</button>
            <button className="cart-checkout-btn" onClick={handleCheckout}>Đặt hàng</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
