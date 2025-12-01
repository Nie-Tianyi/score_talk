// src/components/TopicDetail.jsx
import React, { useEffect, useState } from "react";
import { getTopicStats, listRatings, rateTopic } from "../api";
import { useAuth } from "../AuthContext";

export function TopicDetail({ topicId }) {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [myScore, setMyScore] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [error, setError] = useState(null);
  const [submitMsg, setSubmitMsg] = useState(null);

  function loadStats() {
    getTopicStats(topicId).then(setStats).catch(console.error);
  }

  function loadRatings() {
    setLoadingRatings(true);
    listRatings(topicId, { page: 1, perPage: 20 })
      .then((data) => setRatings(data.items || []))
      .catch(console.error)
      .finally(() => setLoadingRatings(false));
  }

  useEffect(() => {
    setError(null);
    setSubmitMsg(null);
    loadStats();
    loadRatings();
  }, [topicId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("请先登录再评分");
      return;
    }
    setError(null);
    setSubmitMsg(null);
    setLoading(true);
    try {
      await rateTopic(topicId, { score: Number(myScore), comment: myComment });
      setSubmitMsg("评分提交成功！");
      setMyComment("");
      loadStats();
      loadRatings();
    } catch (err) {
      setError(err.message || "评分失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>话题详情 / 评分</h3>
      {stats ? (
        <div className="topic-stats">
          <p>话题 ID：{stats.topic_id}</p>
          <p>平均分：{stats.avg_score ?? "暂无评分"}</p>
          <p>评分数量：{stats.rating_count}</p>
        </div>
      ) : (
        <p>统计信息加载中...</p>
      )}

      <hr />

      <h4>给这个话题打分</h4>
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="rating-form">
          <label>
            分数（1-5）：
            <select
              value={myScore}
              onChange={(e) => setMyScore(e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            简短评论（可选）：
            <input
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="例如：天皇陛下 desu！"
            />
          </label>
          {error && <p className="error">{error}</p>}
          {submitMsg && <p className="success">{submitMsg}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "提交中..." : "提交/更新评分"}
          </button>
        </form>
      ) : (
        <p className="hint">登录后可以给话题打分和评论。</p>
      )}

      <hr />

      <h4>最近评分</h4>
      {loadingRatings ? (
        <p>评分加载中...</p>
      ) : ratings.length === 0 ? (
        <p>暂时还没有人评分。</p>
      ) : (
        <ul className="rating-list">
          {ratings.map((r) => (
            <li key={r.rating_id} className="rating-item">
              <div>
                <strong>{r.score} 分</strong>{" "}
                {r.comment && <span> - {r.comment}</span>}
              </div>
              <div className="rating-meta">
                用户 ID：{r.user_id} · {new Date(r.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
