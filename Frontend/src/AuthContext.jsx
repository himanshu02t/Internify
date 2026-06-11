import React, { createContext, useState, useEffect } from "react";
import API from "./api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || "Login failed. Please check your credentials."
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, skills, role, company) => {
    setLoading(true);
    try {
      // Create user
      await API.post("/auth/signup", { name, email, password, skills, role, company });
      // Auto-login after successful signup
      return await login(email, password);
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.response?.data?.msg || "Sign up failed."
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (name, skills, bio) => {
    setLoading(true);
    try {
      const res = await API.put("/auth/profile", { name, skills, bio });
      const updatedUser = res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || "Failed to update profile."
      };
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await API.post("/auth/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const updatedUser = res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || "Failed to upload resume."
      };
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async () => {
    setLoading(true);
    try {
      const res = await API.put("/auth/toggle-role");
      const updatedUser = res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || "Failed to switch role."
      };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email });
      return { success: true, msg: res.data.msg, previewUrl: res.data.previewUrl };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || "Failed to send reset token."
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, token, newPassword) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/reset-password", { email, token, newPassword });
      return { success: true, msg: res.data.msg };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || "Failed to reset password."
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        uploadResume,
        toggleRole,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
