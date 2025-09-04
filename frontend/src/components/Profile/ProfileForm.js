import React, { useState, useContext } from 'react';
import { UserContext } from '../../UserContext';
import './ProfileForm.css';

const ProfileForm = () => {
  const { user, loginUser } = useContext(UserContext);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [birthday, setBirthday] = useState(user?.birthday ? user.birthday.slice(0,10) : "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const updatedUser = {
        ...user,
        name,
        phone,
        gender,
        birthday
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedUser)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      loginUser(data); // Update context with new user data
      setEditMode(false);
      alert('Cập nhật thông tin thành công!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-section">
      <h3>Thông tin cá nhân</h3>
      <form onSubmit={handleSaveProfile}>
        {/* Name Field */}
        <div className="form-group">
          <label>Họ và tên:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editMode}
            className={editMode ? 'editable' : ''}
          />
        </div>

        {/* Phone Field */}
        <div className="form-group">
          <label>Số điện thoại:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!editMode}
            className={editMode ? 'editable' : ''}
          />
        </div>

        {/* Gender Field */}
        <div className="form-group">
          <label>Giới tính:</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={!editMode}
            className={editMode ? 'editable' : ''}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        {/* Birthday Field */}
        <div className="form-group">
          <label>Ngày sinh:</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            disabled={!editMode}
            className={editMode ? 'editable' : ''}
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          {!editMode ? (
            <button 
              type="button" 
              onClick={() => setEditMode(true)}
              className="edit-btn"
            >
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button 
                type="button" 
                onClick={() => setEditMode(false)}
                className="cancel-btn"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="save-btn"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
