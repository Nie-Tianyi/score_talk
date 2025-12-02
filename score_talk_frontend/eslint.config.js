/**
 * ScoreTalk 前端项目 ESLint 配置文件
 *
 * 这个文件配置了 ESLint 代码检查工具，用于：
 * 1. 检查代码质量和规范
 * 2. 确保代码风格一致性
 * 3. 检测潜在的错误和问题
 * 4. 提供 React Hooks 和快速刷新的规则检查
 *
 * ESLint 是一个可插拔的 JavaScript/JSX 代码检查工具
 * 通过配置不同的规则集和插件，可以定制代码检查策略
 *
 * 注意：AuthContext.jsx 文件有意导出非组件内容（身份验证上下文），
 * 因此需要禁用快速刷新规则检查。
 *
 * @file eslint.config.js
 * @description ESLint 配置文件
 */

// 导入 ESLint 核心配置和插件
import js from "@eslint/js"; // ESLint 推荐的 JavaScript 规则
import globals from "globals"; // 全局变量定义
import reactHooks from "eslint-plugin-react-hooks"; // React Hooks 规则插件
import reactRefresh from "eslint-plugin-react-refresh"; // React 快速刷新规则插件
import { defineConfig, globalIgnores } from "eslint/config"; // ESLint 配置工具

/**
 * 导出 ESLint 配置
 *
 * 使用 defineConfig 函数定义配置，支持多个配置对象
 * 配置数组中的每个对象对应一个特定的文件集或规则集
 */
export default defineConfig([
  /**
   * 全局忽略配置
   *
   * 指定需要全局忽略的文件或目录
   * 这里忽略了 dist 目录，因为这是构建输出目录
   */
  globalIgnores(["dist"]),

  /**
   * 主配置对象
   *
   * 这个配置应用于所有 JavaScript 和 JSX 文件
   * 包含了推荐的规则集和自定义规则
   */
  {
    /**
     * 文件匹配模式
     *
     * 指定这个配置应用于哪些文件
     * 使用 glob 模式匹配所有 .js 和 .jsx 文件
     */
    files: ["**/*.{js,jsx}"],

    /**
     * 扩展的规则集
     *
     * 继承其他配置文件的规则，避免重复配置
     * 配置按顺序应用，后面的配置可以覆盖前面的
     */
    extends: [
      js.configs.recommended, // ESLint 推荐的 JavaScript 规则
      reactHooks.configs.flat.recommended, // React Hooks 推荐规则
      reactRefresh.configs.vite, // Vite 环境下的 React 快速刷新规则
    ],

    /**
     * 语言选项配置
     *
     * 配置 JavaScript 解析器的选项
     */
    languageOptions: {
      /**
       * ECMAScript 版本
       *
       * 指定支持的 JavaScript 版本
       * 2020 表示支持 ES2020 特性
       */
      ecmaVersion: 2020,

      /**
       * 全局变量定义
       *
       * 指定环境中可用的全局变量
       * globals.browser 包含了浏览器环境的全局变量（如 window、document 等）
       */
      globals: globals.browser,

      /**
       * 解析器选项
       *
       * 配置 JavaScript 解析器的详细选项
       */
      parserOptions: {
        /**
         * ECMAScript 版本（解析器）
         *
         * 指定解析器使用的 ECMAScript 版本
         * 'latest' 表示使用最新的 ECMAScript 特性
         */
        ecmaVersion: "latest",

        /**
         * ECMAScript 特性
         *
         * 启用特定的 ECMAScript 特性
         * jsx: true 表示支持 JSX 语法
         */
        ecmaFeatures: { jsx: true },

        /**
         * 源代码类型
         *
         * 指定源代码模块系统
         * 'module' 表示使用 ES 模块（import/export）
         */
        sourceType: "module",
      },
    },

    /**
     * 自定义规则
     *
     * 在这里可以覆盖或添加额外的规则
     * 规则格式：'规则名': [严重级别, 配置选项]
     * 严重级别：'error'（错误）、'warn'（警告）、'off'（关闭）
     */
    rules: {
      /**
       * 未使用变量规则
       *
       * 检查代码中是否有未使用的变量
       * 配置选项：
       * - varsIgnorePattern: 忽略匹配该正则表达式的变量名
       *   ^[A-Z_] 表示忽略以大写字母或下划线开头的变量（通常用于常量）
       */
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],

      /**
       * 为特定文件禁用快速刷新规则
       * AuthContext.jsx 需要导出非组件内容（身份验证上下文）
       * 这是有意为之的设计选择
       */
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  /**
   * AuthContext.jsx 特定配置
   *
   * 这个文件需要导出非组件内容（身份验证上下文提供者和钩子）
   * 因此完全禁用快速刷新规则检查
   */
  {
    files: ["**/AuthContext.jsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
