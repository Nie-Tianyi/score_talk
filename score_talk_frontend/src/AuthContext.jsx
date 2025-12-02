import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, getMe, registerUser } from "./api";

/**
 * ScoreTalk 身份验证上下文
 *
 * 这个文件提供了应用的身份验证管理功能，包括：
 * 1. 用户登录/注册/登出
 * 2. 用户信息管理
 * 3. 认证状态持久化
 * 4. 认证状态共享
 *
 * 注意：这个文件导出了非组件的内容（AuthProvider 和 useAuth），
 * 因此禁用了 React 快速刷新功能。这是有意为之的设计选择，
 * 因为身份验证上下文需要在应用级别提供状态管理。
 *
 * @file AuthContext.jsx
 * @description 身份验证上下文提供者
 */

/**
 * 创建身份验证上下文
 *
 * 这个上下文将用于在整个应用中共享身份验证状态和功能
 * 初始值为 null，确保在没有提供者的情况下使用会抛出错误
 */
const AuthContext = createContext(null);

/**
 * AuthProvider 组件 - 身份验证上下文提供者
 *
 * 这个组件包装应用，提供身份验证相关的状态和功能
 * 它管理：
 * 1. JWT token 的存储和获取
 * 2. 当前用户信息的获取和更新
 * 3. 登录、注册、登出功能
 * 4. 用户角色和权限判断
 *
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} 身份验证上下文提供者
 */
export function AuthProvider({ children }) {
  /**
   * JWT token 状态
   *
   * 从 localStorage 初始化 token，实现页面刷新后保持登录状态
   * token 用于 API 请求的身份验证
   */
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  /**
   * 当前用户信息状态
   *
   * 存储从服务器获取的当前用户信息
   * 包括用户ID、用户名、昵称、角色等
   */
  const [user, setUser] = useState(null);

  /**
   * 用户信息加载状态
   *
   * 当存在 token 时，需要从服务器获取用户信息
   * 这个状态用于显示加载提示
   */
  const [loadingUser, setLoadingUser] = useState(!!token);

  /**
   * 监听 token 变化，自动获取用户信息
   *
   * 当 token 发生变化时：
   * 1. 如果 token 为空，清空用户信息
   * 2. 如果 token 存在，从服务器获取用户信息
   * 3. 如果获取失败，清除无效的 token
   */
  useEffect(() => {
    if (!token) {
      // 没有 token，清空用户信息
      requestAnimationFrame(() => {
        setUser(null);
        setLoadingUser(false);
      });
      return;
    }

    /**
     * 获取当前用户信息
     *
     * 使用 token 从服务器获取当前登录用户的信息
     * 如果获取失败，说明 token 无效，清除本地存储的 token
     */
    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        // token 无效，清除本地存储
        setToken(null);
        localStorage.removeItem("token");
      })
      .finally(() => setLoadingUser(false));
  }, [token]);

  /**
   * 用户登录函数
   *
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<void>} 登录结果
   * @throws {Error} 登录失败时抛出错误
   */
  async function login(username, password) {
    const data = await loginUser({ username, password });
    // 将 token 存储到 localStorage，实现持久化
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  }

  /**
   * 用户注册函数
   *
   * 注册成功后自动登录，提供更好的用户体验
   *
   * @param {string} username - 用户名
   * @param {string} nickname - 昵称
   * @param {string} password - 密码
   * @returns {Promise<void>} 注册结果
   * @throws {Error} 注册失败时抛出错误
   */
  async function register(username, nickname, password) {
    await registerUser({ username, nickname, password });
    // 注册成功后自动登录
    await login(username, password);
  }

  /**
   * 用户登出函数
   *
   * 清除本地存储的 token 和用户信息
   */
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  /**
   * 身份验证上下文值
   *
   * 提供给子组件使用的身份验证相关状态和功能
   */
  const value = {
    /** JWT token */
    token,
    /** 当前用户信息 */
    user,
    /** 用户信息加载状态 */
    loadingUser,
    /** 登录函数 */
    login,
    /** 登出函数 */
    logout,
    /** 注册函数 */
    register,
    /** 是否是管理员 */
    isAdmin: user?.role === "admin",
    /** 是否已认证（是否有有效的 token） */
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth 钩子 - 使用身份验证上下文
 *
 * 这个钩子提供了访问身份验证上下文的便捷方式
 * 必须在 AuthProvider 内部使用
 *
 * @returns {Object} 身份验证上下文值
 * @throws {Error} 如果在 AuthProvider 外部使用会抛出错误
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
