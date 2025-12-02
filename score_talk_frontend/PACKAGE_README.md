# ScoreTalk 前端项目 - package.json 配置文件说明

## 文件概述

`package.json` 是 ScoreTalk 前端项目的配置文件，它定义了项目的元数据、依赖关系和脚本命令。这个文件使用 JSON 格式，是 Node.js 和 npm/yarn 包管理器的基础配置文件。

## 项目基本信息

### `name`
- **值**: `"score_talk_frontend"`
- **说明**: 项目名称，遵循 kebab-case 命名约定
- **用途**: 在 npm 注册表中标识项目（本项目为私有项目，不发布到 npm）

### `private`
- **值**: `true`
- **说明**: 标记项目为私有项目
- **用途**: 
  - 防止意外发布到 npm 注册表
  - 确保项目不会被公开分享
  - 适用于企业内部或私有代码库

### `version`
- **值**: `"0.0.0"`
- **说明**: 项目版本号
- **用途**: 
  - 遵循语义化版本控制（SemVer）
  - 当前为初始开发版本
  - 格式：主版本号.次版本号.修订号

### `type`
- **值**: `"module"`
- **说明**: 指定项目使用 ES 模块系统
- **用途**: 
  - 允许使用 `import/export` 语法
  - 支持现代 JavaScript 模块特性
  - 替代传统的 CommonJS (`require/module.exports`)

## 脚本命令 (scripts)

### `dev`
- **命令**: `vite`
- **说明**: 启动 Vite 开发服务器
- **用途**: 
  - 本地开发环境
  - 支持热模块替换（HMR）
  - 快速开发服务器启动
  - 访问地址：http://localhost:3000

### `build`
- **命令**: `vite build`
- **说明**: 构建生产版本
- **用途**: 
  - 打包项目为静态文件
  - 优化代码（压缩、代码分割等）
  - 输出到 `dist` 目录
  - 准备部署到生产环境

### `lint`
- **命令**: `eslint .`
- **说明**: 运行代码检查
- **用途**: 
  - 检查代码质量和规范
  - 确保代码风格一致性
  - 检测潜在错误和问题
  - 使用 ESLint 配置规则

### `preview`
- **命令**: `vite preview`
- **说明**: 预览生产构建
- **用途**: 
  - 本地预览构建结果
  - 测试生产环境行为
  - 验证构建输出

## 生产环境依赖 (dependencies)

### `react`
- **版本**: `^19.2.0`
- **说明**: React 核心库
- **用途**: 
  - 构建用户界面的 JavaScript 库
  - 提供组件化开发模式
  - 支持虚拟 DOM 和高效更新
  - 版本 19 包含最新特性和优化

### `react-dom`
- **版本**: `^19.2.0`
- **说明**: React 的 DOM 渲染器
- **用途**: 
  - 将 React 组件渲染到 DOM
  - 提供 Web 应用支持
  - 包含 React 生命周期和事件处理
  - 与 React 核心库版本匹配

## 开发环境依赖 (devDependencies)

### `@eslint/js`
- **版本**: `^9.39.1`
- **说明**: ESLint 推荐的 JavaScript 规则
- **用途**: 
  - 提供标准的 JavaScript 代码检查规则
  - 基于 ESLint 推荐配置
  - 确保代码质量和最佳实践

### `@types/react`
- **版本**: `^19.2.5`
- **说明**: React 类型定义
- **用途**: 
  - 为 TypeScript 提供 React 类型支持
  - 即使项目使用 JavaScript，也能提供更好的 IDE 支持
  - 包含 React API 的类型定义

### `@types/react-dom`
- **版本**: `^19.2.3`
- **说明**: React DOM 类型定义
- **用途**: 
  - 为 TypeScript 提供 React DOM 类型支持
  - 包含 React DOM API 的类型定义
  - 与 React 类型定义配套使用

### `@vitejs/plugin-react-swc`
- **版本**: `^4.2.2`
- **说明**: Vite 的 React 插件（使用 SWC 编译器）
- **用途**: 
  - 提供 React 快速刷新（Fast Refresh）
  - 使用 SWC 编译器，比 Babel 更快
  - 支持 JSX 和 React 特性
  - 优化开发体验

### `eslint`
- **版本**: `^9.39.1`
- **说明**: ESLint 主包
- **用途**: 
  - JavaScript/TypeScript 代码检查工具
  - 可插拔的代码检查框架
  - 支持自定义规则和配置

### `eslint-plugin-react-hooks`
- **版本**: `^7.0.1`
- **说明**: React Hooks ESLint 插件
- **用途**: 
  - 检查 React Hooks 的使用规则
  - 确保 Hooks 的正确使用
  - 防止常见的 Hooks 错误

### `eslint-plugin-react-refresh`
- **版本**: `^0.4.24`
- **说明**: React 快速刷新 ESLint 插件
- **用途**: 
  - 支持 React 快速刷新的 ESLint 规则
  - 确保代码兼容快速刷新功能
  - 优化开发体验

### `globals`
- **版本**: `^16.5.0`
- **说明**: ESLint 全局变量定义
- **用途**: 
  - 定义不同环境的全局变量
  - 包含浏览器、Node.js 等环境的全局变量
  - 防止未定义变量错误

### `vite`
- **版本**: `npm:rolldown-vite@7.2.5`
- **说明**: Vite 构建工具（Rolldown 版本）
- **用途**: 
  - 现代化的前端构建工具
  - 提供快速的开发服务器启动
  - 优化的生产构建
  - 使用 Rolldown 作为打包器，性能更好

## 依赖覆盖配置 (overrides)

### `vite`
- **覆盖版本**: `npm:rolldown-vite@7.2.5`
- **说明**: 强制使用 Rolldown 版本的 Vite
- **用途**: 
  - 确保使用 Rolldown 作为打包器
  - 提供更快的构建速度
  - 更好的 tree-shaking 和代码分割
  - 替代默认的 Rollup 打包器

## 版本控制说明

### 版本前缀说明
- `^`（脱字符）：允许更新到不改变最左边非零数字的版本
  - 例如：`^19.2.0` 允许更新到 `19.x.x`，但不允许 `20.0.0`
- `~`（波浪符）：允许更新到修订版本
  - 例如：`~19.2.0` 允许更新到 `19.2.x`，但不允许 `19.3.0`

### 版本选择策略
1. **生产依赖**：使用宽松的版本范围，确保兼容性
2. **开发依赖**：使用较新的版本，获取最新特性和修复
3. **工具依赖**：选择稳定版本，避免破坏性变更

## 项目结构说明

### 模块系统
- 使用 ES 模块（`import/export`）
- 支持现代 JavaScript 特性
- 兼容浏览器和 Node.js 环境

### 构建工具链
1. **开发阶段**：Vite 开发服务器 + SWC 编译器
2. **构建阶段**：Vite + Rolldown 打包器
3. **代码检查**：ESLint + React 相关插件

### 开发工作流
1. 安装依赖：`npm install` 或 `yarn install`
2. 启动开发：`npm run dev` 或 `yarn dev`
3. 代码检查：`npm run lint` 或 `yarn lint`
4. 构建生产：`npm run build` 或 `yarn build`
5. 预览构建：`npm run preview` 或 `yarn preview`

## 注意事项

### 1. 包管理器选择
- 可以使用 npm 或 yarn
- 建议使用 npm（与 package-lock.json 配合）
- 如果使用 yarn，需要删除 package-lock.json

### 2. 版本锁定
- `package-lock.json` 或 `yarn.lock` 用于锁定依赖版本
- 确保团队使用相同的依赖版本
- 提交到版本控制系统

### 3. 依赖更新
- 定期更新依赖以获取安全修复
- 使用 `npm outdated` 检查过时依赖
- 使用 `npm update` 更新依赖
- 重大更新前进行充分测试

### 4. 私有项目
- 本项目标记为私有，不会发布到 npm
- 适合企业内部或教育项目使用
- 如果需要发布，需要移除 `private: true`

## 扩展建议

### 未来可能添加的依赖
1. **状态管理**：Redux、Zustand、Jotai
2. **路由管理**：React Router
3. **HTTP 客户端**：Axios、SWR、React Query
4. **UI 组件库**：Material-UI、Ant Design、Chakra UI
5. **测试框架**：Jest、React Testing Library、Cypress
6. **类型系统**：TypeScript（迁移现有代码）

### 性能优化
1. **代码分割**：利用 Vite 的自动代码分割
2. **懒加载**：React.lazy() 和 Suspense
3. **图片优化**：使用 Vite 的图片处理插件
4. **缓存策略**：配置适当的 HTTP 缓存头

### 开发体验
1. **提交钩子**：Husky + lint-staged
2. **提交规范**：Commitizen + commitlint
3. **代码格式化**：Prettier
4. **编辑器配置**：.editorconfig

---

*最后更新：2025年12月*
*文档维护：ScoreTalk 开发团队*