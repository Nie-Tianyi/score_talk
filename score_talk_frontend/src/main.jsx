import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

/**
 * ScoreTalk 前端应用的主入口文件
 *
 * 这个文件是 React 应用的启动点，负责：
 * 1. 渲染 React 应用根组件
 * 2. 启用 React 严格模式
 * 3. 加载全局样式
 *
 * @file main.jsx
 * @description 应用入口文件
 */

/**
 * 获取 DOM 根元素并创建 React 根
 *
 * 使用 React 18 的 createRoot API 创建应用根，这提供了更好的并发特性支持
 * 根元素在 index.html 中定义，id 为 "root"
 */
const rootElement = document.getElementById("root");

/**
 * 创建 React 根并渲染应用
 *
 * 使用 React.StrictMode 包装应用，这有助于：
 * - 检测不安全的生命周期方法
 * - 检测过时的 API 使用
 * - 检测意外的副作用
 * - 检测废弃的 context API
 */
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/*
      主应用组件
      所有其他组件都作为 App 的子组件渲染
    */}
    <App />
  </React.StrictMode>,
);
