import React, { useEffect, useState } from "react";
import { listTopics, getTopicStats, createTopic, deleteTopic } from "../api";
import { TopicDetail } from "./TopicDetail";
import classes from "./TopicList.module.css";
import { useAuth } from "../AuthContext";

/**
 * TopicList 组件 - 话题列表页面
 *
 * 这个组件负责：
 * 1. 显示所有话题的列表
 * 2. 显示每个话题的统计信息（平均分、评分数量）
 * 3. 提供话题创建功能（仅管理员）
 * 4. 提供话题删除功能（仅管理员）
 * 5. 管理话题选择状态，显示选中的话题详情
 *
 * 组件布局采用两栏设计：
 * - 左侧：话题列表和创建表单
 * - 右侧：选中话题的详情和评分功能
 *
 * @file TopicList.jsx
 * @description 话题列表组件
 * @returns {JSX.Element} 话题列表组件
 */
export function TopicList() {
  // 从身份验证上下文获取认证状态和用户信息
  const { isAdmin } = useAuth();

  // 话题列表状态
  const [topics, setTopics] = useState([]);

  // 话题统计信息映射表，key 为 topic_id，value 为统计信息
  const [statsMap, setStatsMap] = useState({});

  // 加载状态，用于显示加载提示
  const [loading, setLoading] = useState(false);

  // 当前选中的话题 ID，null 表示没有选中任何话题
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // 创建话题表单数据
  const [form, setForm] = useState({ name: "", description: "" });

  // 错误信息状态
  const [error, setError] = useState(null);

  /**
   * 组件挂载时加载话题列表
   *
   * 这个 effect 在组件首次渲染时执行，用于：
   * 1. 加载所有话题
   * 2. 为每个话题异步加载统计信息
   * 3. 处理加载错误
   */
  useEffect(() => {
    // 异步加载话题数据
    const loadData = async () => {
      try {
        const data = await listTopics();
        // 设置话题列表
        setTopics(data.items || []);

        // 为每个话题异步加载统计信息
        data.items.forEach((t) => {
          getTopicStats(t.topic_id).then((s) =>
            setStatsMap((m) => ({ ...m, [t.topic_id]: s })),
          );
        });
      } catch (err) {
        setError(err.message || "加载话题失败");
      }
    };

    // 使用 requestAnimationFrame 避免在 effect 中直接调用 setState
    requestAnimationFrame(() => {
      setLoading(true);
      loadData().finally(() => {
        requestAnimationFrame(() => setLoading(false));
      });
    });
  }, []);

  /**
   * 创建新话题
   *
   * 只有管理员可以调用这个函数
   * 创建成功后：
   * 1. 将新话题添加到列表
   * 2. 加载新话题的统计信息
   * 3. 清空表单
   *
   * @param {Event} e - 表单提交事件
   */
  const handleCreateTopic = (e) => {
    e.preventDefault();
    setLoading(true);
    createTopic(form)
      .then((data) => {
        // 添加新话题到列表
        setTopics([...topics, data]);

        // 加载新话题的统计信息
        setStatsMap((m) => ({ ...m, [data.topic_id]: data }));

        // 清空表单
        setForm({ name: "", description: "" });

        // 清空错误信息
        setError(null);
      })
      .catch((err) => setError(err.message || "创建话题失败"))
      .finally(() => setLoading(false));
  };

  /**
   * 删除话题
   *
   * 只有管理员可以调用这个函数
   * 删除成功后：
   * 1. 从话题列表中移除
   * 2. 如果删除的是当前选中的话题，清空选中状态
   * 3. 从统计信息映射表中移除
   *
   * @param {Event} e - 点击事件
   * @param {number} topicId - 要删除的话题 ID
   */
  const handleDeleteTopic = (e, topicId) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡，避免触发话题选择

    setSelectedTopicId(null);
    setLoading(true);
    deleteTopic(topicId)
      .then(() => {
        // 从话题列表中过滤掉被删除的话题
        setTopics(topics.filter((t) => t.topic_id !== topicId));

        // 如果当前选中的话题被删除，清空选中状态
        if (selectedTopicId === topicId) {
          setSelectedTopicId(null);
        }

        // 从统计信息映射表中移除被删除的话题
        setStatsMap((m) => {
          const newMap = { ...m };
          delete newMap[topicId];
          return newMap;
        });

        setError(null);
      })
      .catch((err) => setError(err.message || "删除话题失败"))
      .finally(() => setLoading(false));
  };

  // 显示加载状态
  if (loading) return <p>话题加载中...</p>;

  // 显示错误信息
  if (error) return <p className={classes.error}>{error}</p>;

  return (
    <div className={classes.layoutTwoColumns}>
      {/* 左侧：话题列表和创建表单 */}
      <div>
        <h2>话题列表</h2>

        {/* 空状态提示 */}
        {topics.length === 0 && <p>暂无话题。</p>}

        {/* 话题列表 */}
        <ul className={classes.topicList}>
          {topics.map((t) => {
            const stats = statsMap[t.topic_id];
            return (
              <li
                key={t.topic_id}
                className={
                  classes.topicItem +
                  (selectedTopicId === t.topic_id
                    ? " " + classes.topicItemActive
                    : "")
                }
                onClick={() => setSelectedTopicId(t.topic_id)}
              >
                <div className={classes.topicItemContent}>
                  {/* 话题标题和删除按钮（仅管理员可见） */}
                  <div className={classes.topicTitle}>
                    {t.name}
                    {isAdmin && (
                      <div
                        className={classes.deleteBtn}
                        onClick={(e) => handleDeleteTopic(e, t.topic_id)}
                      >
                        {" "}
                        | 删除
                      </div>
                    )}
                  </div>
                  <div className={classes.topicDesc}>{t.description}</div>
                </div>

                {/* 话题统计信息 */}
                <div className={classes.topicMeta}>
                  {stats ? (
                    <>
                      <span className={classes.avgScore}>
                        平均分：{stats.avg_score ?? "—"}
                      </span>
                      <span className={classes.ratingCount}>
                        评分数：{stats.rating_count}
                      </span>
                    </>
                  ) : (
                    <span>统计加载中...</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* 创建话题表单（仅管理员可见） */}
        {isAdmin && (
          <div className={classes.card} style={{ marginTop: "1rem" }}>
            <h3>发表新话题（仅管理员可见）</h3>
            <form onSubmit={handleCreateTopic}>
              <label>
                标题
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
              <label>
                内容
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </label>
              <button type="submit">发布</button>
            </form>
          </div>
        )}
      </div>

      {/* 右侧：话题详情区域 */}
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
