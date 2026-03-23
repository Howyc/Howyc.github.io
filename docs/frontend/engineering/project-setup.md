---
outline: deep
---

# 第 1 章：前端项目创建

> 从零开始，使用 Vite 创建一个 React + TypeScript 前端项目，集成 Arco Design 组件库，配置暗色主题。

本章将带你走完前端项目的完整初始化流程。我们会逐一讲解项目中的每个配置文件和入口文件，帮助你理解一个现代前端项目是如何从零搭建起来的。

如果你想先了解项目的整体架构，可以阅读 [learn-fullstack 项目详解](/projects/learn-fullstack)。

## 使用 Vite 创建项目

[Vite](https://vite.dev/) 是新一代前端构建工具，启动速度极快，开箱支持 TypeScript 和 React。我们使用 `npm create vite@latest` 命令来创建项目。

### 创建步骤

在终端中执行以下命令：

```bash
# 使用 Vite 官方脚手架创建项目
npm create vite@latest learn-fullstack
```

执行后，Vite 会引导你进行交互式选择：

1. **Select a framework** — 选择 `React`
2. **Select a variant** — 选择 `TypeScript`

选择完成后，Vite 会自动生成项目模板。接下来进入项目目录并安装依赖：

```bash
# 进入项目目录
cd learn-fullstack
# 安装所有依赖包
npm install
# 启动开发服务器
npm run dev
```

### 项目目录结构

创建完成后，项目的基本目录结构如下：

```
learn-fullstack/
├── node_modules/          # 依赖包目录（npm install 自动生成）
├── public/                # 静态资源目录（不经过构建处理）
├── src/                   # 源码目录（所有业务代码都在这里）
│   ├── App.tsx            # 根组件
│   ├── main.tsx           # 入口文件（挂载 React 应用）
│   └── index.css          # 全局样式
├── index.html             # HTML 入口（Vite 以此为构建入口）
├── package.json           # 项目配置和依赖声明
├── tsconfig.json          # TypeScript 配置入口
├── tsconfig.app.json      # 应用代码的 TypeScript 配置
├── tsconfig.node.json     # Node.js 环境的 TypeScript 配置
└── vite.config.ts         # Vite 构建配置
```

::: tip 提示
`index.html` 是 Vite 项目的真正入口。与 Webpack 不同，Vite 不需要在配置中指定入口文件，而是直接从 HTML 文件中的 `<script type="module">` 标签找到 `src/main.tsx`。
:::

## Vite 配置详解

下面是项目中实际使用的 Vite 配置文件，包含 React 插件、React Compiler 和开发辅助插件的配置。

<!-- 来自 learn-fullstack/vite.config.ts -->
```typescript
// 从 vite 包中导入 defineConfig 函数，用于提供配置的类型提示和智能补全
import { defineConfig } from 'vite'
// 导入 Vite 的 React 官方插件，提供 JSX 转换和 Fast Refresh 热更新支持
import react from '@vitejs/plugin-react'
// 导入 Click-to-Component 插件，支持在浏览器中 Option+右键点击组件直接跳转到源码
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'

// 使用 defineConfig 包裹配置对象，获得完整的 TypeScript 类型支持
export default defineConfig({
  // plugins 数组：注册 Vite 插件，扩展构建能力
  plugins: [
    // 调用 react() 插件，传入自定义配置
    react({
      // babel 配置：自定义 Babel 编译选项
      babel: {
        // plugins 数组：注册 Babel 插件
        plugins: [
          // 启用 React Compiler 插件，自动优化组件的重渲染性能
          // React Compiler 会在编译时分析组件，自动添加 memoization（记忆化）
          // 相当于自动帮你加上 useMemo 和 useCallback，无需手动优化
          ['babel-plugin-react-compiler']
        ],
      },
    }),
    // Click-to-Component 插件：开发时在浏览器中 Option+右键（Mac）或 Alt+右键（Windows）
    // 点击任意 React 组件，自动在编辑器中打开对应的源码文件
    // 只在开发模式下生效，生产构建时会自动移除
    reactClickToComponent(),
  ],
})
```

**配置项说明：**

| 配置项 | 作用 |
|--------|------|
| `defineConfig()` | Vite 提供的辅助函数，让编辑器能自动补全配置项 |
| `plugins` | 插件数组，Vite 通过插件机制扩展功能 |
| `@vitejs/plugin-react` | React 官方插件，提供 JSX 编译和 HMR（热模块替换）支持 |
| `babel-plugin-react-compiler` | React 19 新增的编译器插件，自动优化组件性能 |
| `vite-plugin-react-click-to-component` | 开发辅助插件，浏览器中点击组件直接跳转到源码 |

::: tip Click-to-Component 使用方法
开发模式下（`npm run dev`），在浏览器中按住 `Alt`（Windows）或 `Option`（Mac）并右键点击任意页面元素，编辑器会自动打开该组件的源码文件并定位到对应行。这个功能只在开发时生效，不会影响生产构建。
:::

::: info React Compiler 是什么？
React Compiler 是 React 19 引入的编译时优化工具。它在构建阶段分析你的组件代码，自动判断哪些值需要缓存（memoize），从而减少不必要的重渲染。你不再需要手动使用 `useMemo`、`useCallback` 和 `React.memo` 来优化性能。
:::

## TypeScript 配置体系


Vite 创建的 React + TypeScript 项目使用了三个 TypeScript 配置文件，形成一个分层配置体系。这种设计将应用代码和构建工具代码的编译规则分开管理。

### tsconfig.json — 配置入口

这是 TypeScript 的根配置文件，它本身不包含编译选项，而是通过 `references` 引用其他配置文件。

<!-- 来自 learn-fullstack/tsconfig.json -->
```jsonc
{
  // files 设为空数组，表示根配置本身不编译任何文件
  "files": [],
  // references 定义项目引用，将编译工作委托给子配置
  "references": [
    // 引用应用代码的 TypeScript 配置（编译 src/ 目录下的代码）
    { "path": "./tsconfig.app.json" },
    // 引用 Node.js 环境的 TypeScript 配置（编译 vite.config.ts 等构建工具文件）
    { "path": "./tsconfig.node.json" }
  ]
}
```

**为什么要拆分配置？**

应用代码（`src/` 目录）运行在浏览器中，需要 DOM API 和 JSX 支持；而构建工具代码（`vite.config.ts`）运行在 Node.js 中，需要 Node.js API。两者的运行环境不同，所以需要不同的编译配置。

### tsconfig.app.json — 应用代码配置

这个配置文件负责编译 `src/` 目录下的所有应用代码，包括 React 组件、TypeScript 类型定义等。

<!-- 来自 learn-fullstack/tsconfig.app.json -->
```jsonc
{
  "compilerOptions": {
    // 增量编译缓存文件路径，加速后续编译
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    // 编译目标：ES2022，支持 top-level await、class fields 等现代语法
    "target": "ES2022",
    // 启用 ES2022 的 class fields 定义语义（与 ECMAScript 标准一致）
    "useDefineForClassFields": true,
    // 可用的类型库：ES2022 标准库 + 浏览器 DOM API + DOM 可迭代接口
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    // 模块系统：使用 ESNext 模块（import/export 语法）
    "module": "ESNext",
    // 引入 Vite 客户端类型声明（支持 import.meta.env 等 Vite 特有 API）
    "types": ["vite/client"],
    // 跳过第三方库的类型检查，加快编译速度
    "skipLibCheck": true,

    /* Bundler mode — 适配打包工具的模块解析策略 */
    // 模块解析策略：bundler 模式，适配 Vite 等现代打包工具
    "moduleResolution": "bundler",
    // 允许导入 .ts/.tsx 扩展名的文件（打包工具会处理扩展名）
    "allowImportingTsExtensions": true,
    // 强制使用 type-only 导入语法（import type { ... }），让类型导入更明确
    "verbatimModuleSyntax": true,
    // 强制将每个文件视为独立模块（即使没有 import/export 语句）
    "moduleDetection": "force",
    // 不输出编译结果（由 Vite 负责构建，TypeScript 只做类型检查）
    "noEmit": true,
    // JSX 转换模式：react-jsx（React 17+ 的新 JSX 转换，无需手动 import React）
    "jsx": "react-jsx",

    /* Linting — 代码质量检查 */
    // 启用所有严格类型检查选项
    "strict": true,
    // 报告未使用的局部变量
    "noUnusedLocals": true,
    // 报告未使用的函数参数
    "noUnusedParameters": true,
    // 只允许可擦除的类型语法（确保类型注解在运行时可安全移除）
    "erasableSyntaxOnly": true,
    // 禁止 switch 语句中的 case 穿透（忘写 break 时报错）
    "noFallthroughCasesInSwitch": true,
    // 检查仅有副作用的导入语句（如 import './style.css'）
    "noUncheckedSideEffectImports": true
  },
  // 指定编译范围：只编译 src/ 目录下的文件
  "include": ["src"]
}
```

**关键配置解读：**

| 配置项 | 值 | 为什么这样配置 |
|--------|-----|--------------|
| `target` | ES2022 | 现代浏览器都支持 ES2022，无需降级编译 |
| `module` | ESNext | 使用原生 ES 模块，由 Vite 处理模块打包 |
| `noEmit` | true | TypeScript 只做类型检查，不输出 JS 文件（Vite 负责编译） |
| `jsx` | react-jsx | React 17+ 新 JSX 转换，组件文件中不需要 `import React` |
| `strict` | true | 开启严格模式，获得最完整的类型安全保障 |

### tsconfig.node.json — 构建工具配置

这个配置文件专门用于编译运行在 Node.js 环境中的文件，比如 `vite.config.ts`。

<!-- 来自 learn-fullstack/tsconfig.node.json -->
```jsonc
{
  "compilerOptions": {
    // 增量编译缓存文件路径
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    // 编译目标：ES2023（Node.js 环境支持更新的语法）
    "target": "ES2023",
    // 可用的类型库：只需要 ES2023 标准库（不需要 DOM，因为运行在 Node.js 中）
    "lib": ["ES2023"],
    // 模块系统：ESNext
    "module": "ESNext",
    // 引入 Node.js 类型声明（支持 process、path 等 Node.js API）
    "types": ["node"],
    // 跳过第三方库的类型检查
    "skipLibCheck": true,

    /* Bundler mode */
    // 模块解析策略：bundler 模式
    "moduleResolution": "bundler",
    // 允许导入 .ts 扩展名的文件
    "allowImportingTsExtensions": true,
    // 强制使用 type-only 导入语法
    "verbatimModuleSyntax": true,
    // 强制将每个文件视为独立模块
    "moduleDetection": "force",
    // 不输出编译结果
    "noEmit": true,

    /* Linting */
    // 启用严格类型检查
    "strict": true,
    // 报告未使用的局部变量
    "noUnusedLocals": true,
    // 报告未使用的函数参数
    "noUnusedParameters": true,
    // 只允许可擦除的类型语法
    "erasableSyntaxOnly": true,
    // 禁止 switch case 穿透
    "noFallthroughCasesInSwitch": true,
    // 检查仅有副作用的导入
    "noUncheckedSideEffectImports": true
  },
  // 指定编译范围：只编译 vite.config.ts 文件
  "include": ["vite.config.ts"]
}
```

**与 tsconfig.app.json 的区别：**

| 对比项 | tsconfig.app.json | tsconfig.node.json |
|--------|-------------------|-------------------|
| 编译目标 | ES2022（浏览器） | ES2023（Node.js） |
| 类型库 | ES2022 + DOM | ES2023（无 DOM） |
| 类型声明 | `vite/client` | `node` |
| 编译范围 | `src/` 目录 | `vite.config.ts` |
| JSX 支持 | `react-jsx` | 无（不需要） |


## 入口文件 main.tsx

`main.tsx` 是整个 React 应用的入口文件。它负责将根组件挂载到 HTML 页面的 DOM 节点上，并导入全局样式。

<!-- 来自 learn-fullstack/src/main.tsx -->
```tsx
// 从 react-dom/client 导入 createRoot 函数，这是 React 18+ 的新渲染 API
import { createRoot } from 'react-dom/client'
// 导入 Arco Design 组件库的全局 CSS 样式（包含所有组件的默认样式）
import '@arco-design/web-react/dist/css/arco.css'
// 导入项目的全局自定义样式
import './index.css'
// 导入根组件 App（整个应用的顶层组件）
import App from './App.tsx'

// 创建 React 根节点并渲染应用：
// 1. document.getElementById('root')! — 获取 index.html 中 id 为 "root" 的 DOM 元素
//    末尾的 ! 是 TypeScript 的非空断言，告诉编译器这个元素一定存在
// 2. createRoot() — 创建 React 并发模式的根节点
// 3. .render(<App />) — 将 App 组件渲染到该根节点中
createRoot(document.getElementById('root')!).render(<App />)
```

**代码执行流程：**

```
index.html 加载
    ↓
<script type="module" src="/src/main.tsx"> 执行
    ↓
导入全局样式（Arco Design CSS + 自定义 CSS）
    ↓
createRoot() 创建 React 根节点
    ↓
.render(<App />) 渲染根组件到页面
```

::: tip CSS 导入顺序很重要
注意 `arco.css` 在 `index.css` 之前导入。这样你在 `index.css` 中编写的自定义样式可以覆盖 Arco Design 的默认样式。CSS 的层叠规则是后导入的样式优先级更高。
:::

## package.json 依赖管理

`package.json` 是 Node.js 项目的核心配置文件，定义了项目信息、脚本命令和依赖包。下面重点讲解 `dependencies` 和 `devDependencies` 的区别以及每个依赖包的用途。

### dependencies 与 devDependencies 的区别

| 类别 | 说明 | 安装命令 |
|------|------|---------|
| `dependencies` | **运行时依赖** — 应用运行时需要的包，会被打包到最终产物中 | `npm install <包名>` |
| `devDependencies` | **开发时依赖** — 只在开发和构建阶段使用，不会出现在最终产物中 | `npm install -D <包名>` |

简单来说：用户浏览你的网站时需要用到的包放在 `dependencies`，只有开发者写代码时才需要的工具放在 `devDependencies`。

### 运行时依赖（dependencies）

<!-- 来自 learn-fullstack/package.json -->
```jsonc
{
  "dependencies": {
    // Arco Design 组件库：字节跳动出品的 React UI 组件库，提供丰富的企业级组件
    "@arco-design/web-react": "^2.66.11",
    // React 核心库：提供组件、Hooks、状态管理等核心功能
    "react": "^19.2.0",
    // React DOM 渲染库：负责将 React 组件渲染到浏览器 DOM 中
    "react-dom": "^19.2.0",
    // React Router：React 官方路由库，实现页面导航和路由守卫
    "react-router-dom": "^7.13.1"
  }
}
```

| 依赖包 | 用途 |
|--------|------|
| `@arco-design/web-react` | UI 组件库，提供 Button、Table、Form、Message 等现成组件 |
| `react` | React 核心，提供 `useState`、`useEffect` 等 Hooks 和组件模型 |
| `react-dom` | React 的浏览器渲染器，提供 `createRoot` 等 DOM 操作 API |
| `react-router-dom` | 客户端路由，实现 SPA 页面切换，提供 `BrowserRouter`、`Routes`、`useNavigate` 等 |

### 开发时依赖（devDependencies）

<!-- 来自 learn-fullstack/package.json -->
```jsonc
{
  "devDependencies": {
    // ESLint 核心 JS 配置：提供 JavaScript 的推荐 lint 规则
    "@eslint/js": "^9.39.1",
    // Node.js 类型声明：让 TypeScript 识别 Node.js API（如 process、path）
    "@types/node": "^24.10.1",
    // React 类型声明：让 TypeScript 识别 React 的类型（如 FC、ReactNode）
    "@types/react": "^19.2.5",
    // React DOM 类型声明：让 TypeScript 识别 react-dom 的类型
    "@types/react-dom": "^19.2.3",
    // Vite 的 React 插件：提供 JSX 编译和 HMR（热模块替换）支持
    "@vitejs/plugin-react": "^5.1.1",
    // React Compiler 的 Babel 插件：编译时自动优化组件性能
    "babel-plugin-react-compiler": "^1.0.0",
    // ESLint 代码检查工具：静态分析代码，发现潜在问题和风格不一致
    "eslint": "^9.39.1",
    // ESLint React Hooks 插件：检查 Hooks 使用规则（如依赖数组是否正确）
    "eslint-plugin-react-hooks": "^7.0.1",
    // ESLint React Refresh 插件：确保组件导出方式兼容热更新
    "eslint-plugin-react-refresh": "^0.4.24",
    // 全局变量定义：为 ESLint 提供浏览器和 Node.js 的全局变量列表
    "globals": "^16.5.0",
    // TypeScript 编译器：提供类型检查和编译能力
    "typescript": "~5.9.3",
    // TypeScript ESLint 集成：让 ESLint 能检查 TypeScript 代码
    "typescript-eslint": "^8.46.4",
    // Vite 构建工具：提供开发服务器、热更新和生产构建
    "vite": "^7.2.4",
    // Click-to-Component 插件：开发时在浏览器中点击组件跳转到源码
    "vite-plugin-react-click-to-component": "^4.2.1"
  }
}
```

**依赖分类总结：**

| 类别 | 包名 | 作用 |
|------|------|------|
| 类型声明 | `@types/node`、`@types/react`、`@types/react-dom` | 为 JS 库提供 TypeScript 类型定义 |
| 构建工具 | `vite`、`@vitejs/plugin-react`、`babel-plugin-react-compiler` | 开发服务器和生产构建 |
| 代码检查 | `eslint`、`@eslint/js`、`eslint-plugin-react-hooks`、`eslint-plugin-react-refresh`、`typescript-eslint`、`globals` | 代码质量和风格检查 |
| 编译器 | `typescript` | TypeScript 类型检查 |
| 开发辅助 | `vite-plugin-react-click-to-component` | 浏览器中点击组件跳转到源码 |

### 脚本命令

<!-- 来自 learn-fullstack/package.json -->
```jsonc
{
  "scripts": {
    // 启动 Vite 开发服务器（支持热更新，修改代码后浏览器自动刷新）
    "dev": "vite",
    // 生产构建：先运行 TypeScript 类型检查（tsc -b），再用 Vite 打包
    "build": "tsc -b && vite build",
    // 运行 ESLint 代码检查（检查当前目录下所有文件）
    "lint": "eslint .",
    // 预览生产构建结果（在本地启动一个静态服务器）
    "preview": "vite preview"
  }
}
```


## 集成 Arco Design 组件库

[Arco Design](https://arco.design/) 是字节跳动出品的企业级 React UI 组件库，提供了丰富的高质量组件。本项目使用 Arco Design 作为 UI 框架，并配置了暗色主题。

### 安装 Arco Design

```bash
# 安装 Arco Design React 组件库
npm install @arco-design/web-react
```

安装完成后，`@arco-design/web-react` 会出现在 `package.json` 的 `dependencies` 中。

### 全局 CSS 导入

Arco Design 的样式需要在应用入口文件中全局导入。回顾 `main.tsx` 中的关键一行：

```tsx
// 导入 Arco Design 的全局 CSS 样式文件
// 这个文件包含了所有 Arco 组件的默认样式（按钮、表格、弹窗等）
// 必须在应用入口处导入，确保所有组件都能正确显示样式
import '@arco-design/web-react/dist/css/arco.css'
```

::: warning 注意
如果忘记导入这行 CSS，Arco Design 的组件虽然能渲染出 HTML 结构，但不会有任何样式效果（没有颜色、没有边距、没有圆角等）。这是使用 Arco Design 最常见的问题之一。
:::

### 暗色主题配置

本项目使用了 Arco Design 的暗色主题。暗色主题的启用方式是在 `<body>` 标签上添加 `arco-theme="dark"` 属性。

在项目的 `index.html` 中：

```html
<!-- 在 body 标签上设置 arco-theme="dark" 属性 -->
<!-- Arco Design 会根据这个属性自动切换所有组件的配色方案为暗色 -->
<body arco-theme="dark">
  <!-- id="root" 是 React 应用的挂载点 -->
  <div id="root"></div>
  <!-- Vite 会自动注入 main.tsx 的 script 标签 -->
  <script type="module" src="/src/main.tsx"></script>
</body>
```

**暗色主题的工作原理：**

Arco Design 的 CSS 中定义了两套 CSS 变量（CSS Custom Properties）：

- 默认（亮色）：`--color-bg-1: #fff`、`--color-text-1: #1d2129` 等
- 暗色：当 `body[arco-theme="dark"]` 时，CSS 变量被覆盖为暗色值

所有 Arco 组件的样式都引用这些 CSS 变量，所以只需切换 `arco-theme` 属性，整个应用的配色就会自动切换。

### 在组件中使用 Arco Design

安装和配置完成后，就可以在任意组件中按需导入 Arco Design 的组件了：

```tsx
// 从 Arco Design 中按需导入需要的组件
import { Button, Message, Table } from '@arco-design/web-react'

// 在 JSX 中直接使用
function MyComponent() {
  return (
    // type="primary" 设置按钮为主色调样式
    <Button type="primary" onClick={() => Message.success('操作成功！')}>
      点击我
    </Button>
  )
}
```

Arco Design 支持按需导入（tree-shaking），Vite 在构建时会自动移除未使用的组件代码，不会增加不必要的包体积。

## 小结

本章我们完成了前端项目的完整搭建流程：

1. **项目创建** — 使用 `npm create vite@latest` 创建 React + TypeScript 项目
2. **Vite 配置** — 配置 React 插件和 React Compiler 自动性能优化
3. **TypeScript 配置** — 理解三个配置文件的分工（根配置、应用配置、Node.js 配置）
4. **入口文件** — `main.tsx` 负责导入全局样式并挂载 React 根组件
5. **依赖管理** — 区分运行时依赖和开发时依赖，了解每个包的用途
6. **UI 组件库** — 集成 Arco Design，配置全局样式和暗色主题

下一章我们将深入讲解项目中使用的前端核心技术，包括 React Hooks、TypeScript 类型系统、路由守卫和 API 封装。

👉 [继续阅读：第 2 章 — 前端知识点详解](../react/frontend-knowledge)

如果你想了解更多 Java 后端知识，也可以参考 [Java 零基础入门笔记](/backend/java/java-zero-to-one)。
