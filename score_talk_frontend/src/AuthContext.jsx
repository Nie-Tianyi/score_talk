import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, getMe, registerUser } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(!!token);

  useEffect(() => {
    if (!token) {
      requestAnimationFrame(() => {
        setUser(null);
        setLoadingUser(false);
      });
      return;
    }
    // 拿当前用户信息
    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        setToken(null);
        localStorage.removeItem("token");
      })
      .finally(() => setLoadingUser(false));
  }, [token]);

  async function login(username, password) {
    const data = await loginUser({ username, password });
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  }

  async function register(username, nickname, password) {
    await registerUser({ username, nickname, password });
    // 注册成功后可以自动登录，也可以让用户手动登录，这里选择自动登录体验好点：
    await login(username, password);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  const value = {
    token,
    user,
    loadingUser,
    login,
    logout,
    register,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
