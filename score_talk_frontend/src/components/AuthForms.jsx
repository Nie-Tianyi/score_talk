import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import classes from "./AuthForms.module.css";

/**
 * LoginForm 组件 - 用户登录表单
 *
 * 这个组件负责：
 * 1. 提供用户登录界面
 * 2. 收集用户名和密码
 * 3. 调用身份验证上下文的登录函数
 * 4. 处理登录过程中的加载状态和错误信息
 * 5. 登录成功后执行回调函数（如跳转到首页）
 *
 * 表单字段：
 * - 用户名：必填，文本输入框
 * - 密码：必填，密码输入框
 *
 * 状态管理：
 * - form: 存储表单数据
 * - error: 存储错误信息
 * - loading: 控制加载状态
 *
 * @file AuthForms.jsx
 * @description 登录表单组件
 * @param {Object} props - 组件属性
 * @param {Function} [props.onSuccess] - 登录成功后的回调函数
 * @returns {JSX.Element} 登录表单组件
 */
export function LoginForm({ onSuccess }) {
  // 从身份验证上下文获取登录函数
  const { login } = useAuth();

  // 表单数据状态
  const [form, setForm] = useState({ username: "", password: "" });

  // 错误信息状态
  const [error, setError] = useState(null);

  // 加载状态，用于显示加载提示和禁用按钮
  const [loading, setLoading] = useState(false);

  /**
   * 处理表单提交
   *
   * 用户提交登录表单时调用：
   * 1. 阻止表单默认提交行为
   * 2. 清空之前的错误信息
   * 3. 设置加载状态
   * 4. 调用登录函数
   * 5. 登录成功后执行回调函数
   * 6. 处理登录失败的错误信息
   * 7. 无论成功失败都结束加载状态
   *
   * @param {Event} e - 表单提交事件
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 调用身份验证上下文的登录函数
      await login(form.username, form.password);
      // 登录成功后执行回调函数
      onSuccess?.();
    } catch (err) {
      // 显示错误信息
      setError(err.message || "登录失败");
    } finally {
      // 结束加载状态
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={classes.card}>
      {/* 表单标题 */}
      <h2>登录</h2>

      {/* 用户名输入框 */}
      <label>
        用户名
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          // 禁用状态：加载时禁用输入
          disabled={loading}
        />
      </label>

      {/* 密码输入框 */}
      <label>
        密码
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          // 禁用状态：加载时禁用输入
          disabled={loading}
        />
      </label>

      {/* 错误信息显示区域 */}
      {error && <p className={classes.error}>{error}</p>}

      {/* 提交按钮 */}
      <button type="submit" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </button>
    </form>
  );
}

/**
 * RegisterForm 组件 - 用户注册表单
 *
 * 这个组件负责：
 * 1. 提供用户注册界面
 * 2. 收集用户名、昵称和密码
 * 3. 调用身份验证上下文的注册函数
 * 4. 处理注册过程中的加载状态和错误信息
 * 5. 注册成功后自动登录并执行回调函数
 *
 * 表单字段：
 * - 用户名：必填，文本输入框
 * - 昵称：必填，文本输入框
 * - 密码：必填，密码输入框，最小长度6位
 *
 * 状态管理：
 * - form: 存储表单数据
 * - error: 存储错误信息
 * - loading: 控制加载状态
 *
 * 注册流程：
 * 1. 用户填写注册信息
 * 2. 提交表单调用注册API
 * 3. 注册成功后自动调用登录API
 * 4. 登录成功后执行回调函数
 *
 * @file AuthForms.jsx
 * @description 注册表单组件
 * @param {Object} props - 组件属性
 * @param {Function} [props.onSuccess] - 注册成功后的回调函数
 * @returns {JSX.Element} 注册表单组件
 */
export function RegisterForm({ onSuccess }) {
  // 从身份验证上下文获取注册函数
  const { register } = useAuth();

  // 表单数据状态
  const [form, setForm] = useState({
    username: "",
    nickname: "",
    password: "",
  });

  // 错误信息状态
  const [error, setError] = useState(null);

  // 加载状态，用于显示加载提示和禁用按钮
  const [loading, setLoading] = useState(false);

  /**
   * 处理表单提交
   *
   * 用户提交注册表单时调用：
   * 1. 阻止表单默认提交行为
   * 2. 清空之前的错误信息
   * 3. 设置加载状态
   * 4. 调用注册函数（注册成功后会自动登录）
   * 5. 注册成功后执行回调函数
   * 6. 处理注册失败的错误信息
   * 7. 无论成功失败都结束加载状态
   *
   * @param {Event} e - 表单提交事件
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 调用身份验证上下文的注册函数
      // 注意：register 函数内部会先调用注册API，然后自动调用登录API
      await register(form.username, form.nickname, form.password);
      // 注册并登录成功后执行回调函数
      onSuccess?.();
    } catch (err) {
      // 显示错误信息
      setError(err.message || "注册失败");
    } finally {
      // 结束加载状态
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={classes.card}>
      {/* 表单标题 */}
      <h2>注册</h2>

      {/* 用户名输入框 */}
      <label>
        用户名
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          // 禁用状态：加载时禁用输入
          disabled={loading}
        />
      </label>

      {/* 昵称输入框 */}
      <label>
        昵称
        <input
          value={form.nickname}
          onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          required
          // 禁用状态：加载时禁用输入
          disabled={loading}
        />
      </label>

      {/* 密码输入框 */}
      <label>
        密码（至少 6 位）
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
          // 禁用状态：加载时禁用输入
          disabled={loading}
        />
      </label>

      {/* 错误信息显示区域 */}
      {error && <p className={classes.error}>{error}</p>}

      {/* 提交按钮 */}
      <button type="submit" disabled={loading}>
        {loading ? "注册中..." : "注册并登录"}
      </button>
    </form>
  );
}
