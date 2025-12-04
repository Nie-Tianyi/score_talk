import React, {useEffect, useState} from "react";
import {listPosts, createPost, deletePost} from "../api";
import {useAuth} from "../AuthContext";
import {PostDetail} from "./PostDetail";
import classes from "./PostList.module.css";

export function PostList({ searchQuery = "" }) {
  const {isAdmin, user, isAuthenticated} = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({title: "", content: ""});
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
      setForm({title: "", content: ""});
      loadPosts();
      setSelectedPostId(p.post_id);
    } catch (err) {
      setError(err.message || "发帖失败");
    }
  }

  async function handleDeletePost(e, post_id) {
    e.preventDefault();
    setError(null);
    try {
      await deletePost(post_id);
      loadPosts();
      setSelectedPostId(null);
    } catch (err) {
      setError(err.message || "删除帖子失败");
    }
  }

  // 根据搜索关键词过滤帖子
  const filteredPosts = posts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      (p.content && p.content.toLowerCase().includes(query))
    );
  });

  return (
    <div className={classes.container}>
      <div>
        <h2>帖子列表</h2>
        {loading && <p>加载中...</p>}
        {error && <p className={classes.error}>{error}</p>}
        {searchQuery && (
          <p className={classes.searchHint}>
            搜索 "{searchQuery}" 找到 {filteredPosts.length} 个帖子
          </p>
        )}
        {posts.length === 0 && <p>暂无帖子。</p>}
        {posts.length > 0 && filteredPosts.length === 0 && (
          <p>未找到匹配的帖子。</p>
        )}
        <ul className={classes["post-list"]}>
          {filteredPosts.map((p) => (
            <li
              key={p.post_id}
              onClick={() => setSelectedPostId(p.post_id)}
              className={
                classes["post-item"] +
                (selectedPostId === p.post_id ? ` ${classes["post-item--active"]}` : "")
              }
            >
              <div className={classes["post-title"]}>{p.title}
                {(isAdmin || p.author_id === user?.user_id) && (
                  <div className={classes.deleteBtn} onClick={(e) => handleDeletePost(e, p.post_id)}> |
                    删除</div>
                )}
              </div>
              <div className={classes["post-meta"]}>
                作者 ID：{p.author_id} ·{" "}
                {new Date(p.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>

        {isAuthenticated && (
          <div className={classes.card} style={{marginTop: "1rem"}}>
            <h3>发表新帖子</h3>
            <form onSubmit={handleCreatePost}>
              <label>
                标题
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({...form, title: e.target.value})
                  }
                  required
                />
              </label>
              <label>
                内容
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({...form, content: e.target.value})
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
          <PostDetail postId={selectedPostId}/>
        ) : (
          <p>点击左侧帖子查看详情和评论。</p>
        )}
      </div>
    </div>
  );
}
