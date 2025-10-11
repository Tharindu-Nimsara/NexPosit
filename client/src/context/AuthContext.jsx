/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token) {
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (err) {
            console.error("Error parsing user data:", err);
            // If saved user is corrupted, fetch from API
            await fetchUserData();
          }
        } else {
          // Token exists but no saved user - fetch from API
          await fetchUserData();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fetch user data from API using token
  const fetchUserData = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.success) {
        const userData = response.data.user;
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      // If token is invalid, clear everything
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return { success: false, error: "Invalid token" };
    }
  };

  // Handle OAuth callback (when user returns from Google)
  const handleOAuthCallback = async (token) => {
    try {
      setError(null);
      setLoading(true);

      // Store the token
      localStorage.setItem("token", token);

      // Fetch user data from API
      const result = await fetchUserData();

      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Authentication failed";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);

      if (response.success) {
        const { user, token } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);

      if (response.success) {
        const { user, token } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  // Refresh user data
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      return await fetchUserData();
    }
    return { success: false, error: "No token found" };
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    handleOAuthCallback,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};