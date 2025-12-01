import React, { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { LoginForm, RegisterForm } from "./components/AuthForms";
import { TopicList } from "./components/TopicList";
import { PostList } from "./components/PostList";

function AppInner() {
  const { user, isAuthenticated, logout, loadingUser } = useAuth();
  const [view, setView] = useState("topics"); // topics | posts | login | register

  if (loadingUser) {
    return <p>加载用户信息...</p>;
  }

  function goHome() {
    setView("topics");
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo" onClick={goHome}>
          ScoreTalk
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
                欢迎，{user.nickname}（{user.role}）
              </span>
              <button onClick={logout}>退出</button>
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
      </header>

      <main className="app-main">
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
