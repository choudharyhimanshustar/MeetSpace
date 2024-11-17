import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token }); // You can expand this to include more user info if needed
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token); // Store token in localStorage
    setUser({ token }); // Update user state
  };

  const logout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setUser(null); // Clear user state
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};