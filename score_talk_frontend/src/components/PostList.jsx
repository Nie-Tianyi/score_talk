import React, {useEffect, useState} from "react";
import {listPosts, createPost, deletePost} from "../api";
import {useAuth} from "../AuthContext";
import {PostDetail} from "./PostDetail";
import {Modal} from "./Modal";
import classes from "./PostList.module.css";

export function PostList({ searchQuery = "" }) {
  const {isAdmin, user, isAuthenticated} = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({title: "", content: ""});
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setLoading(true);
    try {
      const p = await createPost(form);
      setForm({title: "", content: ""});
      setIsModalOpen(false); // 关闭模态框
      loadPosts();
      setSelectedPostId(p.post_id);
    } catch (err) {
      setError(err.message || "发帖失败");
    } finally {
      setLoading(false);
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
          <>
            <button
              className={classes.addButton}
              onClick={() => setIsModalOpen(true)}
              aria-label="发表新帖子"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setForm({title: "", content: ""});
                setError(null);
              }}
              title="发表新帖子"
            >
              <form onSubmit={handleCreatePost} className={classes.modalForm}>
                <label>
                  标题
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({...form, title: e.target.value})
                    }
                    required
                    autoFocus
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
                {error && <p className={classes.error}>{error}</p>}
                <button type="submit" disabled={loading}>
                  {loading ? "发布中..." : "发布"}
                </button>
              </form>
            </Modal>
          </>
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
