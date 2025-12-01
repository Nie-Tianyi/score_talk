import React, { useEffect, useState } from "react";
import { listPosts, createPost } from "../api";
import { useAuth } from "../AuthContext";
import { PostDetail } from "./PostDetail";
import classes from "./PostList.module.css";

export function PostList() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState(null);

  function loadPosts() {
    setLoading(true);
    listPosts()
      .then((data) => setPosts(data.items || []))
      .catch((err) => setError(err.message || "加载帖子失败"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleCreatePost(e) {
    e.preventDefault();
    setError(null);
    try {
      const p = await createPost(form);
      setForm({ title: "", content: "" });
      loadPosts();
      setSelectedPostId(p.post_id);
    } catch (err) {
      setError(err.message || "发帖失败");
    }
  }

  return (
    <div className={classes.container}>
      <div>
        <h2>帖子列表</h2>
        {loading && <p>加载中...</p>}
        {error && <p className={classes.error}>{error}</p>}
        {posts.length === 0 && <p>暂无帖子。</p>}
        <ul className={classes["post-list"]}>
          {posts.map((p) => (
            <li
              key={p.post_id}
              onClick={() => setSelectedPostId(p.post_id)}
              className={
                classes["post-item"] +
                (selectedPostId === p.post_id ? ` ${classes["post-item--active"]}` : "")
              }
            >
            <div className={classes["post-title"]}>{p.title}</div>
              <div className={classes["post-meta"]}>
                作者 ID：{p.author_id} ·{" "}
                {new Date(p.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>

        {isAuthenticated && (
          <div className={classes.card} style={{ marginTop: "1rem" }}>
            <h3>发表新帖子</h3>
            <form onSubmit={handleCreatePost}>
              <label>
                标题
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
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

      <div>
        {selectedPostId ? (
          <PostDetail postId={selectedPostId} />
        ) : (
          <p>点击左侧帖子查看详情和评论。</p>
        )}
      </div>
    </div>
  );
}
