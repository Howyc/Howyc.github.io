---
outline: deep
---

# VitePress 文档站开发指南

> 本章讲解文档站（本站）的技术实现：VitePress 配置、Vue 3 自定义组件、主题系统、博客功能和第三方集成。所有代码来自 `docs/.vitepress/` 目录的真实源码。

## VitePress 是什么？

[VitePress](https://vitepress.dev/) 是基于 Vite + Vue 3 的静态站点生成器，专为文档和博客设计。你写 Markdown 文件，VitePress 自动生成网站。

| 概念 | VitePress | React 类比 |
|------|-----------|-----------|
| 页面 | `.md` 文件 | `.tsx` 组件 |
| 配置 | `config.mts` | `vite.config.ts` |
| 主题 | `.vitepress/theme/` | `src/components/` |
| 路由 | 文件路径自动生成 | React Router 手动配置 |

## 项目结构

```
docs/.vitepress/
├── config.mts              # 站点配置（导航、侧边栏、SEO、PWA）
└── theme/
    ├── index.ts            # 主题入口（注册自定义组件）
    ├── ReadingProgress.vue # 阅读进度条
    ├── ThemeSwitcher.vue   # 多主题切换器
    ├── ArticleMeta.vue     # 文章元信息（日期、标签、阅读时间）
    ├── GiscusComment.vue   # Giscus 评论系统
    ├── TagsPage.vue        # 标签分类页面
    └── themes.css          # 10 套主题的 CSS 变量
```

## config.mts — 站点配置

### 基础配置

```ts
import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'

// withPwa() 包裹 defineConfig，启用 PWA 支持
export default withPwa(defineConfig({
  base: '/',           // 部署路径
  lang: 'zh-CN',       // 站点语言
  title: 'Howyc.dev',  // 站点标题
  appearance: 'dark',  // 默认主题：'dark' | 'light' | true（跟随系统）
}))
```

### 导航栏与侧边栏

```ts
themeConfig: {
  nav: [
    { text: '首页', link: '/' },
    { text: '前端', link: '/frontend/' },
    // link 路径对应 docs/ 下的目录
  ],
  sidebar: {
    '/frontend/': [
      {
        text: 'React 开发',    // 分组标题
        items: [
          { text: '前端知识点详解', link: '/frontend/react/frontend-knowledge' },
        ],
      },
    ],
  },
}
```

### SEO 与 PWA

```ts
head: [
  ['meta', { property: 'og:title', content: 'Howyc.dev' }],
  ['meta', { name: 'twitter:card', content: 'summary' }],
],
sitemap: { hostname: 'https://howyc.github.io' },
pwa: {
  registerType: 'autoUpdate',
  manifest: { name: 'Howyc.dev 知识库', display: 'standalone' },
  workbox: { globPatterns: ['**/*.{css,js,html,svg,png,ico,txt,woff2}'] },
}
```

## 主题入口 — index.ts

VitePress 通过 `theme/index.ts` 扩展默认主题，注入自定义组件到页面不同位置。

```ts
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

export default {
  extends: DefaultTheme,
  Layout() {
    // h() 是 Vue 的 createElement，第三个参数是插槽
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ReadingProgress),      // 页面最顶部
      'nav-bar-content-after': () => h(ThemeSwitcher), // 导航栏右侧
      'doc-after': () => h(GiscusComment),          // 文档内容后
      'doc-before': () => h(ArticleMeta),           // 文档内容前
    })
  },
  enhanceApp({ app }) {
    app.component('TagsPage', TagsPage)  // 注册全局组件
  },
}
```

### VitePress 布局插槽

| 插槽名 | 位置 | 本站用途 |
|--------|------|---------|
| `layout-top` | 页面最顶部 | 阅读进度条 |
| `nav-bar-content-after` | 导航栏右侧 | 主题切换器 |
| `doc-before` | 文档内容前 | 文章元信息 |
| `doc-after` | 文档内容后 | Giscus 评论 |

## Vue 3 核心概念

VitePress 主题组件使用 Vue 3 的 Composition API。如果你熟悉 React，对照表如下：

| Vue 3 | React | 说明 |
|-------|-------|------|
| `ref(value)` | `useState(value)` | 响应式状态 |
| `computed(() => ...)` | `useMemo(() => ..., [deps])` | 计算属性（自动追踪依赖） |
| `watch(source, callback)` | `useEffect(() => ..., [deps])` | 监听变化 |
| `onMounted(() => ...)` | `useEffect(() => ..., [])` | 组件挂载后执行 |
| `onUnmounted(() => ...)` | `useEffect` 的 return 清理函数 | 组件卸载时执行 |
| `v-if` / `v-show` | `{condition && <Comp />}` | 条件显示 |
| `v-for` | `array.map(item => <Comp />)` | 列表渲染 |

### ref — 响应式状态

```ts
import { ref } from 'vue'

// ref() 创建响应式变量，类似 React 的 useState
const progress = ref(0)

// 修改值：直接赋值 .value
progress.value = 50  // Vue 自动触发重新渲染

// 在模板中使用时不需要 .value，Vue 自动解包
// <div :style="{ width: progress + '%' }" />
```

### computed — 计算属性

```ts
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

// computed 自动追踪依赖，frontmatter 变化时自动重新计算
// 不需要像 React useMemo 那样手动写依赖数组
const tags = computed(() => frontmatter.value.tags || [])
const series = computed(() => frontmatter.value.series || '')
```

### watch — 监听变化

```ts
import { watch, nextTick } from 'vue'
import { useData, useRoute } from 'vitepress'

const { isDark } = useData()
const route = useRoute()

// 监听路由变化，重新加载评论
watch(() => route.path, () => nextTick(loadGiscus))

// 监听暗色模式变化，同步 Giscus 主题
watch(isDark, (dark) => {
  updateGiscusTheme(dark ? 'dark' : 'light')
})
```

### onMounted / onUnmounted — 生命周期

```ts
import { onMounted, onUnmounted } from 'vue'

function handleScroll() { /* ... */ }

// 组件挂载后添加事件监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

// 组件卸载时移除事件监听（防止内存泄漏）
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
```

## 自定义组件详解

### ReadingProgress — 阅读进度条

固定在页面顶部的进度条，根据滚动位置显示阅读进度。

核心逻辑：监听 `scroll` 事件，计算 `scrollTop / (scrollHeight - clientHeight) * 100` 得到百分比，动态设置进度条宽度。`{ passive: true }` 优化滚动性能。

### ArticleMeta — 文章元信息

显示文章的日期、阅读时间、系列和标签。数据来自 Markdown 文件的 frontmatter：

```yaml
---
date: 2025-03-15
tags: [React, TypeScript]
series: 全栈开发
seriesOrder: 1
---
```

阅读时间按每分钟 300 字计算，通过 `document.querySelector('.vp-doc')?.textContent` 获取文档纯文本长度。

### ThemeSwitcher — 多主题切换

支持 10 套主题（5 暗色 + 5 亮色），使用 View Transitions API 实现切换动画。

核心流程：用户选择主题 → 切换 CSS 类名 → CSS 变量生效 → 同步 VitePress 暗色模式 → localStorage 持久化。

关键技术点：
1. CSS 变量主题：每套主题定义一组 CSS 变量
2. View Transitions API：`document.startViewTransition()` 实现平滑切换
3. localStorage 持久化：刷新页面后恢复上次选择的主题

### GiscusComment — 评论系统

基于 GitHub Discussions 的评论系统，通过动态插入 script 标签加载。路由切换时重新加载，暗色模式变化时通过 `postMessage` 同步主题。首页和 index 页面不显示评论。

### TagsPage — 标签分类

将文章按标签分组展示。通过 `computed` 构建 `标签 → 文章列表` 的映射，遍历所有文章的 tags 数组生成分组。

## CSS 主题系统

`themes.css` 定义了 10 套主题，每套通过 CSS 变量控制颜色、字体等。

### 主题变量结构

```css
.theme-midnight {
  --vp-c-brand-1: #60a5fa;      /* 品牌主色 */
  --vp-c-bg: #0b0f19;           /* 页面背景色 */
  --vp-c-bg-soft: #111827;      /* 卡片背景色 */
  --vp-c-text-1: #e2e8f0;       /* 主文字颜色 */
  --vp-c-text-2: #94a3b8;       /* 次要文字颜色 */
  --vp-font-family-base: -apple-system, sans-serif;
  --vp-code-bg: #151e2e;        /* 代码块背景色 */
}
```

### 10 套主题一览

| 主题 | ID | 类型 | 特色字体 |
|------|-----|------|---------|
| 🌙 午夜 | `midnight` | 暗色 | 系统默认 |
| ☀️ 日光 | `daylight` | 亮色 | 系统默认 |
| 🌊 深海 | `ocean` | 暗色 | Monospace |
| 🌸 樱花 | `sakura` | 亮色 | Serif 衬线 |
| 🌲 森林 | `forest` | 暗色 | Fira Code |
| 🍃 薄荷 | `mint` | 亮色 | Avenir |
| 🪐 星云 | `nebula` | 暗色 | JetBrains Mono |
| 💜 薰衣草 | `lavender` | 亮色 | Palatino 衬线 |
| 🔥 余烬 | `ember` | 暗色 | Source Code Pro |
| 🏜️ 沙漠 | `sand` | 亮色 | Cambria 衬线 |

### View Transition 动画

```css
::view-transition-old(root) {
  animation: 0.3s ease-out both fade-out;
}
::view-transition-new(root) {
  animation: 0.3s ease-out both fade-in;
}
@keyframes fade-out { to { opacity: 0; } }
@keyframes fade-in { from { opacity: 0; } }
```

## VitePress 常用 API

| API | 来源 | 用途 |
|-----|------|------|
| `useData()` | `vitepress` | 获取页面数据（frontmatter、isDark 等） |
| `useRoute()` | `vitepress` | 获取当前路由信息 |
| `frontmatter` | `useData()` | 当前页面的 YAML 头部数据 |
| `isDark` | `useData()` | 当前是否暗色模式（响应式） |

## 小结

本站使用的核心技术：

1. **VitePress 配置** — `config.mts` 控制导航、侧边栏、SEO、PWA
2. **Vue 3 组件** — `ref` / `computed` / `watch` / 生命周期
3. **布局插槽** — 通过 `h()` 渲染函数将自定义组件注入到页面不同位置
4. **CSS 变量主题** — 10 套主题通过 CSS 变量切换，View Transitions 动画
5. **第三方集成** — Giscus 评论、PWA 离线访问、sitemap SEO
