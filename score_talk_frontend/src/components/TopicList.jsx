import React, { useEffect, useState } from "react";
import { listTopics, getTopicStats } from "../api";
import { TopicDetail } from "./TopicDetail";
import classes from "./TopicList.module.css";

export function TopicList() {
  const [topics, setTopics] = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    listTopics()
      .then((data) => {
        setTopics(data.items || []);
        // 顺便异步拉每个话题的统计
        data.items.forEach((t) => {
          getTopicStats(t.topic_id).then((s) =>
            setStatsMap((m) => ({ ...m, [t.topic_id]: s }))
          );
        });
      })
      .catch((err) => setError(err.message || "加载话题失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>话题加载中...</p>;
  if (error) return <p className={classes.error}>{error}</p>;

  return (
    <div className={classes.layoutTwoColumns}>
      <div>
        <h2>话题列表</h2>
        {topics.length === 0 && <p>暂无话题。</p>}
        <ul className={classes.topicList}>
          {topics.map((t) => {
            const stats = statsMap[t.topic_id];
            return (
              <li
                key={t.topic_id}
                className={
                  classes.topicItem +
                  (selectedTopicId === t.topic_id ? " " + classes.topicItemActive : "")
                }
                onClick={() => setSelectedTopicId(t.topic_id)}
              >
                <div className={classes.topicItemContent}>
                  <div className={classes.topicTitle}>{t.name}</div>
                  <div className={classes.topicDesc}>{t.description}</div>
                </div>
                <div className={classes.topicMeta}>
                  {stats ? (
                    <>
                      <span className={classes.avgScore}>平均分：{stats.avg_score ?? "—"}</span>
                      <span className={classes.ratingCount}>评分数：{stats.rating_count}</span>
                    </>
                  ) : (
                    <span>统计加载中...</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        {selectedTopicId ? (
          <TopicDetail topicId={selectedTopicId} />
        ) : (
          <p>点击左侧话题查看详情和打分。</p>
        )}
      </div>
    </div>
  );
}
