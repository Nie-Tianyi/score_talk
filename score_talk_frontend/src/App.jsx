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
      <header className="header">
        <div className="app-header">
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
                {user.nickname}({user.role === "admin"? "管理员":""})
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
