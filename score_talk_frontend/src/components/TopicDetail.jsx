import React, { useEffect, useState } from "react";
import { getTopicStats, listRatings, rateTopic } from "../api";
import { useAuth } from "../AuthContext";
import classes from "./TopicDetail.module.css";

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
    <div className={classes.container}>
      <div className={classes.card}>
        <h3 className={classes.title}>话题详情 / 评分</h3>
        
        {/* 统计信息 */}
        <div className={classes.section}>
          <h4>统计信息</h4>
          {stats ? (
            <div className={classes.stats}>
              <div>话题 ID：{stats.topic_id}</div>
              <div>平均分：{stats.avg_score ?? "暂无评分"}</div>
              <div>评分数量：{stats.rating_count}</div>
            </div>
          ) : (
            <div>统计信息加载中...</div>
          )}
        </div>

        <hr />

        {/* 评分表单 */}
        <div className={classes.section}>
          <h4>给这个话题打分</h4>
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className={classes.form}>
              <div className={classes.formGroup}>
                <label>
                  分数（1-5）：
                  <select
                    value={myScore}
                    onChange={(e) => setMyScore(e.target.value)}
                    className={classes.select}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              
              <div className={classes.formGroup}>
                <label>
                  简短评论（可选）：
                  <input
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    placeholder="例如：天皇陛下 desu！"
                    className={classes.input}
                  />
                </label>
              </div>
              
              {error && <div className={classes.error}>{error}</div>}
              {submitMsg && <div className={classes.success}>{submitMsg}</div>}
              
              <button 
                type="submit" 
                disabled={loading}
                className={classes.button}
              >
                {loading ? "提交中..." : "提交/更新评分"}
              </button>
            </form>
          ) : (
            <div className={classes.hint}>登录后可以给话题打分和评论。</div>
          )}
        </div>

        <hr />

        {/* 最近评分 */}
        <div className={classes.section}>
          <h4>最近评分</h4>
          {loadingRatings ? (
            <div>评分加载中...</div>
          ) : ratings.length === 0 ? (
            <div>暂时还没有人评分。</div>
          ) : (
            <div className={classes.ratings}>
              {ratings.map((r) => (
                <div key={r.rating_id} className={classes.rating}>
                  <div>
                    <strong>{r.score} 分</strong>
                    {r.comment && <span> - {r.comment}</span>}
                  </div>
                  <div className={classes.meta}>
                    用户 ID：{r.user_id} · {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}