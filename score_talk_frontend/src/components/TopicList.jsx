import React, { useEffect, useState } from "react";
import { listTopics, getTopicStats } from "../api";
import { TopicDetail } from "./TopicDetail";

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
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="layout-two-columns">
      <div>
        <h2>话题列表</h2>
        {topics.length === 0 && <p>暂无话题。</p>}
        <ul className="topic-list">
          {topics.map((t) => {
            const stats = statsMap[t.topic_id];
            return (
              <li
                key={t.topic_id}
                className={
                  "topic-item" +
                  (selectedTopicId === t.topic_id ? " topic-item--active" : "")
                }
                onClick={() => setSelectedTopicId(t.topic_id)}
              >
                <div className="topic-title">{t.name}</div>
                <div className="topic-desc">{t.description}</div>
                <div className="topic-meta">
                  {stats ? (
                    <>
                      <span>平均分：{stats.avg_score ?? "—"}</span>
                      <span>评分数：{stats.rating_count}</span>
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
