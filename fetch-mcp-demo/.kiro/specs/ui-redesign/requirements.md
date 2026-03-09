# Requirements Document

## Introduction

本需求文档基于已批准的 UI 改造设计文档（design.md），为 MCP 全栈数据流演示项目的前端 UI 升级定义正式需求。改造目标是将现有"学生作业风格"界面升级为对标 Postman / VS Code 的 Developer Dashboard 专业风格，核心变化包括：引入左侧 Sidebar 导航布局、建立完整 CSS 变量设计系统、替换所有 emoji 为 SVG 图标、新增骨架屏 loading 状态，以及实现三档响应式断点。改造过程中保持所有业务逻辑不变，仅修改视觉层。

---

## Glossary

- **App_Shell**: 全局布局容器组件（`.app-shell`），包含 Sidebar 和 Content_Area
- **Sidebar**: 左侧固定导航栏组件（`Sidebar.tsx`），宽度 240px，深色主题
- **TopBar**: 顶部状态栏组件（`TopBar.tsx`），显示页面标题和 loading 状态
- **Content_Area**: Sidebar 右侧的主内容区域（`.content-area`）
- **ActionPanel**: 操作面板组件，包含数据操作按钮和搜索区
- **DataDisplay**: 数据展示区，包含外部数据预览面板和数据库数据面板
- **UserCard**: 用户信息卡片组件（`UserCardEditable.tsx`）
- **PostCard**: 帖子信息卡片组件（`PostCard.tsx`）
- **EditModal**: 编辑弹窗组件（`EditModal.tsx`）
- **SkeletonCard**: 骨架屏加载占位组件（`SkeletonCard.tsx`）
- **ApiPlayground**: API 练习场组件（`ApiPlayground.tsx`）
- **Design_System**: CSS 变量体系，定义色彩、字体、间距、圆角、阴影、动效规范
- **Nav_Item**: Sidebar 中的导航项，对应用户管理、帖子管理、API 练习场三个模块
- **activeSource**: App 状态变量，值为 `'users' | 'posts' | 'playground'`，控制当前显示的页面
- **Icon_Component**: `icons.tsx` 中封装的 SVG 图标 React 组件

---

## Requirements

### Requirement 1: 全局布局架构改造

**User Story:** 作为开发者，我希望看到左侧 Sidebar + 右侧内容区的 Dashboard 布局，以便获得专业的开发工具视觉体验。

#### Acceptance Criteria

1. THE App_Shell SHALL 渲染为 `flex-direction: row` 的水平布局，包含 Sidebar 和 Content_Area 两个直接子区域
2. THE Sidebar SHALL 固定宽度为 240px，在 Desktop 视口（≥ 1024px）下始终可见且不随页面内容滚动
3. THE Content_Area SHALL 占据 Sidebar 右侧的剩余空间（`flex: 1`），内部垂直排列 TopBar 和页面内容
4. WHEN 视口宽度在 768px 至 1023px 之间（Tablet 断点），THE Sidebar SHALL 折叠为 64px 宽度的图标模式，隐藏文字标签
5. WHEN 视口宽度小于 768px（Mobile 断点），THE Sidebar SHALL 完全隐藏，不占用页面空间
6. WHEN 用户在移动端点击 TopBar 中的汉堡菜单按钮，THE Sidebar SHALL 以 overlay 方式从左侧滑入展开
7. WHEN 移动端 Sidebar 展开时用户点击背景遮罩，THE Sidebar SHALL 收起并隐藏遮罩
8. IF 视口宽度小于 320px，THEN THE App_Shell SHALL 保持 `min-width: 320px`，防止布局崩溃


### Requirement 2: Design System（CSS 变量体系）

**User Story:** 作为前端开发者，我希望所有视觉样式通过统一的 CSS 变量体系管理，以便保证视觉一致性并简化后续维护。

#### Acceptance Criteria

1. THE Design_System SHALL 在 `:root` 中定义完整的 CSS 变量集合，覆盖色彩（`--color-*`）、字体（`--font-*`、`--text-*`）、间距（`--space-*`）、圆角（`--radius-*`）、阴影（`--shadow-*`）、动效（`--duration-*`、`--ease-*`）、Sidebar 专用（`--sidebar-*`）和代码区专用（`--code-*`）八个类别
2. THE Design_System SHALL 为按钮操作定义语义色映射：获取外部数据使用 `--color-success`（绿色），保存到数据库使用 `--color-warning`（橙色），查询全部使用 `--color-primary`（蓝色），新增使用 `--color-accent`（紫色），删除使用 `--color-danger`（红色）
3. THE Design_System SHALL 引入 Inter 字体用于所有 UI 文字，引入 JetBrains Mono 字体用于 ID 徽章、状态码、API URL 和代码区内容
4. THE Design_System SHALL 为字体加载提供完整 fallback 链：Inter 降级为 `system-ui, -apple-system, sans-serif`，JetBrains Mono 降级为 `'Fira Code', 'Cascadia Code', monospace`
5. WHEN 字体资源加载失败，THE App_Shell SHALL 使用 fallback 字体正常渲染，UI 功能不受影响


### Requirement 3: Sidebar 导航组件

**User Story:** 作为用户，我希望通过左侧导航栏在用户管理、帖子管理和 API 练习场之间切换，以便快速定位到目标功能模块。

#### Acceptance Criteria

1. THE Sidebar SHALL 在顶部显示品牌区域，包含项目名称 "MCP Demo" 和副标题 "全栈数据流"，使用 `--font-mono` 字体
2. THE Sidebar SHALL 渲染三个 Nav_Item：用户管理（`users` 图标）、帖子管理（`file-text` 图标）、API 练习场（`terminal` 图标），图标均为 SVG 组件
3. WHEN 用户点击某个 Nav_Item，THE Sidebar SHALL 调用 `onNavigate` 回调并传入对应的 `activeSource` 值
4. WHILE 某个 Nav_Item 处于 active 状态，THE Sidebar SHALL 同时显示左侧 3px 蓝色竖条和 `--sidebar-item-active-bg` 背景高亮，不能仅靠颜色区分
5. WHEN 用户悬停在 Nav_Item 上，THE Sidebar SHALL 在 `--duration-fast` 时间内将背景色过渡为 `--sidebar-item-hover`
6. THE Sidebar SHALL 在底部显示后端地址信息，使用 `--sidebar-text` 颜色的较小字号文字
7. WHEN Tablet 模式下 Sidebar 折叠为 64px，THE Sidebar SHALL 隐藏所有文字标签（`.nav-label`、`.brand-subtitle`、`.sidebar-footer-text`），仅显示图标


### Requirement 4: TopBar 顶部状态栏

**User Story:** 作为用户，我希望在内容区顶部看到当前页面标题和全局加载状态，以便了解当前所在位置和系统响应情况。

#### Acceptance Criteria

1. THE TopBar SHALL 固定在 Content_Area 顶部（`position: sticky; top: 0`），高度 56px，背景为 `--color-surface`，底部有 1px `--color-border` 分割线
2. THE TopBar SHALL 在左侧显示与当前 `activeSource` 对应的页面标题：`users` → "用户管理"，`posts` → "帖子管理"，`playground` → "API 练习场"
3. WHEN `loading` prop 为 `true`，THE TopBar SHALL 在右侧显示旋转 loading spinner
4. WHEN `loading` prop 为 `false`，THE TopBar SHALL 隐藏 loading spinner
5. WHEN `error` prop 不为空，THE TopBar SHALL 在右侧显示错误提示 badge
6. WHEN 视口宽度小于 768px，THE TopBar SHALL 在左侧显示汉堡菜单按钮（`hamburger-btn`）


### Requirement 5: ActionPanel 操作面板改造

**User Story:** 作为用户，我希望操作面板的按钮颜色能直观反映操作语义，以便快速识别每个按钮的作用和风险级别。

#### Acceptance Criteria

1. THE ActionPanel SHALL 移除 panel-header 的紫色渐变背景，改为白色背景加底部 `--color-border` 分割线
2. THE ActionPanel SHALL 为每个操作按钮应用对应的语义色：获取外部数据按钮使用 `--color-success`，保存到数据库按钮使用 `--color-warning`，查询全部按钮使用 `--color-primary`，新增按钮使用 `--color-accent`
3. WHEN 按钮处于 `disabled` 状态，THE ActionPanel SHALL 将按钮 `opacity` 设为 0.5，`cursor` 设为 `not-allowed`，且不触发 hover 样式变化
4. WHEN 用户悬停在启用状态的按钮上，THE ActionPanel SHALL 在 `--duration-fast` 时间内将按钮背景色过渡为对应的 hover 色
5. WHEN 用户按下按钮，THE ActionPanel SHALL 应用 `transform: scale(0.97)` 的按下反馈效果
6. THE ActionPanel SHALL 为搜索输入框应用统一样式：默认 `border: 1px solid --color-border`，focus 时 `border-color` 变为 `--color-primary` 并显示 `--shadow-focus` 焦点环
7. WHEN 搜索输入框获得焦点，THE ActionPanel SHALL 在 `--duration-normal` 时间内完成边框颜色和焦点环的过渡动效


### Requirement 6: 数据卡片组件改造（UserCard & PostCard）

**User Story:** 作为用户，我希望用户卡片和帖子卡片具有专业的视觉设计和流畅的交互动效，以便在浏览数据时获得良好的视觉体验。

#### Acceptance Criteria

1. THE UserCard SHALL 在卡片头部显示用户名首字母的圆形头像占位符（32px，`--color-primary-light` 背景），用户名（`--font-semibold`），以及使用 `--font-mono` 的 ID 徽章
2. THE UserCard SHALL 将所有 emoji 图标（👤📧📍🏢✏️🗑️）替换为对应的 SVG Icon_Component
3. THE UserCard SHALL 为编辑按钮应用 `--color-primary-light` 背景，为删除按钮应用 `--color-danger-light` 背景
4. WHEN 用户悬停在 UserCard 上，THE UserCard SHALL 在 `--duration-normal` 时间内应用 `transform: translateY(-2px)` 和增强的 `--shadow-lg` 阴影，使用 `--ease-spring` 缓动
5. THE PostCard SHALL 在卡片头部显示使用 `--font-mono` 的帖子 ID 徽章（`--color-primary-light` 背景）和用户关联徽章（`--color-accent-light` 背景）
6. THE PostCard SHALL 将所有 emoji 图标替换为对应的 SVG Icon_Component
7. WHEN 用户悬停在 PostCard 上，THE PostCard SHALL 应用与 UserCard 相同的 hover 动效规范
8. THE UserCard 和 THE PostCard 的 hover 动效 SHALL 使用 `transform` 属性实现位移，不得修改 `margin` 或 `padding`，以避免影响相邻卡片位置


### Requirement 7: EditModal 编辑弹窗改造

**User Story:** 作为用户，我希望编辑弹窗具有流畅的出现动效和清晰的表单样式，以便在编辑数据时获得专业的交互体验。

#### Acceptance Criteria

1. WHEN EditModal 打开，THE EditModal SHALL 以 `opacity: 0 → 1` 淡入动效（`--duration-slow`，`--ease-out`）显示背景遮罩
2. WHEN EditModal 打开，THE EditModal SHALL 同时以 `opacity: 0 → 1` 加 `transform: scale(0.95 → 1)` 的动效显示弹窗内容
3. THE EditModal SHALL 始终渲染背景遮罩层，遮罩覆盖整个视口
4. WHEN 用户点击背景遮罩，THE EditModal SHALL 关闭弹窗
5. THE EditModal SHALL 将 Modal Header 中的 emoji 替换为 SVG Icon_Component，关闭按钮使用 SVG `x` 图标
6. WHEN 用户悬停在关闭按钮上，THE EditModal SHALL 将关闭按钮背景色变为 `--color-danger-light`
7. THE EditModal SHALL 为保存按钮应用 `--color-primary`（蓝色），为取消按钮应用 `--color-surface` 背景加 `--color-border` 边框
8. THE EditModal SHALL 为所有表单输入框应用统一焦点环样式（`--shadow-focus`）


### Requirement 8: SkeletonCard 骨架屏组件

**User Story:** 作为用户，我希望在数据加载过程中看到骨架屏占位，以便感知系统正在响应而不是卡死。

#### Acceptance Criteria

1. WHEN `loading` 为 `true` 且对应数据数组为空，THE DataDisplay SHALL 渲染 3 个 SkeletonCard 替代空状态
2. WHEN `loading` 变为 `false` 或数据数组非空，THE DataDisplay SHALL 立即用真实数据卡片替换 SkeletonCard
3. THE SkeletonCard SHALL 持续播放 shimmer 动画（1.5s 循环，`background-position` 从 -200% 到 200%）
4. THE SkeletonCard SHALL 模拟 UserCard 的结构，包含头像占位块（32px 圆形）、姓名占位块（120px × 16px）、ID 徽章占位块（48px × 16px）和三行内容占位块
5. IF `loading` 为 `true` 但数据数组非空，THEN THE DataDisplay SHALL 显示真实数据卡片而非骨架屏


### Requirement 9: SVG 图标系统（icons.tsx）

**User Story:** 作为开发者，我希望所有 UI 图标统一通过 SVG 组件提供，以便替换所有 emoji 并保持图标风格一致。

#### Acceptance Criteria

1. THE Icon_Component 集合 SHALL 包含以下图标：`IconUsers`、`IconFileText`、`IconTerminal`、`IconUser`、`IconMail`、`IconMapPin`、`IconBuilding`、`IconPencil`、`IconTrash`、`IconX`、`IconSearch`、`IconPlus`、`IconDatabase`、`IconDownload`、`IconSave`、`IconRefreshCw`
2. THE Icon_Component SHALL 接受 `size`（默认 16）和 `className` 两个 props，并将 `size` 应用于 SVG 的 `width` 和 `height` 属性
3. THE Icon_Component SHALL 使用 `stroke="currentColor"` 使图标颜色继承父元素的 `color` 属性
4. WHEN Icon_Component 渲染失败，THE App_Shell SHALL 通过 ErrorBoundary 降级显示文字标签，不影响其他 UI 功能
5. THE Icon_Component 在 Sidebar Nav 中 SHALL 使用 20px 尺寸，在按钮内 SHALL 使用 16px 尺寸，在卡片信息行中 SHALL 使用 14px 尺寸，在 TopBar 中 SHALL 使用 18px 尺寸


### Requirement 10: ApiPlayground 样式改造

**User Story:** 作为开发者，我希望 API 练习场的视觉风格与整体 Dashboard 主题融合，以便获得统一的视觉体验。

#### Acceptance Criteria

1. THE ApiPlayground SHALL 移除所有 inline style，改用 CSS 类名引用 CSS 变量
2. THE ApiPlayground SHALL 使用 `--code-bg`、`--code-surface`、`--code-border`、`--code-text` 等代码区专用 CSS 变量统一深色主题
3. THE ApiPlayground SHALL 为 HTTP Method 标签应用语义色：GET 使用 `--code-green`，POST 使用 `--code-blue`，PUT 使用 `--code-orange`，DELETE 使用 `--code-red`
4. THE ApiPlayground SHALL 为 URL 输入框和响应区使用 `--font-mono` 字体
5. THE ApiPlayground SHALL 为发送请求按钮应用 `--color-primary`（蓝色），与全局按钮规范保持一致
6. THE ApiPlayground SHALL 使用 `--radius-lg` 圆角和 `--shadow-lg` 阴影与主内容区视觉区分，但不产生割裂感


### Requirement 11: 可访问性规范

**User Story:** 作为使用辅助技术的用户，我希望所有交互元素都有清晰的焦点状态和语义标签，以便通过键盘和屏幕阅读器正常使用应用。

#### Acceptance Criteria

1. THE App_Shell SHALL 确保所有交互元素（按钮、链接、输入框、select）在获得键盘焦点时显示可见的焦点环（`--shadow-focus`）
2. THE Icon_Component 在用作独立操作按钮时（如编辑、删除、关闭），其父按钮元素 SHALL 包含 `aria-label` 属性描述操作语义（如 `aria-label="编辑用户"`）
3. THE Sidebar SHALL 为当前 active 的 Nav_Item 设置 `aria-current="page"` 属性
4. THE EditModal SHALL 在打开时将焦点移至弹窗内第一个可交互元素，关闭时将焦点返回触发元素


### Requirement 12: 业务逻辑不变性

**User Story:** 作为开发者，我希望 UI 改造不影响任何现有业务逻辑和 API 调用，以便在视觉升级的同时保证功能稳定性。

#### Acceptance Criteria

1. THE App_Shell SHALL 保持 `App.tsx` 中所有状态变量（`activeSource`、`isLoading`、`error`、`externalUsers`、`dbUsers` 等）和事件处理函数不变
2. THE App_Shell SHALL 保持 `services/api.ts` 中所有 API 调用函数的签名和行为不变
3. THE UserCard SHALL 保持 `UserCardEditable` 组件的 props 接口向后兼容，不新增必填 props
4. THE PostCard SHALL 保持 `PostCard` 组件的 props 接口向后兼容，不新增必填 props
5. THE EditModal SHALL 保持 `EditModal` 组件的 props 接口向后兼容，不新增必填 props


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 响应式布局断点一致性

*For any* 视口宽度，Sidebar 的可见性和宽度必须符合断点规范：≥ 1024px 时宽度为 240px 且可见，768px–1023px 时宽度为 64px 且可见，< 768px 时完全隐藏（不占用页面空间）

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: 导航状态与页面标题一致性

*For any* `activeSource` 值（`'users'`、`'posts'`、`'playground'`），Sidebar 中对应 Nav_Item 的 active 状态和 TopBar 显示的页面标题必须同时与该值保持一致

**Validates: Requirements 3.3, 3.4, 4.2**

### Property 3: 按钮语义色映射正确性

*For any* ActionPanel 中的操作按钮，其背景色 CSS 变量引用必须与操作语义对应：获取外部数据 → `--color-success`，保存到数据库 → `--color-warning`，查询全部 → `--color-primary`，新增 → `--color-accent`，删除 → `--color-danger`

**Validates: Requirements 2.2, 5.2**

### Property 4: 禁用按钮状态不变性

*For any* 处于 `disabled` 状态的按钮，其 `opacity` 必须为 0.5，`cursor` 必须为 `not-allowed`，且 hover 事件不得改变其视觉样式

**Validates: Requirements 5.3**

### Property 5: 交互元素焦点环可见性

*For any* 可交互元素（按钮、输入框、select、链接），当其获得键盘焦点时，必须显示基于 `--shadow-focus` 的可见焦点环

**Validates: Requirements 5.6, 7.8, 11.1**

### Property 6: 卡片 hover 动效隔离性

*For any* 卡片网格中的 UserCard 或 PostCard，当某张卡片触发 hover 动效时，相邻卡片的位置（`getBoundingClientRect()`）不得发生变化

**Validates: Requirements 6.4, 6.7, 6.8**

### Property 7: 骨架屏显示条件正确性

*For any* `loading` 和 `data` 的组合状态，DataDisplay 的渲染结果必须满足：仅当 `loading === true` 且 `data.length === 0` 时显示 SkeletonCard，其他所有情况显示真实数据卡片

**Validates: Requirements 8.1, 8.2, 8.5**

### Property 8: 图标按钮无障碍标签完整性

*For any* 仅包含 Icon_Component 的按钮元素（无可见文字标签），其 DOM 元素必须包含非空的 `aria-label` 属性

**Validates: Requirements 11.2**

### Property 9: Content Area 无水平溢出

*For any* 视口宽度（≥ 320px），Content_Area 的 `scrollWidth` 不得超过其 `clientWidth`，即不产生水平滚动条

**Validates: Requirements 1.2, 1.8**
