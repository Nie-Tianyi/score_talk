import React, { useEffect, useState, useCallback } from "react";
import { getTopicStats, listRatings, rateTopic } from "../api";
import { useAuth } from "../AuthContext";
import classes from "./TopicDetail.module.css";

/**
 * TopicDetail 组件 - 话题详情页面
 *
 * 这个组件负责：
 * 1. 显示单个话题的详细信息
 * 2. 显示话题的统计信息（平均分、评分数量等）
 * 3. 提供评分表单，允许用户给话题打分和评论
 * 4. 显示该话题的所有评分记录
 * 5. 处理评分提交和更新
 *
 * 组件结构：
 * - 统计信息区域：显示话题的基本统计
 * - 评分表单区域：提供评分和评论输入
 * - 评分列表区域：显示所有用户的评分记录
 *
 * @file TopicDetail.jsx
 * @description 话题详情组件
 * @param {Object} props - 组件属性
 * @param {number} props.topicId - 话题 ID
 * @returns {JSX.Element} 话题详情组件
 */
export function TopicDetail({ topicId }) {
  // 从身份验证上下文获取认证状态
  const { isAuthenticated } = useAuth();

  // 话题统计信息状态
  const [stats, setStats] = useState(null);

  // 评分列表状态
  const [ratings, setRatings] = useState([]);

  // 用户评分表单状态
  const [myScore, setMyScore] = useState(5); // 默认评分 5 分
  const [myComment, setMyComment] = useState("");

  // 加载状态
  const [loading, setLoading] = useState(false); // 评分提交加载状态
  const [loadingRatings, setLoadingRatings] = useState(false); // 评分列表加载状态

  // 错误和成功消息状态
  const [error, setError] = useState(null);
  const [submitMsg, setSubmitMsg] = useState(null);

  /**
   * 加载话题统计信息
   *
   * 从 API 获取话题的统计信息，包括：
   * - 平均分
   * - 评分数量
   * - 话题 ID
   */
  const loadStats = useCallback(() => {
    return getTopicStats(topicId)
      .then(setStats)
      .catch((err) => {
        console.error("加载统计信息失败:", err);
        setError("加载统计信息失败");
      });
  }, [topicId]);

  /**
   * 加载评分列表
   *
   * 从 API 获取该话题的所有评分记录
   * 支持分页，默认加载第一页的 20 条记录
   */
  const loadRatings = useCallback(() => {
    return listRatings(topicId, { page: 1, perPage: 20 })
      .then((data) => setRatings(data.items || []))
      .catch((err) => {
        console.error("加载评分列表失败:", err);
        setError("加载评分列表失败");
      });
  }, [topicId]);

  /**
   * 组件挂载和话题 ID 变化时的副作用
   *
   * 当 topicId 变化时：
   * 1. 清空之前的错误和成功消息
   * 2. 加载新的统计信息
   * 3. 加载新的评分列表
   */
  useEffect(() => {
    // 使用异步函数避免在 effect 中直接调用 setState
    const fetchData = async () => {
      setError(null);
      setSubmitMsg(null);
      setLoadingRatings(true);
      try {
        await loadStats();
        await loadRatings();
      } finally {
        setLoadingRatings(false);
      }
    };
    fetchData();
  }, [topicId, loadStats, loadRatings]);

  /**
   * 处理评分提交
   *
   * 用户提交评分表单时调用：
   * 1. 检查用户是否已登录
   * 2. 提交评分数据到 API
   * 3. 成功后刷新统计信息和评分列表
   * 4. 清空评论输入框
   * 5. 显示成功消息
   *
   * @param {Event} e - 表单提交事件
   */
  async function handleSubmit(e) {
    e.preventDefault();

    // 检查用户是否已登录
    if (!isAuthenticated) {
      setError("请先登录再评分");
      return;
    }

    // 清空之前的错误和成功消息
    setError(null);
    setSubmitMsg(null);
    setLoading(true);

    try {
      // 提交评分到 API
      await rateTopic(topicId, { score: Number(myScore), comment: myComment });

      // 显示成功消息
      setSubmitMsg("评分提交成功！");

      // 清空评论输入框
      setMyComment("");

      // 刷新统计信息和评分列表
      loadStats();
      loadRatings();
    } catch (err) {
      // 显示错误消息
      setError(err.message || "评分失败");
    } finally {
      // 结束加载状态
      setLoading(false);
    }
  }

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        {/* 页面标题 */}
        <h3 className={classes.title}>话题详情 / 评分</h3>

        {/* 统计信息区域 */}
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

        {/* 评分表单区域 */}
        <div className={classes.section}>
          <h4>给这个话题打分</h4>
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className={classes.form}>
              {/* 分数选择 */}
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

              {/* 评论输入 */}
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

              {/* 错误和成功消息 */}
              {error && <div className={classes.error}>{error}</div>}
              {submitMsg && <div className={classes.success}>{submitMsg}</div>}

              {/* 提交按钮 */}
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

        {/* 最近评分区域 */}
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
                    {/* 分数显示 */}
                    <strong>{r.score} 分</strong>
                    {/* 评论显示（如果有） */}
                    {r.comment && <span> - {r.comment}</span>}
                  </div>
                  {/* 评分元信息 */}
                  <div className={classes.meta}>
                    用户 ID：{r.user_id} ·{" "}
                    {new Date(r.created_at).toLocaleString()}
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
