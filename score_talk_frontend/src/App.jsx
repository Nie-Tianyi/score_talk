import React, { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { LoginForm, RegisterForm } from "./components/AuthForms";
import { TopicList } from "./components/TopicList";
import { PostList } from "./components/PostList";

function AppInner() {
  const { user, isAuthenticated, logout, loadingUser } = useAuth();
  const [view, setView] = useState("topics"); // topics | posts | login | register
  const [searchQuery, setSearchQuery] = useState("");

  if (loadingUser) {
    return <p>加载用户信息...</p>;
  }

  function goHome() {
    setView("topics");
    setSearchQuery("");
  }

  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
  }

  function clearSearch() {
    setSearchQuery("");
  }

  return (
    <div className="app">
      <header className="header">
        <div className="app-header">
          <div className="logo" onClick={goHome}>
            ScoreTalk
          </div>
          <div className="search-container">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder={view === "topics" ? "搜索话题..." : view === "posts" ? "搜索帖子..." : "搜索..."}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button className="search-clear" onClick={clearSearch} aria-label="清除搜索">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          <nav className="nav">
            <button
                className={view === "topics" ? "nav-btn active" : "nav-btn"}
                onClick={() => setView("topics")}
            >
              话题评分
            </button>
            <button
                className={view === "posts" ? "nav-btn active" : "nav-btn"}
                onClick={() => setView("posts")}
            >
              帖子讨论
            </button>
          </nav>
          <div className="auth-bar">
            {isAuthenticated ? (
                <>
              <span>
                {user.nickname}<span className="role">{user.role === "admin"? "ADMIN":"VIP"}</span>
              </span>
                  <button
                      className={"nav-btn active"}
                      onClick={logout}>登出</button>
                </>
            ) : (
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

      <main className="app-main">
        {view === "topics" && <TopicList searchQuery={searchQuery} />}
        {view === "posts" && <PostList searchQuery={searchQuery} />}
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

      <footer className="footer">
        © 2025 ScoreTalk | 版权所有
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
