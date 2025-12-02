import React, { useEffect, useState } from "react";
import { listPosts, createPost, deletePost } from "../api";
import { useAuth } from "../AuthContext";
import { PostDetail } from "./PostDetail";
import classes from "./PostList.module.css";

/**
 * PostList 组件 - 帖子列表页面
 *
 * 这个组件负责：
 * 1. 显示所有帖子的列表
 * 2. 提供帖子创建功能（已登录用户）
 * 3. 提供帖子删除功能（作者本人或管理员）
 * 4. 管理帖子选择状态，显示选中的帖子详情
 *
 * 组件布局采用两栏设计：
 * - 左侧：帖子列表和创建表单
 * - 右侧：选中帖子的详情和评论功能
 *
 * 权限控制：
 * - 所有用户都可以查看帖子列表
 * - 只有已登录用户可以创建新帖子
 * - 只有帖子作者本人或管理员可以删除帖子
 *
 * @file PostList.jsx
 * @description 帖子列表组件
 * @returns {JSX.Element} 帖子列表组件
 */
export function PostList() {
  // 从身份验证上下文获取认证状态和用户信息
  const { isAdmin, user, isAuthenticated } = useAuth();

  // 帖子列表状态
  const [posts, setPosts] = useState([]);

  // 当前选中的帖子 ID，null 表示没有选中任何帖子
  const [selectedPostId, setSelectedPostId] = useState(null);

  // 加载状态，用于显示加载提示
  const [loading, setLoading] = useState(false);

  // 创建帖子表单数据
  const [form, setForm] = useState({ title: "", content: "" });

  // 错误信息状态
  const [error, setError] = useState(null);

  /**
   * 加载帖子列表
   *
   * 从 API 获取所有帖子，支持分页
   * 默认加载第一页的 20 条记录
   */
  function loadPosts() {
    return listPosts()
      .then((data) => setPosts(data.items || []))
      .catch((err) => setError(err.message || "加载帖子失败"));
  }

  /**
   * 组件挂载时加载帖子列表
   *
   * 这个 effect 在组件首次渲染时执行
   * 依赖数组为空，表示只执行一次
   */
  useEffect(() => {
    // 使用异步函数避免在 effect 中直接调用 setState
    const fetchPosts = async () => {
      setLoading(true);
      try {
        await loadPosts();
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  /**
   * 创建新帖子
   *
   * 只有已登录用户可以调用这个函数
   * 创建成功后：
   * 1. 将新帖子添加到列表
   * 2. 清空表单
   * 3. 自动选中新创建的帖子
   *
   * @param {Event} e - 表单提交事件
   */
  async function handleCreatePost(e) {
    e.preventDefault();
    setError(null);
    try {
      // 调用 API 创建新帖子
      const p = await createPost(form);

      // 清空表单
      setForm({ title: "", content: "" });

      // 重新加载帖子列表
      loadPosts();

      // 自动选中新创建的帖子
      setSelectedPostId(p.post_id);
    } catch (err) {
      // 显示错误信息
      setError(err.message || "发帖失败");
    }
  }

  /**
   * 删除帖子
   *
   * 只有帖子作者本人或管理员可以调用这个函数
   * 删除成功后：
   * 1. 从帖子列表中移除
   * 2. 如果删除的是当前选中的帖子，清空选中状态
   *
   * @param {Event} e - 点击事件
   * @param {number} post_id - 要删除的帖子 ID
   */
  async function handleDeletePost(e, post_id) {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡，避免触发帖子选择

    setError(null);
    try {
      // 调用 API 删除帖子
      await deletePost(post_id);

      // 重新加载帖子列表
      loadPosts();

      // 如果删除的是当前选中的帖子，清空选中状态
      if (selectedPostId === post_id) {
        setSelectedPostId(null);
      }
    } catch (err) {
      // 显示错误信息
      setError(err.message || "删除帖子失败");
    }
  }

  return (
    <div className={classes.container}>
      {/* 左侧：帖子列表和创建表单 */}
      <div>
        <h2>帖子列表</h2>

        {/* 加载状态提示 */}
        {loading && <p>加载中...</p>}

        {/* 错误信息显示 */}
        {error && <p className={classes.error}>{error}</p>}

        {/* 空状态提示 */}
        {posts.length === 0 && <p>暂无帖子。</p>}

        {/* 帖子列表 */}
        <ul className={classes["post-list"]}>
          {posts.map((p) => (
            <li
              key={p.post_id}
              onClick={() => setSelectedPostId(p.post_id)}
              className={
                classes["post-item"] +
                (selectedPostId === p.post_id
                  ? ` ${classes["post-item--active"]}`
                  : "")
              }
            >
              {/* 帖子标题和删除按钮（作者本人或管理员可见） */}
              <div className={classes["post-title"]}>
                {p.title}
                {(isAdmin || p.author_id === user?.user_id) && (
                  <div
                    className={classes.deleteBtn}
                    onClick={(e) => handleDeletePost(e, p.post_id)}
                  >
                    {" "}
                    | 删除
                  </div>
                )}
              </div>

              {/* 帖子元信息 */}
              <div className={classes["post-meta"]}>
                作者 ID：{p.author_id} ·{" "}
                {new Date(p.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>

        {/* 创建帖子表单（已登录用户可见） */}
        {isAuthenticated && (
          <div className={classes.card} style={{ marginTop: "1rem" }}>
            <h3>发表新帖子</h3>
            <form onSubmit={handleCreatePost}>
              <label>
                标题
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label>
                内容
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  required
                />
              </label>
              <button type="submit">发布</button>
            </form>
          </div>
        )}
      </div>

      {/* 右侧：帖子详情区域 */}
      <div>
        {selectedPostId ? (
          // 显示选中的帖子详情
          <PostDetail postId={selectedPostId} />
        ) : (
          // 未选中任何帖子时的提示
          <p>点击左侧帖子查看详情和评论。</p>
        )}
      </div>
    </div>
  );
}
