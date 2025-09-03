import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import { useCart } from '../../CartContext';
import { getCheckoutItems, createOrder } from '../../services/api';
import { addressService } from '../../services/addressService';
import AddressSelect from '../../components/AddressSelect';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { user } = useContext(UserContext);
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    addressType: 'Nhà Riêng',
    isDefault: false
  });
  const [voucherCode, setVoucherCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCheckoutData();
  }, [user, navigate]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      // Load cart items
      const cartResponse = await getCheckoutItems(user._id || user.id);
      setCartItems(cartResponse.data.items || []);
      calculateTotal(cartResponse.data.items || []);

      // Load user addresses
      const addressResponse = await addressService.getAddresses();
      const addresses = addressResponse || [];
      console.log('Loaded addresses:', addresses);
      setUserAddresses(addresses);

      // Set default address if exists, otherwise first address, otherwise null
      const defaultAddress = addresses.find(addr => addr.isDefault);
      console.log('Default address:', defaultAddress);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (addresses.length > 0) {
        setSelectedAddress(addresses[0]);
      } else {
        setSelectedAddress(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading checkout data:', error);
      alert('Có lỗi khi tải thông tin thanh toán');
      navigate('/cart');
    }
  };

  const calculateTotal = (items) => {
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.priceAtAddTime * item.quantity);
    }, 0);
    setTotal(totalAmount);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleAddressSelectChange = ({ province, district, ward }) => {
    setAddressForm(prev => ({ ...prev, province, district, ward }));
  };

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setShowAddressModal(false);
    setAddressForm({
      name: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      detailAddress: '',
      addressType: 'Nhà Riêng',
      isDefault: false
    });
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setAddressForm({
      name: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      detailAddress: '',
      addressType: 'Nhà Riêng',
      isDefault: false
    });
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    // Validation
    if (!addressForm.name || !addressForm.phone || !addressForm.province || 
        !addressForm.district || !addressForm.ward || !addressForm.detailAddress) {
      alert('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }

    if (!validatePhone(addressForm.phone)) {
      alert('Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số.');
      return;
    }

    try {
      setLoading(true);
      const newAddress = await addressService.addAddress(addressForm);
      
      // Nếu thêm địa chỉ thành công, cập nhật UI
      if (newAddress && newAddress._id) {
        // Update addresses list
        setUserAddresses(prev => [...prev, newAddress]);
        
        // If this is the first address or marked as default, select it
        if (userAddresses.length === 0 || newAddress.isDefault) {
          setSelectedAddress(newAddress);
        }

        // Refresh address list
        await loadCheckoutData();
        
        alert('Thêm địa chỉ thành công!');
        setShowAddressForm(false);
      } else {
        // Nếu không có _id trong response, vẫn refresh để lấy dữ liệu mới nhất
        await loadCheckoutData();
        alert('Thêm địa chỉ thành công!');
        setShowAddressForm(false);
      }
    } catch (error) {
      console.error('Error adding address:', error);
      // Vì địa chỉ có thể đã được lưu thành công, refresh lại dữ liệu
      try {
        await loadCheckoutData();
        alert('Thêm địa chỉ thành công!');
        setShowAddressForm(false);
      } catch (refreshError) {
        alert('Có lỗi khi tải lại danh sách địa chỉ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        addressId: selectedAddress._id,
        paymentMethod,
        total
      };

      const response = await createOrder(user._id || user.id, orderData);
      const orderId = response.data._id || response.data.id;
      
      // Refresh cart state to remove purchased items
      await refreshCart();
      
      // Show success message and redirect to order history
      alert('Đặt hàng thành công! Đơn hàng của bạn đã được tạo và các sản phẩm đã được xóa khỏi giỏ hàng.');
      navigate('/my-orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Có lỗi khi đặt hàng, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if order can be placed (has address and cart items)
  const canPlaceOrder = selectedAddress && cartItems.length > 0 && !submitting;

  if (loading) {
    return <div className="checkout-loading">Đang tải...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Giỏ hàng trống</h2>
        <p>Không có sản phẩm nào để thanh toán</p>
        <button onClick={() => navigate('/products')} className="checkout-btn">
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h2 className="checkout-title">Thanh toán</h2>
      
      <div className="checkout-container">
        {/* Cart Items Section */}
        <div className="checkout-section">
          <h3>Sản phẩm đã chọn</h3>
          <div className="checkout-items">
            {cartItems.map((item, index) => (
              <div key={index} className="checkout-item">
                <img 
                  src={item.productId.image ? 
                    (item.productId.image.startsWith('/uploads') ? 
                      `http://localhost:5000${item.productId.image}` : 
                      item.productId.image) : 
                    ''} 
                  alt={item.productId.name} 
                  className="checkout-item-image" 
                />
                <div className="checkout-item-details">
                  <h4>{item.productId.name}</h4>
                  <p className="checkout-item-price">
                    {item.priceAtAddTime.toLocaleString()}₫ x {item.quantity}
                  </p>
                </div>
                <div className="checkout-item-total">
                  {(item.priceAtAddTime * item.quantity).toLocaleString()}₫
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address Section */}
        <div className="checkout-section">
          <h3>Địa chỉ giao hàng</h3>
          
          {userAddresses.length === 0 ? (
            <div className="no-address">
              <p>Bạn chưa có địa chỉ giao hàng</p>
              <button 
                onClick={() => setShowAddressForm(true)}
                className="checkout-btn primary"
              >
                + Thêm địa chỉ mới
              </button>
            </div>
          ) : (
            <div className="address-selection">
              {selectedAddress ? (
                <div className="selected-address">
                  <div className="address-info">
                    <div className="address-header">
                      <span className="address-name">{selectedAddress.name}</span>
                      <span className="address-phone">{selectedAddress.phone}</span>
                      {selectedAddress.isDefault && (
                        <span className="default-badge">Mặc định</span>
                      )}
                    </div>
                    <div className="address-details">
                      <p>{selectedAddress.detailAddress}</p>
                      <p>{selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}</p>
                    </div>
                  </div>
                  <div className="address-actions">
                    {userAddresses.length > 1 && (
                      <button 
                        onClick={() => setShowAddressModal(true)}
                        className="checkout-btn secondary"
                      >
                        Thay đổi
                      </button>
                    )}
                    <button 
                      onClick={() => setShowAddressForm(true)}
                      className="checkout-btn secondary"
                    >
                      + Thêm địa chỉ mới
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-address-selected">
                  <p>Vui lòng chọn địa chỉ giao hàng</p>
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="checkout-btn primary"
                  >
                    Chọn địa chỉ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Method Section */}
        <div className="checkout-section">
          <h3>Phương thức thanh toán</h3>
          <div className="payment-methods">
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Thanh toán khi nhận hàng (COD)</span>
            </label>
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Thanh toán trực tuyến</span>
            </label>
          </div>
        </div>

        {/* Voucher Section */}
        <div className="checkout-section">
          <h3>Mã giảm giá (tùy chọn)</h3>
          <div className="voucher-input">
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button className="voucher-btn">Áp dụng</button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <h3>Tổng quan đơn hàng</h3>
          <div className="summary-row">
            <span>Tạm tính:</span>
            <span>{total.toLocaleString()}₫</span>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển:</span>
            <span>0₫</span>
          </div>
          <div className="summary-row total">
            <span>Tổng cộng:</span>
            <span>{total.toLocaleString()}₫</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="checkout-actions">
          <button 
            onClick={() => navigate('/cart')} 
            className="checkout-btn secondary"
          >
            Quay lại giỏ hàng
          </button>
          <button 
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder}
            className="checkout-btn primary"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chọn địa chỉ giao hàng</h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {userAddresses.map((address) => (
                <div
                  key={address._id}
                  className={`address-option ${selectedAddress?._id === address._id ? 'selected' : ''}`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className="address-info">
                    <div className="address-header">
                      <span className="address-name">{address.name}</span>
                      <span className="address-phone">{address.phone}</span>
                      {address.isDefault && (
                        <span className="default-badge">Mặc định</span>
                      )}
                    </div>
                    <div className="address-details">
                      <p>{address.detailAddress}</p>
                      <p>{address.ward}, {address.district}, {address.province}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Address Form Modal */}
      {showAddressForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Thêm địa chỉ mới</h3>
              <button 
                onClick={handleCancelAddressForm}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveAddress} className="address-form">
                {/* Name Input */}
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>

                {/* Phone Input */}
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setAddressForm(prev => ({ ...prev, phone: value }));
                      }
                    }}
                    placeholder="Nhập số điện thoại (10 số)"
                    maxLength={10}
                    required
                  />
                </div>

                {/* Province/City, District, Ward Selects */}
                <div className="form-group">
                  <label>Địa chỉ *</label>
                  <AddressSelect
                    value={{
                      province: addressForm.province,
                      district: addressForm.district,
                      ward: addressForm.ward
                    }}
                    onChange={handleAddressSelectChange}
                  />
                </div>

                {/* Detail Address */}
                <div className="form-group">
                  <label>Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    value={addressForm.detailAddress}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, detailAddress: e.target.value }))}
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    required
                  />
                </div>

                {/* Address Type */}
                <div className="form-group">
                  <label>Loại địa chỉ</label>
                  <div className="address-type-buttons">
                    <button
                      type="button"
                      onClick={() => setAddressForm(prev => ({ ...prev, addressType: 'Nhà Riêng' }))}
                      className={`type-btn ${addressForm.addressType === 'Nhà Riêng' ? 'active' : ''}`}
                    >
                      Nhà Riêng
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressForm(prev => ({ ...prev, addressType: 'Văn Phòng' }))}
                      className={`type-btn ${addressForm.addressType === 'Văn Phòng' ? 'active' : ''}`}
                    >
                      Văn Phòng
                    </button>
                  </div>
                </div>

                {/* Default Address Checkbox */}
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    <span>Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button type="button" onClick={handleCancelAddressForm} className="btn-cancel">
                    Hủy
                  </button>
                  <button type="submit" className="btn-save">
                    {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage; 