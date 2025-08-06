import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);

  const loginUser = (userData) => {
    // Xử lý avatar thành URL đầy đủ nếu cần
    let avatarUrl = userData.avatar;
    if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
      avatarUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${avatarUrl}`;
    }
    // Đảm bảo đầy đủ các trường cần thiết
    const userWithFullFields = {
      _id: userData._id || userData.id || '',
      username: userData.username || '',
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      gender: userData.gender || '',
      birthday: userData.birthday || '',
      addresses: userData.addresses || [],
      avatar: avatarUrl || '',
      role: userData.role || 'user',
      // Thêm các trường khác nếu cần
    };
    setUser(userWithFullFields);
    localStorage.setItem('user', JSON.stringify(userWithFullFields));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      let avatarUrl = userData.avatar;
      if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
        avatarUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${avatarUrl}`;
      }
      // Đảm bảo đầy đủ các trường cần thiết
      const userWithFullFields = {
        _id: userData._id || userData.id || '',
        username: userData.username || '',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        birthday: userData.birthday || '',
        addresses: userData.addresses || [],
        avatar: avatarUrl || '',
        role: userData.role || 'user',
        // Thêm các trường khác nếu cần
      };
      setUser(userWithFullFields);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
