import React, { useState } from "react";
import { useAuth } from "../AuthContext";

export function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.username, form.password);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>登录</h2>
      <label>
        用户名
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
      </label>
      <label>
        密码
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </button>
    </form>
  );
}

export function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", nickname: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form.username, form.nickname, form.password);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>注册</h2>
      <label>
        用户名
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
      </label>
      <label>
        昵称
        <input
          value={form.nickname}
          onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          required
        />
      </label>
      <label>
        密码（至少 6 位）
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "注册中..." : "注册并登录"}
      </button>
    </form>
  );
}
