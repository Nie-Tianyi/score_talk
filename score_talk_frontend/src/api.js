const API_BASE = import.meta?.env?.VITE_API_BASE || "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data.detail || JSON.stringify(data);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // ignore
    }
    throw new Error(msg);
  }

  // 有些 204 没 body
  if (res.status === 204) return null;
  return res.json();
}

// ===== Auth =====

export async function registerUser({ username, nickname, password, role = "user" }) {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: { username, nickname, password, role },
  });
}

export async function loginUser({ username, password }) {
  // 注意：后端用的是 OAuth2 password flow，body 要 form-urlencoded
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

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data.detail || JSON.stringify(data);
        // eslint-disable-next-line no-unused-vars
    } catch (e) {
        // ignore
    }
    throw new Error(msg);
  }

  return res.json(); // { access_token, token_type }
}

export async function getMe() {
  return request("/api/v1/users/me", { auth: true });
}

// ===== Topics & Ratings =====

export async function listTopics({ page = 1, perPage = 20 } = {}) {
    return await request(`/api/v1/topics/?page=${page}&per_page=${perPage}`); // { items, total, ... }
}

export async function getTopicStats(topicId) {
  return request(`/api/v1/topics/${topicId}/stats`);
}

export async function listRatings(topicId, { page = 1, perPage = 10 } = {}) {
    return await request(
      `/api/v1/topics/${topicId}/ratings?page=${page}&per_page=${perPage}`
  );
}

export async function rateTopic(topicId, { score, comment }) {
  return request(`/api/v1/topics/${topicId}/ratings`, {
    method: "POST",
    auth: true,
    body: { topic_id: topicId, score, comment },
  });
}

// ===== Posts & Comments =====

export async function listPosts({ page = 1, perPage = 20 } = {}) {
    return await request(`/api/v1/posts/?page=${page}&per_page=${perPage}`);
}

export async function createPost({ title, content }) {
  return request("/api/v1/posts/", {
    method: "POST",
    auth: true,
    body: { title, content },
  });
}

export async function getPost(postId) {
  return request(`/api/v1/posts/${postId}`);
}

export async function deletePost(postId) {
  return request(`/api/v1/posts/${postId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function listComments(postId, { page = 1, perPage = 20 } = {}) {
    return await request(
      `/api/v1/posts/${postId}/comments?page=${page}&per_page=${perPage}`
  );
}

export async function createComment(postId, { content }) {
  return request(`/api/v1/posts/${postId}/comments`, {
    method: "POST",
    auth: true,
    body: { post_id: postId, content },
  });
}
