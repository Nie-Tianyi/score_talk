import React, { useEffect, useState } from "react";
import { getPost, listComments, createComment } from "../api";
import { useAuth } from "../AuthContext";
import classes from "./PostDetail.module.css";

export function PostDetail({ postId }) {
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState(null);

  function loadPost() {
    setLoadingPost(true);
    getPost(postId)
      .then(setPost)
      .catch((err) => setError(err.message || "加载帖子失败"))
      .finally(() => setLoadingPost(false));
  }

  function loadComments() {
    setLoadingComments(true);
    listComments(postId, { page: 1, perPage: 50 })
      .then((data) => setComments(data.items || []))
      .catch(console.error)
      .finally(() => setLoadingComments(false));
  }

  useEffect(() => {
    setError(null);
    loadPost();
    loadComments();
  }, [postId]);

  async function handleComment(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("请先登录再评论");
      return;
    }
    setError(null);
    try {
      await createComment(postId, { content: commentText });
      setCommentText("");
      loadComments();
    } catch (err) {
      setError(err.message || "评论失败");
    }
  }

  return (
    <div className={classes.card}>
      {loadingPost ? (
        <p>帖子加载中...</p>
      ) : error ? (
        <p className={classes.error}>{error}</p>
      ) : post ? (
        <>
          <h3>{post.title}</h3>
          <p className={classes["post-meta"]}>
            作者 ID：{post.author_id} ·{" "}
            {new Date(post.created_at).toLocaleString()}
          </p>
          <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
        </>
      ) : (
        <p>帖子不存在。</p>
      )}

      <hr />
      <h4>评论</h4>
      {loadingComments ? (
        <p>评论加载中...</p>
      ) : comments.length === 0 ? (
        <p>暂时还没有评论。</p>
      ) : (
        <ul className={classes["comment-list"]}>
          {comments.map((c) => (
            <li key={c.comment_id} className={classes["comment-item"]}>
              <div>{c.content}</div>
              <div className={classes["comment-meta"]}>
                用户 ID：{c.author_id} ·{" "}
                {new Date(c.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isAuthenticated ? (
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
        <p className={classes["hint"]}>登录后可以发表评论。</p>
      )}
    </div>
  );
}
