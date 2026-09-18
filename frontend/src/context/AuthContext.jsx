import { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication state when the application starts
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      // No token means the user is not logged in
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Axios interceptor automatically attaches:
        // Authorization: Bearer <token>
        const response = await api.get("/auth/me");

        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Failed to restore authentication:", error);

        // Token is invalid/expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Called after successful login
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
