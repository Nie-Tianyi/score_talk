/**
 * ScoreTalk 前端项目 Vite 配置文件
 *
 * 这个文件配置了 Vite 构建工具的各种选项，包括：
 * 1. 开发服务器配置（端口、代理等）
 * 2. 构建插件配置（React 支持等）
 * 3. 生产环境构建优化
 *
 * Vite 是一个现代化的前端构建工具，提供：
 * - 极速的开发服务器启动
 * - 快速的模块热更新（HMR）
 * - 优化的生产构建
 * - 丰富的插件生态系统
 *
 * @file vite.config.js
 * @description Vite 配置文件
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

/**
 * Vite 配置定义
 *
 * 使用 defineConfig 函数创建配置对象，提供类型提示和自动补全
 * 配置分为以下几个部分：
 * 1. 插件配置：配置构建过程中使用的插件
 * 2. 服务器配置：配置开发服务器的行为
 * 3. 构建配置：配置生产构建的选项
 * 4. 其他配置：如环境变量、别名等
 */
export default defineConfig({
  /**
   * 插件配置
   *
   * 插件用于扩展 Vite 的功能，这里使用了：
   * - @vitejs/plugin-react-swc: React 插件，使用 SWC 编译器
   *   SWC 比 Babel 更快，支持 React 快速刷新（Fast Refresh）
   */
  plugins: [react()],

  /**
   * 开发服务器配置
   *
   * 配置本地开发服务器的行为，包括：
   * - 端口设置
   * - 代理配置（解决跨域问题）
   * - HTTPS 配置
   * - 主机绑定等
   */
  server: {
    /**
     * 开发服务器端口
     *
     * 默认情况下，Vite 会使用 5173 端口
     * 这里显式指定为 3000 端口，避免与其他服务冲突
     */
    port: 3000,

    /**
     * 代理配置
     *
     * 用于解决开发时的跨域问题，将特定请求转发到后端服务器
     * 配置格式：{ [path]: { target, changeOrigin, rewrite } }
     */
    proxy: {
      /**
       * API 请求代理配置
       *
       * 将所有以 /api 开头的请求转发到后端服务器
       * 例如：http://localhost:3000/api/v1/auth/login
       *       → http://localhost:8000/api/v1/auth/login
       */
      '/api': {
        /**
         * 目标服务器地址
         *
         * 后端 API 服务器的地址，这里假设后端运行在 8000 端口
         * 可以根据实际的后端地址进行调整
         */
        target: 'http://localhost:8000',

        /**
         * 是否改变请求源
         *
         * 设置为 true 时，代理会将请求头中的 Origin 改为目标地址
         * 这对于某些需要验证 Origin 的后端服务是必要的
         */
        changeOrigin: true,

        /**
         * URL 重写函数
         *
         * 用于修改请求路径，这里移除了 /api 前缀
         * 因为后端 API 可能不需要这个前缀，或者前缀不同
         *
         * @param {string} path - 原始请求路径
         * @returns {string} 重写后的路径
         *
         * 示例：
         * - 输入：'/api/v1/auth/login'
         * - 输出：'/v1/auth/login'
         * - 实际请求：http://localhost:8000/v1/auth/login
         */
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  /**
   * 构建配置（可选）
   *
   * 如果需要自定义生产构建行为，可以在这里添加配置
   * 例如：
   * build: {
   *   outDir: 'dist',           // 输出目录
   *   sourcemap: true,          // 是否生成 sourcemap
   *   rollupOptions: {          // Rollup 配置
   *     external: [],           // 外部依赖
   *     output: {               // 输出配置
   *       manualChunks: {},     // 手动代码分割
   *     },
   *   },
   * },
   */

  /**
   * 环境变量配置（可选）
   *
   * 如果需要定义环境变量，可以在这里配置
   * 例如：
   * define: {
   *   __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
   * },
   */

  /**
   * 路径别名配置（可选）
   *
   * 如果需要配置路径别名，可以在这里添加
   * 例如：
   * resolve: {
   *   alias: {
   *     '@': path.resolve(__dirname, './src'),
   *     '@components': path.resolve(__dirname, './src/components'),
   *   },
   * },
   */
});
