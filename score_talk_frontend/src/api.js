/**
 * ScoreTalk 前端 API 模块
 *
 * 这个文件包含了所有与后端 API 交互的函数，包括：
 * 1. 身份验证相关 API（登录、注册、获取用户信息）
 * 2. 话题和评分相关 API
 * 3. 帖子和评论相关 API
 * 4. 通用的请求处理函数
 *
 * 所有函数都返回 Promise，可以使用 async/await 或 .then()/.catch() 处理
 *
 * @file api.js
 * @description 前端 API 接口模块
 */

/**
 * API 基础 URL
 *
 * 从环境变量 VITE_API_BASE 获取 API 基础 URL
 * 如果未设置，默认使用相对路径 "/api"
 * 开发时可以在 .env 文件中设置 VITE_API_BASE
 */
const API_BASE = import.meta?.env?.VITE_API_BASE || "/api";

/**
 * 从 localStorage 获取 JWT token
 *
 * @returns {string|null} JWT token，如果不存在则返回 null
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * 通用的 HTTP 请求函数
 *
 * 这个函数封装了 fetch API，提供了统一的错误处理和认证支持
 *
 * @param {string} path - API 路径（不包含基础 URL）
 * @param {Object} options - 请求选项
 * @param {string} [options.method="GET"] - HTTP 方法
 * @param {Object} [options.body] - 请求体（会自动转换为 JSON）
 * @param {boolean} [options.auth=false] - 是否需要认证（自动添加 Authorization 头）
 * @returns {Promise<any>} 解析后的 JSON 响应数据
 * @throws {Error} 如果请求失败，抛出包含错误信息的 Error 对象
 */
async function request(path, { method = "GET", body, auth = false } = {}) {
  // 设置请求头
  const headers = {
    "Content-Type": "application/json",
  };

  // 如果需要认证，添加 Authorization 头
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // 发送请求
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 处理 HTTP 错误状态
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      // 尝试从响应中获取错误信息
      const data = await res.json();
      msg = data.detail || JSON.stringify(data);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // 如果响应不是 JSON，使用默认错误信息
    }
    throw new Error(msg);
  }

  // 204 No Content 响应没有 body
  if (res.status === 204) return null;

  // 返回解析后的 JSON 数据
  return res.json();
}

// ===== 身份验证相关 API =====

/**
 * 用户注册
 *
 * @param {Object} userData - 用户注册数据
 * @param {string} userData.username - 用户名
 * @param {string} userData.nickname - 昵称
 * @param {string} userData.password - 密码
 * @param {string} [userData.role="user"] - 用户角色，默认为 "user"
 * @returns {Promise<Object>} 注册结果
 */
export async function registerUser({
  username,
  nickname,
  password,
  role = "user",
}) {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: { username, nickname, password, role },
  });
}

/**
 * 用户登录
 *
 * 注意：后端使用 OAuth2 password flow，请求体需要是 form-urlencoded 格式
 *
 * @param {Object} credentials - 登录凭据
 * @param {string} credentials.username - 用户名
 * @param {string} credentials.password - 密码
 * @returns {Promise<Object>} 登录响应，包含 access_token 和 token_type
 */
export async function loginUser({ username, password }) {
  // OAuth2 password flow 需要使用 form-urlencoded 格式
  const res = await fetch(`${API_BASE}/api/v1/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username,
      password,
    }),
  });

  // 处理错误
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data.detail || JSON.stringify(data);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // 忽略解析错误
    }
    throw new Error(msg);
  }

  return res.json(); // { access_token, token_type }
}

/**
 * 获取当前登录用户信息
 *
 * @returns {Promise<Object>} 当前用户信息
 */
export async function getMe() {
  return request("/api/v1/users/me", { auth: true });
}

// ===== 话题和评分相关 API =====

/**
 * 获取话题列表
 *
 * @param {Object} [options] - 分页选项
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.perPage=20] - 每页数量
 * @returns {Promise<Object>} 话题列表响应，包含 items 和 total 等分页信息
 */
export async function listTopics({ page = 1, perPage = 20 } = {}) {
  return await request(`/api/v1/topics/?page=${page}&per_page=${perPage}`);
}

/**
 * 获取话题统计信息
 *
 * @param {number} topicId - 话题 ID
 * @returns {Promise<Object>} 话题统计信息，包含平均分、评分数量等
 */
export async function getTopicStats(topicId) {
  return request(`/api/v1/topics/${topicId}/stats`);
}

/**
 * 获取话题的评分列表
 *
 * @param {number} topicId - 话题 ID
 * @param {Object} [options] - 分页选项
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.perPage=10] - 每页数量
 * @returns {Promise<Object>} 评分列表响应
 */
export async function listRatings(topicId, { page = 1, perPage = 10 } = {}) {
  return await request(
    `/api/v1/topics/${topicId}/ratings?page=${page}&per_page=${perPage}`,
  );
}

/**
 * 给话题评分
 *
 * @param {number} topicId - 话题 ID
 * @param {Object} ratingData - 评分数据
 * @param {number} ratingData.score - 分数（1-5）
 * @param {string} ratingData.comment - 评论（可选）
 * @returns {Promise<Object>} 评分结果
 */
export async function rateTopic(topicId, { score, comment }) {
  return request(`/api/v1/topics/${topicId}/ratings`, {
    method: "POST",
    auth: true,
    body: { topic_id: topicId, score, comment },
  });
}

/**
 * 删除评分
 *
 * 只有评分作者本人或管理员可以调用
 *
 * @param {number} ratingId - 评分 ID
 * @returns {Promise<null>} 删除成功返回 null
 */
export async function deleteRating(ratingId) {
  return request(`/api/v1/ratings/${ratingId}/ratings`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * 创建新话题
 *
 * 只有管理员可以调用
 *
 * @param {Object} topicData - 话题数据
 * @param {string} topicData.name - 话题标题
 * @param {string} topicData.description - 话题描述
 * @returns {Promise<Object>} 创建的话题信息
 */
export async function createTopic({ name, description }) {
  return request("/api/v1/topics/", {
    method: "POST",
    auth: true,
    body: { name, description },
  });
}

/**
 * 删除话题
 *
 * 只有管理员可以调用
 *
 * @param {number} topicId - 话题 ID
 * @returns {Promise<null>} 删除成功返回 null
 */
export async function deleteTopic(topicId) {
  return request(`/api/v1/topics/${topicId}`, {
    method: "DELETE",
    auth: true,
  });
}

// ===== 帖子和评论相关 API =====

/**
 * 获取帖子列表
 *
 * @param {Object} [options] - 分页选项
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.perPage=20] - 每页数量
 * @returns {Promise<Object>} 帖子列表响应
 */
export async function listPosts({ page = 1, perPage = 20 } = {}) {
  return await request(`/api/v1/posts/?page=${page}&per_page=${perPage}`);
}

/**
 * 创建新帖子
 *
 * @param {Object} postData - 帖子数据
 * @param {string} postData.title - 帖子标题
 * @param {string} postData.content - 帖子内容
 * @returns {Promise<Object>} 创建的帖子信息
 */
export async function createPost({ title, content }) {
  return request("/api/v1/posts/", {
    method: "POST",
    auth: true,
    body: { title, content },
  });
}

/**
 * 获取单个帖子详情
 *
 * @param {number} postId - 帖子 ID
 * @returns {Promise<Object>} 帖子详情
 */
export async function getPost(postId) {
  return request(`/api/v1/posts/${postId}`);
}

/**
 * 删除帖子
 *
 * 只有帖子作者本人或管理员可以调用
 *
 * @param {number} postId - 帖子 ID
 * @returns {Promise<null>} 删除成功返回 null
 */
export async function deletePost(postId) {
  return request(`/api/v1/posts/${postId}`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * 获取帖子的评论列表
 *
 * @param {number} postId - 帖子 ID
 * @param {Object} [options] - 分页选项
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.perPage=20] - 每页数量
 * @returns {Promise<Object>} 评论列表响应
 */
export async function listComments(postId, { page = 1, perPage = 20 } = {}) {
  return await request(
    `/api/v1/posts/${postId}/comments?page=${page}&per_page=${perPage}`,
  );
}

/**
 * 创建评论
 *
 * @param {number} postId - 帖子 ID
 * @param {Object} commentData - 评论数据
 * @param {string} commentData.content - 评论内容
 * @returns {Promise<Object>} 创建的评论信息
 */
export async function createComment(postId, { content }) {
  return request(`/api/v1/posts/${postId}/comments`, {
    method: "POST",
    auth: true,
    body: { post_id: postId, content },
  });
}

/**
 * 删除评论
 *
 * 只有评论作者本人或管理员可以调用
 *
 * @param {number} commentId - 评论 ID
 * @returns {Promise<null>} 删除成功返回 null
 */
export async function deleteComment(commentId) {
  return request(`/api/v1/posts/comments/${commentId}`, {
    method: "DELETE",
    auth: true,
  });
}
