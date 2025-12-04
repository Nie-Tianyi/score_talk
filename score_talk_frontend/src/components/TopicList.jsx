import React, {useEffect, useState} from "react";
import {listTopics, getTopicStats, createTopic, deleteTopic} from "../api";
import {TopicDetail} from "./TopicDetail";
import classes from "./TopicList.module.css";
import {useAuth} from "../AuthContext";

export function TopicList({ searchQuery = "" }) {
  const {token, isAdmin} = useAuth();
  const [topics, setTopics] = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [form, setForm] = useState({title: "", content: ""});
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    listTopics()
      .then((data) => {
        setTopics(data.items || []);
        // 顺便异步拉每个话题的统计
        data.items.forEach((t) => {
          getTopicStats(t.topic_id).then((s) =>
            setStatsMap((m) => ({...m, [t.topic_id]: s}))
          );
        });
      })
      .catch((err) => setError(err.message || "加载话题失败"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateTopic = (e) => {
    e.preventDefault();
    // 添加加载状态
    setLoading(true);
    createTopic(form)
      .then((data) => {
        setStatsMap((m) => ({...m, [data.topic_id]: data}))
        setTopics([...topics, data]);
        setForm({name: "", description: ""});
        setError(null); // 清空错误信息
      })
      .catch((err) => setError(err.message || "创建话题失败"))
      .finally(() => setLoading(false)); // 无论成功失败都结束加
  }

  const handleDeleteTopic = (e, topicId) => {
    e.preventDefault();
    setSelectedTopicId(null);
    setLoading(true);
    deleteTopic(topicId)
      .then(() => {
        // 直接从 topics 中过滤掉被删除的话题
        setTopics(topics.filter((t) => t.topic_id !== topicId));
        // 如果当前选中的话题被删除，清空选中状态
        if (selectedTopicId === topicId) {
          setSelectedTopicId(null);
        }
        // 从 statsMap 中移除被删除的话题统计
        setStatsMap((m) => {
          const newMap = {...m};
          delete newMap[topicId];
          return newMap;
        });
        setError(null);
      })
      .catch((err) => setError(err.message || "删除话题失败"))
      .finally(() => setLoading(false)); // 无论成功失败都结束加载
  }

  if (loading) return <p>话题加载中...</p>;
  if (error) return <p className={classes.error}>{error}</p>;

  // 根据搜索关键词过滤话题
  const filteredTopics = topics.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className={classes.layoutTwoColumns}>
      <div>
        <h2>话题列表</h2>
        {searchQuery && (
          <p className={classes.searchHint}>
            搜索 "{searchQuery}" 找到 {filteredTopics.length} 个话题
          </p>
        )}
        {topics.length === 0 && <p>暂无话题。</p>}
        {topics.length > 0 && filteredTopics.length === 0 && (
          <p>未找到匹配的话题。</p>
        )}
        <ul className={classes.topicList}>
          {filteredTopics.map((t) => {
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
                  <div className={classes.topicTitle}>{t.name} {isAdmin &&
                    <div className={classes.deleteBtn} onClick={(e) => handleDeleteTopic(e, t.topic_id)}> |
                      删除</div>}</div>
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

        {isAdmin && (
          <div className={classes.card} style={{marginTop: "1rem"}}>
            <h3>发表新话题（仅管理员可见）</h3>
            <form onSubmit={handleCreateTopic}>
              <label>
                标题
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({...form, name: e.target.value})
                  }
                  required
                />
              </label>
              <label>
                内容
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({...form, description: e.target.value})
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
        {selectedTopicId ? (
          <TopicDetail topicId={selectedTopicId}/>
        ) : (
          <p>点击左侧话题查看详情和打分。</p>
        )}
      </div>
    </div>
  );
}