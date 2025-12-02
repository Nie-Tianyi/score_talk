import React, { useEffect, useState, useCallback } from "react";
import { getPost, listComments, createComment, deleteComment } from "../api";
import { useAuth } from "../AuthContext";
import classes from "./PostDetail.module.css";

/**
 * PostDetail 组件 - 帖子详情页面
 *
 * 这个组件负责：
 * 1. 显示单个帖子的详细信息（标题、内容、作者、发布时间）
 * 2. 显示该帖子的所有评论列表
 * 3. 提供评论表单，允许用户发表评论
 * 4. 提供评论删除功能（评论作者本人或管理员）
 * 5. 处理评论的创建和删除操作
 *
 * 组件结构：
 * - 帖子详情区域：显示帖子的完整内容
 * - 评论列表区域：显示所有评论
 * - 评论表单区域：提供评论输入和提交
 *
 * 权限控制：
 * - 所有用户都可以查看帖子详情和评论
 * - 只有已登录用户可以发表评论
 * - 只有评论作者本人或管理员可以删除评论
 *
 * @file PostDetail.jsx
 * @description 帖子详情组件
 * @param {Object} props - 组件属性
 * @param {number} props.postId - 帖子 ID
 * @returns {JSX.Element} 帖子详情组件
 */
export function PostDetail({ postId }) {
  // 从身份验证上下文获取认证状态和用户信息
  const { isAdmin, user, isAuthenticated } = useAuth();

  // 帖子详情状态
  const [post, setPost] = useState(null);

  // 评论列表状态
  const [comments, setComments] = useState([]);

  // 评论输入框状态
  const [commentText, setCommentText] = useState("");

  // 加载状态
  const [loadingPost, setLoadingPost] = useState(false); // 帖子详情加载状态
  const [loadingComments, setLoadingComments] = useState(false); // 评论列表加载状态

  // 错误信息状态
  const [error, setError] = useState(null);

  /**
   * 加载帖子详情
   *
   * 从 API 获取指定 ID 的帖子详情，包括：
   * - 帖子标题
   * - 帖子内容
   * - 作者信息
   * - 创建时间
   */
  const loadPost = useCallback(() => {
    return getPost(postId)
      .then(setPost)
      .catch((err) => setError(err.message || "加载帖子失败"));
  }, [postId]);

  /**
   * 加载评论列表
   *
   * 从 API 获取该帖子的所有评论
   * 支持分页，默认加载第一页的 50 条记录
   */
  const loadComments = useCallback(() => {
    return listComments(postId, { page: 1, perPage: 50 })
      .then((data) => setComments(data.items || []))
      .catch((err) => {
        console.error("加载评论失败:", err);
        // 评论加载失败不影响帖子详情显示，所以不设置错误状态
      });
  }, [postId]);

  /**
   * 组件挂载和帖子 ID 变化时的副作用
   *
   * 当 postId 变化时：
   * 1. 清空之前的错误信息
   * 2. 加载新的帖子详情
   * 3. 加载新的评论列表
   */
  useEffect(() => {
    // 使用异步函数避免在 effect 中直接调用 setState
    const fetchData = async () => {
      setError(null);
      setLoadingPost(true);
      setLoadingComments(true);
      try {
        await loadPost();
        await loadComments();
      } finally {
        setLoadingPost(false);
        setLoadingComments(false);
      }
    };
    fetchData();
  }, [postId, loadPost, loadComments]);

  /**
   * 处理评论提交
   *
   * 用户提交评论表单时调用：
   * 1. 检查用户是否已登录
   * 2. 提交评论数据到 API
   * 3. 成功后刷新评论列表
   * 4. 清空评论输入框
   *
   * @param {Event} e - 表单提交事件
   */
  async function handleComment(e) {
    e.preventDefault();

    // 检查用户是否已登录
    if (!isAuthenticated) {
      setError("请先登录再评论");
      return;
    }

    setError(null);
    try {
      // 提交评论到 API
      await createComment(postId, { content: commentText });

      // 清空评论输入框
      setCommentText("");

      // 刷新评论列表
      loadComments();
    } catch (err) {
      // 显示错误消息
      setError(err.message || "评论失败");
    }
  }

  /**
   * 删除评论
   *
   * 只有评论作者本人或管理员可以调用这个函数
   * 删除成功后刷新评论列表
   *
   * @param {Event} e - 点击事件
   * @param {number} commentId - 要删除的评论 ID
   */
  async function handleDeleteComment(e, commentId) {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡

    // 检查用户是否已登录
    if (!isAuthenticated) {
      setError("请先登录再删除评论");
      return;
    }

    setError(null);
    try {
      // 调用 API 删除评论
      await deleteComment(commentId);

      // 刷新评论列表
      loadComments();
    } catch (err) {
      // 显示错误信息
      setError(err.message || "评论删除失败");
    }
  }

  return (
    <div className={classes.card}>
      {/* 帖子详情区域 */}
      {loadingPost ? (
        // 加载状态提示
        <p>帖子加载中...</p>
      ) : error ? (
        // 错误信息显示
        <p className={classes.error}>{error}</p>
      ) : post ? (
        // 帖子详情内容
        <>
          {/* 帖子标题 */}
          <h3>{post.title}</h3>

          {/* 帖子元信息 */}
          <p className={classes["post-meta"]}>
            作者 ID：{post.author_id} ·{" "}
            {new Date(post.created_at).toLocaleString()}
          </p>

          {/* 帖子内容，使用 pre-wrap 保留换行和空格 */}
          <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
        </>
      ) : (
        // 帖子不存在提示
        <p>帖子不存在。</p>
      )}

      <hr />

      {/* 评论区域标题 */}
      <h4>评论</h4>

      {/* 评论列表区域 */}
      {loadingComments ? (
        // 评论加载状态提示
        <p>评论加载中...</p>
      ) : comments.length === 0 ? (
        // 空评论列表提示
        <p>暂时还没有评论。</p>
      ) : (
        // 评论列表
        <ul className={classes["comment-list"]}>
          {comments.map((c) => (
            <li key={c.comment_id} className={classes["comment-item"]}>
              {/* 评论内容 */}
              <div>{c.content}</div>

              {/* 评论元信息和删除按钮 */}
              <div className={classes["comment-meta"]}>
                用户 ID：{c.author_id} ·{" "}
                {new Date(c.created_at).toLocaleString()} ·{" "}
                {/* 删除按钮（评论作者本人或管理员可见） */}
                {(isAdmin || c.author_id === user?.user_id) && (
                  <div
                    className={classes.deleteBtn}
                    onClick={(e) => handleDeleteComment(e, c.comment_id)}
                  >
                    删除
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 评论表单区域 */}
      {isAuthenticated ? (
        // 已登录用户：显示评论表单
        <form onSubmit={handleComment} className={classes["comment-form"]}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            required
          />
          <button type="submit">发表评论</button>
        </form>
      ) : (
        // 未登录用户：显示登录提示
        <p className={classes["hint"]}>登录后可以发表评论。</p>
      )}
    </div>
  );
}
