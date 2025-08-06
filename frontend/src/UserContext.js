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
    const userWithAvatar = { ...userData, avatar: avatarUrl };
    setUser(userWithAvatar);
    localStorage.setItem('user', JSON.stringify(userWithAvatar));
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
      setUser({ ...userData, avatar: avatarUrl });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
