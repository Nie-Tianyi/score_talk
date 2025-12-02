# ScoreTalk 前端应用

ScoreTalk 是一个现代化的评分和讨论平台，允许用户对话题进行评分和评论，同时提供帖子讨论功能。

## 项目概述

ScoreTalk 前端是一个基于 React 的单页应用（SPA），使用 Vite 作为构建工具，提供了以下核心功能：

### 主要功能
1. **用户认证系统**
   - 用户注册和登录
   - JWT 令牌认证
   - 用户角色管理（普通用户、VIP、管理员）

2. **话题评分系统**
   - 浏览话题列表
   - 查看话题统计信息（平均分、评分数量）
   - 对话题进行评分（1-5分）
   - 添加评分评论
   - 查看其他用户的评分记录

3. **帖子讨论系统**
   - 浏览帖子列表
   - 创建新帖子
   - 查看帖子详情
   - 发表评论
   - 管理帖子和评论（作者本人或管理员）

4. **权限管理**
   - 普通用户：浏览、评分、评论
   - VIP用户：额外权限（预留）
   - 管理员：创建/删除话题、删除任何帖子/评论

## 技术栈

### 核心框架
- **React 19** - 用户界面库
- **Vite** - 构建工具和开发服务器
- **ESLint** - 代码质量检查

### 项目结构
```
score_talk_frontend/
├── src/
│   ├── components/          # React 组件
│   │   ├── AuthForms.jsx    # 登录/注册表单
│   │   ├── TopicList.jsx    # 话题列表
│   │   ├── TopicDetail.jsx  # 话题详情
│   │   ├── PostList.jsx     # 帖子列表
│   │   └── PostDetail.jsx   # 帖子详情
│   ├── api.js              # API 接口封装
│   ├── AuthContext.jsx     # 身份验证上下文
│   ├── App.jsx             # 主应用组件
│   ├── main.jsx            # 应用入口
│   └── styles.css          # 全局样式
├── public/                 # 静态资源
└── package.json           # 项目配置
```

## 快速开始

### 环境要求
- Node.js 18+ 或更高版本
- npm 或 yarn 包管理器

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发环境
```bash
npm run dev
# 或
yarn dev
```
应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
# 或
yarn build
```
构建结果将输出到 `dist` 目录

### 代码检查
```bash
npm run lint
# 或
yarn lint
```

## 配置说明

### 环境变量
项目支持以下环境变量：
- `VITE_API_BASE` - API 基础 URL（默认：`/api`）

### 开发服务器代理
开发时，所有 `/api` 开头的请求会被代理到后端服务器（默认：`http://localhost:8000`）。配置见 `vite.config.js`。

## API 接口

前端通过 `src/api.js` 文件与后端 API 交互，主要接口包括：

### 身份验证
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/token` - 用户登录（OAuth2 password flow）
- `GET /api/v1/users/me` - 获取当前用户信息

### 话题管理
- `GET /api/v1/topics/` - 获取话题列表
- `POST /api/v1/topics/` - 创建话题（管理员）
- `GET /api/v1/topics/{topic_id}/stats` - 获取话题统计
- `GET /api/v1/topics/{topic_id}/ratings` - 获取话题评分
- `POST /api/v1/topics/{topic_id}/ratings` - 给话题评分
- `DELETE /api/v1/topics/{topic_id}` - 删除话题（管理员）

### 帖子管理
- `GET /api/v1/posts/` - 获取帖子列表
- `POST /api/v1/posts/` - 创建帖子
- `GET /api/v1/posts/{post_id}` - 获取帖子详情
- `DELETE /api/v1/posts/{post_id}` - 删除帖子（作者或管理员）
- `GET /api/v1/posts/{post_id}/comments` - 获取帖子评论
- `POST /api/v1/posts/{post_id}/comments` - 发表评论
- `DELETE /api/v1/posts/comments/{comment_id}` - 删除评论（作者或管理员）

## 组件说明

### AuthContext（身份验证上下文）
提供全局的身份验证状态管理，包括：
- 用户登录状态
- JWT 令牌管理
- 用户信息获取
- 登录/注册/登出功能

### 主要组件
1. **AuthForms** - 登录和注册表单组件
2. **TopicList** - 话题列表和创建表单（两栏布局）
3. **TopicDetail** - 话题详情、评分表单和评分列表
4. **PostList** - 帖子列表和创建表单（两栏布局）
5. **PostDetail** - 帖子详情、评论列表和评论表单

## 样式系统

项目使用纯 CSS 实现样式，特点包括：
- 响应式设计
- 卡片式布局
- 现代化的颜色主题
- 平滑的过渡动画
- 统一的间距系统

主要样式类：
- `.card` - 卡片容器
- `.nav-btn` - 导航按钮
- `.topic-item` / `.post-item` - 列表项
- `.error` / `.success` - 消息提示

## 开发指南

### 添加新组件
1. 在 `src/components/` 目录创建新组件文件
2. 导入必要的依赖和样式
3. 实现组件逻辑
4. 在需要的地方导入和使用

### 添加新 API 接口
1. 在 `src/api.js` 中添加新的 API 函数
2. 使用 `request()` 函数处理 HTTP 请求
3. 在组件中导入和使用新的 API 函数

### 样式开发
1. 全局样式在 `src/styles.css` 中定义
2. 组件特定样式可以使用 CSS Modules
3. 遵循现有的设计系统和命名约定

## 部署说明

### 构建优化
- 使用 Vite 进行代码分割和压缩
- 自动生成生产环境优化的构建
- 支持现代浏览器特性

### 静态文件部署
构建后的 `dist` 目录可以部署到任何静态文件服务器，如：
- Nginx
- Apache
- Netlify
- Vercel
- GitHub Pages

### 反向代理配置
在生产环境中，需要配置反向代理将 API 请求转发到后端服务器。

## 常见问题

### 跨域问题
开发时使用 Vite 的代理功能解决跨域问题。生产环境需要配置正确的 CORS 策略。

### 认证状态丢失
用户认证状态通过 localStorage 持久化，页面刷新后自动恢复登录状态。

### API 错误处理
所有 API 错误都会在组件中捕获并显示给用户，开发时可以在控制台查看详细错误信息。

## 贡献指南

1. Fork 项目仓库
2. 创建功能分支
3. 提交代码变更
4. 运行代码检查
5. 创建 Pull Request

## 许可证

本项目版权所有 © 2025 ScoreTalk。保留所有权利。

## 联系方式

如有问题或建议，请联系项目维护者。