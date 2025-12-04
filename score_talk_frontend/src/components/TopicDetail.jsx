import React, { useEffect, useState } from "react";
import { listRatings, rateTopic } from "../api";
import { useAuth } from "../AuthContext";
import { StarRating } from "./StarRating";
import classes from "./TopicDetail.module.css";

export function TopicDetail({ topicId, onRatingUpdate }) {
  const { isAuthenticated, user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [error, setError] = useState(null);
  const [submitMsg, setSubmitMsg] = useState(null);

  function loadRatings() {
    setLoadingRatings(true);
    listRatings(topicId, { page: 1, perPage: 100 })
      .then((data) => {
        const allRatings = data.items || [];
        setRatings(allRatings);
        // 查找当前用户的评分
        if (user && isAuthenticated) {
          const myRating = allRatings.find((r) => r.user_id === user.user_id);
          if (myRating) {
            setMyScore(myRating.score);
            setMyComment(myRating.comment || "");
          } else {
            setMyScore(0);
            setMyComment("");
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingRatings(false));
  }

  useEffect(() => {
    setError(null);
    setSubmitMsg(null);
    setMyScore(0);
    setMyComment("");
    loadRatings();
  }, [topicId, user, isAuthenticated]);

  async function handleStarClick(score) {
    if (!isAuthenticated) {
      setError("请先登录再评分");
      return;
    }
    setError(null);
    setSubmitMsg(null);
    setLoading(true);
    try {
      await rateTopic(topicId, { score, comment: myComment });
      setMyScore(score);
      setSubmitMsg("评分提交成功！");
      // 重新加载评分列表以更新显示
      loadRatings();
      // 通知父组件更新话题统计信息（平均分）
      if (onRatingUpdate) {
        onRatingUpdate(topicId);
      }
    } catch (err) {
      setError(err.message || "评分失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleCommentUpdate() {
    // 如果已经有评分，更新评论
    if (myScore > 0 && isAuthenticated) {
      setError(null);
      setSubmitMsg(null);
      setLoading(true);
      try {
        await rateTopic(topicId, { score: myScore, comment: myComment });
        setSubmitMsg("评论更新成功！");
        loadRatings();
        // 评论更新不影响平均分，但为了保持数据一致性，也可以更新统计
        // 实际上评论更新不会改变平均分，所以这里可以不更新
      } catch (err) {
        setError(err.message || "更新失败");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <h3 className={classes.title}>话题详情 / 评分</h3>
        
        {/* 评分区域 */}
        <div className={classes.section}>
          <div className={classes.ratingSection}>
            <StarRating
              value={myScore}
              onRate={handleStarClick}
              interactive={isAuthenticated && !loading}
              size="large"
            />
            {error && <div className={classes.error}>{error}</div>}
            {submitMsg && <div className={classes.success}>{submitMsg}</div>}
            {!isAuthenticated && (
              <div className={classes.hint}>登录后可以给话题打分。</div>
            )}
          </div>
          
          {isAuthenticated && myScore > 0 && (
            <div className={classes.commentSection}>
              <label>
                简短评论（可选）：
                <input
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  onBlur={handleCommentUpdate}
                  placeholder="例如：天皇陛下 desu！"
                  className={classes.input}
                  disabled={loading}
                />
              </label>
            </div>
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