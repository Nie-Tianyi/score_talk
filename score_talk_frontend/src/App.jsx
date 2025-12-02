import React, { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { LoginForm, RegisterForm } from "./components/AuthForms";
import { TopicList } from "./components/TopicList";
import { PostList } from "./components/PostList";

/**
 * ScoreTalk 前端应用主组件
 *
 * 这个组件是应用的根组件，负责：
 * 1. 提供身份验证上下文
 * 2. 管理应用的主要视图状态
 * 3. 渲染应用布局（头部、主内容区、底部）
 * 4. 处理导航和视图切换
 *
 * @file App.jsx
 * @description 应用主组件
 */

/**
 * AppInner 组件 - 应用的主要内容组件
 *
 * 这个组件在 AuthProvider 内部渲染，可以访问身份验证上下文
 * 负责：
 * 1. 显示用户认证状态
 * 2. 管理当前视图状态
 * 3. 渲染导航栏和内容区域
 *
 * @returns {JSX.Element} 应用内部组件
 */
function AppInner() {
  // 从身份验证上下文获取用户信息和认证状态
  const { user, isAuthenticated, logout, loadingUser } = useAuth();

  // 当前视图状态，可选值: "topics" | "posts" | "login" | "register"
  const [view, setView] = useState("topics");

  // 如果正在加载用户信息，显示加载提示
  if (loadingUser) {
    return <p>加载用户信息...</p>;
  }

  /**
   * 返回首页的函数
   * 将视图切换到话题列表页面
   */
  function goHome() {
    setView("topics");
  }

  return (
    <div className="app">
      {/* 应用头部 */}
      <header className="header">
        <div className="app-header">
          {/* 应用 Logo，点击返回首页 */}
          <div className="logo" onClick={goHome}>
            ScoreTalk
          </div>

          {/* 主导航栏 */}
          <nav className="nav">
            {/* 话题评分导航按钮 */}
            <button
              className={view === "topics" ? "nav-btn active" : "nav-btn"}
              onClick={() => setView("topics")}
            >
              话题评分
            </button>

            {/* 帖子讨论导航按钮 */}
            <button
              className={view === "posts" ? "nav-btn active" : "nav-btn"}
              onClick={() => setView("posts")}
            >
              帖子讨论
            </button>
          </nav>

          {/* 认证状态栏 */}
          <div className="auth-bar">
            {isAuthenticated ? (
              // 已登录状态：显示用户信息和登出按钮
              <>
                <span>
                  {user.nickname}
                  <span className="role">
                    {user.role === "admin" ? "ADMIN" : "VIP"}
                  </span>
                </span>
                <button className={"nav-btn active"} onClick={logout}>
                  登出
                </button>
              </>
            ) : (
              // 未登录状态：显示登录和注册按钮
              <>
                <button
                  className={view === "login" ? "nav-btn active" : "nav-btn"}
                  onClick={() => setView("login")}
                >
                  登录
                </button>
                <button
                  className={view === "register" ? "nav-btn active" : "nav-btn"}
                  onClick={() => setView("register")}
                >
                  注册
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="app-main">
        {/* 根据当前视图渲染对应的组件 */}
        {view === "topics" && <TopicList />}
        {view === "posts" && <PostList />}
        {view === "login" && (
          <LoginForm
            onSuccess={() => {
              setView("topics");
            }}
          />
        )}
        {view === "register" && (
          <RegisterForm
            onSuccess={() => {
              setView("topics");
            }}
          />
        )}
      </main>

      {/* 应用底部 */}
      <footer className="footer">© 2025 ScoreTalk | 版权所有</footer>
    </div>
  );
}

/**
 * App 组件 - 应用的根组件
 *
 * 这个组件包装了应用的身份验证上下文提供者
 * 所有子组件都可以访问身份验证状态和功能
 *
 * @returns {JSX.Element} 应用根组件
 */
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
