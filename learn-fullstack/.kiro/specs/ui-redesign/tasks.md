# Implementation Plan: UI Redesign

## Overview

将 MCP 全栈数据流演示项目前端从扁平布局升级为 Developer Dashboard 风格。实现顺序：设计系统基础（CSS 变量 + 字体）→ SVG 图标系统 → 新建布局组件（Sidebar、TopBar、SkeletonCard）→ 改造 App.tsx 布局结构 → 逐一改造现有组件 → 集成验证。


## Tasks

- [x] 1. 建立设计系统基础（CSS 变量 + 字体）
  - [x] 1.1 修改 `src/index.css`：引入 Google Fonts（Inter + JetBrains Mono），添加全局 CSS 重置，设置 `body` 使用 `--font-sans`、`--color-bg`、`--leading-normal`
    - 字体 `@import` 放在文件顶部，包含 Inter wght@400;500;600;700 和 JetBrains Mono wght@400;500
    - 添加 `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
    - 添加 `body { min-width: 320px; -webkit-font-smoothing: antialiased; }`
    - _Requirements: 2.3, 2.4, 1.8_

  - [x] 1.2 重写 `src/App.css`：在 `:root` 中定义完整 CSS 变量集合（色彩、字体、间距、圆角、阴影、动效、Sidebar 专用、代码区专用）
    - 按 design.md Part 2.1–2.5 定义所有 `--color-*`、`--font-*`、`--text-*`、`--space-*`、`--radius-*`、`--shadow-*`、`--duration-*`、`--ease-*`、`--sidebar-*`、`--code-*` 变量
    - 禁止在后续规则中硬编码十六进制颜色值
    - _Requirements: 2.1, 2.2_

  - [ ]* 1.3 为 CSS 变量体系编写属性测试
    - **Property 3: 按钮语义色映射正确性**
    - **Validates: Requirements 2.2, 5.2**
    - 使用 Vitest + jsdom 验证 `:root` 上各语义色变量值与 design.md 规范一致


- [x] 2. 创建 SVG 图标系统
  - [x] 2.1 新建 `src/assets/icons.tsx`：实现所有 16 个 Icon_Component，统一接受 `size`（默认 16）和 `className` props，使用 `stroke="currentColor"`
    - 包含：`IconUsers`、`IconFileText`、`IconTerminal`、`IconUser`、`IconMail`、`IconMapPin`、`IconBuilding`、`IconPencil`、`IconTrash`、`IconX`、`IconSearch`、`IconPlus`、`IconDatabase`、`IconDownload`、`IconSave`、`IconRefreshCw`
    - 所有图标 SVG path 使用 Heroicons / Lucide 风格的 24×24 viewBox，`strokeWidth={2}`
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 2.2 为图标系统编写单元测试
    - 验证每个 Icon_Component 渲染后 SVG 的 `width`/`height` 等于传入的 `size` prop
    - 验证 `stroke="currentColor"` 属性存在
    - _Requirements: 9.2, 9.3_

  - [ ]* 2.3 为图标按钮无障碍标签编写属性测试
    - **Property 8: 图标按钮无障碍标签完整性**
    - **Validates: Requirements 11.2**
    - 扫描渲染树中所有仅含 SVG 子元素的 `<button>`，断言其 `aria-label` 属性非空


- [-] 3. 新建布局组件
  - [x] 3.1 新建 `src/components/Sidebar.tsx`：实现左侧导航栏组件
    - Props 接口：`{ activeSource: DataSource | 'playground'; onNavigate: (source: DataSource | 'playground') => void }`
    - 顶部品牌区：项目名 "MCP Demo"（`--font-mono`）+ 副标题 "全栈数据流"
    - 三个 Nav_Item：用户管理（`IconUsers` 20px）、帖子管理（`IconFileText` 20px）、API 练习场（`IconTerminal` 20px）
    - Active 状态：左侧 3px 蓝色竖条 + `--sidebar-item-active-bg` 背景 + `aria-current="page"`
    - Hover 状态：`--duration-fast` 过渡到 `--sidebar-item-hover`
    - 底部：后端地址信息文字
    - 移动端：支持 `isOpen` 状态控制 overlay 展开/收起
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 11.3_

  - [x] 3.2 新建 `src/components/TopBar.tsx`：实现顶部状态栏组件
    - Props 接口：`{ title: string; loading: boolean; error?: string | null }`
    - 高度 56px，`position: sticky; top: 0; z-index: 10`，底部 1px `--color-border`
    - 右侧：`loading=true` 时显示旋转 spinner（CSS `border-top-color: --color-primary`）
    - 右侧：`error` 非空时显示错误 badge
    - 移动端：左侧显示汉堡菜单按钮（`hamburger-btn`），点击触发 `onMenuToggle` 回调
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 3.3 新建 `src/components/SkeletonCard.tsx`：实现骨架屏占位组件
    - 模拟 UserCard 结构：头像占位（32px 圆形）+ 姓名占位（120px×16px）+ ID 徽章占位（48px×16px）+ 三行内容占位
    - 在 `App.css` 中添加 `.skeleton` shimmer 动画（`skeleton-shimmer` keyframes，1.5s 循环）
    - _Requirements: 8.3, 8.4_

  - [ ]* 3.4 为骨架屏显示条件编写属性测试
    - **Property 7: 骨架屏显示条件正确性**
    - **Validates: Requirements 8.1, 8.2, 8.5**
    - 使用 fast-check 对 `loading: boolean` 和 `data: any[]` 的所有组合进行属性测试，验证仅当 `loading===true && data.length===0` 时渲染 SkeletonCard


- [-] 4. 改造 App.tsx 全局布局结构
  - [x] 4.1 修改 `src/App.tsx`：将 JSX 根结构从 `.app` 改为 `.app-shell`，引入 Sidebar 和 TopBar 组件
    - 添加 `PAGE_TITLES` 映射：`{ users: '用户管理', posts: '帖子管理', playground: 'API 练习场' }`
    - 添加移动端 `sidebarOpen` 状态，传递给 Sidebar 和 TopBar
    - 结构：`<div className="app-shell"> <Sidebar .../> <div className="content-area"> <TopBar .../> <main className="page-content">...</main> </div> </div>`
    - 保持所有现有状态变量和事件处理函数不变
    - _Requirements: 1.1, 1.2, 1.3, 4.2, 12.1_

  - [x] 4.2 在 `App.css` 中添加布局样式：`.app-shell`、`.content-area`、`.topbar`、`.page-content` 及三档响应式断点
    - Desktop（≥1024px）：Sidebar 240px 固定展开
    - Tablet（768px–1023px）：Sidebar 64px 图标模式，隐藏 `.nav-label`、`.brand-subtitle`、`.sidebar-footer-text`
    - Mobile（<768px）：Sidebar `position: fixed; left: -240px`，`.sidebar.open { left: 0 }`，显示 `.sidebar-overlay`
    - `body { min-width: 320px }` 防止布局崩溃
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 4.3 为响应式布局断点编写属性测试
    - **Property 1: 响应式布局断点一致性**
    - **Validates: Requirements 1.2, 1.3, 1.4**
    - 使用 fast-check 对视口宽度区间（<768、768–1023、≥1024）进行属性测试，验证 Sidebar 宽度和可见性符合规范

  - [ ]* 4.4 为导航状态一致性编写属性测试
    - **Property 2: 导航状态与页面标题一致性**
    - **Validates: Requirements 3.3, 3.4, 4.2**
    - 对 `activeSource` 的三个合法值进行属性测试，验证 Nav_Item active 状态和 TopBar 标题同时与 `activeSource` 一致

- [ ] 5. Checkpoint — 确认布局骨架正常
  - 确保 App 能正常渲染 app-shell 布局，Sidebar 导航切换功能正常，TopBar 标题随 activeSource 变化，所有测试通过。如有问题请向用户确认。


- [ ] 6. 改造 ActionPanel 组件
  - [ ] 6.1 修改 `src/components/ActionPanel.tsx`（或对应文件）：移除 panel-header 紫色渐变，应用语义色按钮类，更新搜索区样式
    - Panel header 改为白色背景 + 底部 `--color-border` 分割线，标题使用 `--font-semibold`
    - 按钮应用语义类：`.btn-fetch`（`--color-success`）、`.btn-save`（`--color-warning`）、`.btn-query`（`--color-primary`）、`.btn-add`（`--color-accent`）
    - 在 `App.css` 中添加对应按钮类，包含 hover（`--duration-fast`）和 active（`scale(0.97)`）状态
    - disabled 状态：`opacity: 0.5; cursor: not-allowed`，使用 `:disabled` 伪类阻止 hover 样式
    - 搜索输入框：focus 时 `border-color: --color-primary` + `box-shadow: --shadow-focus`，过渡 `--duration-normal`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 6.2 为禁用按钮状态编写属性测试
    - **Property 4: 禁用按钮状态不变性**
    - **Validates: Requirements 5.3**
    - 对所有 disabled 按钮验证 `opacity===0.5`、`cursor===not-allowed`，模拟 hover 事件后样式不变

  - [ ]* 6.3 为焦点环可见性编写属性测试
    - **Property 5: 交互元素焦点环可见性**
    - **Validates: Requirements 5.6, 7.8, 11.1**
    - 对所有可交互元素（button、input、select）模拟 focus 事件，验证 `box-shadow` 包含 `--shadow-focus` 值


- [x] 7. 改造数据卡片组件（UserCardEditable & PostCard）
  - [x] 7.1 修改 `src/components/UserCardEditable.tsx`：替换 emoji 为 SVG 图标，更新 CSS 类名，添加头像占位符
    - 头部：32px 圆形头像占位（用户名首字母，`--color-primary-light` 背景）+ 用户名（`--font-semibold`）+ ID 徽章（`--font-mono`，`--color-accent-light` 背景）
    - 信息行：用 `IconUser`、`IconMail`、`IconMapPin`、`IconBuilding`（14px）替换对应 emoji
    - 编辑按钮：`aria-label="编辑用户"`，`IconPencil`（16px），`--color-primary-light` 背景
    - 删除按钮：`aria-label="删除用户"`，`IconTrash`（16px），`--color-danger-light` 背景
    - 保持 props 接口向后兼容
    - _Requirements: 6.1, 6.2, 6.3, 11.2, 12.3_

  - [x] 7.2 在 `App.css` 中添加 `.user-card` 样式：hover 动效使用 `transform: translateY(-2px)` + `--shadow-lg`，过渡 `--duration-normal` + `--ease-spring`
    - _Requirements: 6.4, 6.8_

  - [x] 7.3 修改 `src/components/PostCard.tsx`：替换 emoji 为 SVG 图标，更新 CSS 类名
    - 头部：帖子 ID 徽章（`--font-mono`，`--color-primary-light` 背景）+ 用户关联徽章（`--color-accent-light` 背景）
    - 编辑/删除按钮添加 `aria-label`，使用对应 SVG 图标
    - 保持 props 接口向后兼容
    - _Requirements: 6.5, 6.6, 11.2, 12.4_

  - [x] 7.4 在 `App.css` 中添加 `.post-card` 样式：与 UserCard 相同的 hover 动效规范
    - _Requirements: 6.7, 6.8_

  - [ ]* 7.5 为卡片 hover 动效隔离性编写属性测试
    - **Property 6: 卡片 hover 动效隔离性**
    - **Validates: Requirements 6.4, 6.7, 6.8**
    - 渲染卡片网格，对任意一张卡片触发 hover，用 `getBoundingClientRect()` 验证相邻卡片位置不变


- [x] 8. 改造 EditModal 组件
  - [x] 8.1 修改 `src/components/EditModal.tsx`：添加出现动效，替换 emoji 为 SVG 图标，更新按钮和表单样式
    - 在 `App.css` 中添加 `@keyframes fadeIn` 和 `@keyframes scaleIn`，应用于 `.modal-overlay` 和 `.modal-content`
    - 动效参数：`--duration-slow`，`--ease-out`
    - Modal header：用 SVG 图标替换 emoji，关闭按钮使用 `IconX`（`aria-label="关闭"`），hover 时背景变为 `--color-danger-light`
    - 保存按钮：`--color-primary`；取消按钮：`--color-surface` + `--color-border` 边框
    - 所有表单输入框添加 focus 焦点环（`--shadow-focus`）
    - 保持 props 接口向后兼容
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 11.4, 12.5_

  - [ ]* 8.2 为 EditModal 编写单元测试
    - 验证点击遮罩层触发关闭回调
    - 验证打开时 `.modal-overlay` 和 `.modal-content` 存在动效 class
    - _Requirements: 7.3, 7.4_

- [x] 9. 改造 ApiPlayground 组件
  - [x] 9.1 修改 `src/components/ApiPlayground.tsx`：移除所有 inline style，改用 CSS 类名
    - 将所有 `style={{ ... }}` 替换为对应 CSS 类（`.playground-sidebar`、`.endpoint-category-label`、`.endpoint-btn`、`.request-editor`、`.url-input-field`、`.send-btn`、`.response-panel`、`.api-playground` 等）
    - 在 `App.css` 中添加对应 CSS 类，使用 `--code-*` 变量统一深色主题
    - HTTP Method 颜色类：`.method-get`（`--code-green`）、`.method-post`（`--code-blue`）、`.method-put`（`--code-orange`）、`.method-delete`（`--code-red`）
    - 发送按钮使用 `--color-primary`
    - 整体容器：`--radius-lg` 圆角 + `--shadow-lg` 阴影
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 9.2 为 ApiPlayground 编写单元测试
    - 验证组件渲染后不存在任何 `style` 属性（inline style 已全部移除）
    - _Requirements: 10.1_


- [x] 10. 集成收尾与全局样式完善
  - [x] 10.1 在 `App.css` 中添加全局 Alert 样式（`.alert`、`.alert-error`、`.alert-success`）和 DataDisplay 面板样式（左侧彩色竖条、数据计数徽章）
    - Alert 样式：`--color-danger-light`/`--color-success-light` 背景，对应 border 和文字色
    - DataDisplay panel header：移除紫色渐变，外部数据面板左侧橙色竖条，数据库面板左侧蓝色竖条
    - 数据计数徽章：`--font-mono`，`--color-primary-light` 背景
    - _Requirements: 1.1, 2.1_

  - [x] 10.2 验证 `App.tsx` 中 DataDisplay 区域集成 SkeletonCard：当 `isLoading===true && data.length===0` 时渲染 3 个 `<SkeletonCard />`
    - _Requirements: 8.1, 8.2, 8.5_

  - [ ]* 10.3 为 Content Area 无水平溢出编写属性测试
    - **Property 9: Content Area 无水平溢出**
    - **Validates: Requirements 1.2, 1.8**
    - 对视口宽度 320px、768px、1024px、1440px 分别渲染，验证 `.content-area` 的 `scrollWidth <= clientWidth`

- [x] 11. Final Checkpoint — 确认所有测试通过
  - 确保所有测试通过，视觉改造完整覆盖所有 11 个文件变更，业务逻辑（状态管理、API 调用）保持不变。如有问题请向用户确认。


## Notes

- 标有 `*` 的子任务为可选测试任务，可跳过以加快 MVP 进度
- 每个任务均引用具体需求条款，确保可追溯性
- 实现顺序严格遵循依赖关系：CSS 变量 → 图标 → 布局组件 → App 结构 → 各业务组件 → 集成
- 属性测试覆盖 9 个正确性属性（Property 1–9），均在对应实现任务附近放置
- 改造全程保持 `App.tsx` 业务逻辑不变（Requirements 12.1–12.5）
- 字体加载失败时自动降级到 fallback 字体链，不影响功能（Requirements 2.4, 2.5）
