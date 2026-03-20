# 需求文档：全栈项目加固

## 简介

对现有三个项目（React 前端、Spring Boot 后端、VitePress 文档站）进行安全加固和健壮性优化。涵盖 JWT 白名单安全修复、前端错误边界、前后端输入校验、登录限流、API 超时处理、编译器警告修复、文档测试增强等方面。

## 术语表

- **JwtFilter**：后端 JWT 认证过滤器，位于 `JwtFilter.java`，负责拦截请求并校验 JWT token
- **白名单（Whitelist）**：JwtFilter 中定义的无需认证即可访问的 URL 列表
- **ErrorBoundary**：React 错误边界组件，用于捕获子组件树中的 JavaScript 错误并展示降级 UI
- **EditModal**：前端编辑弹窗组件，位于 `EditModal.tsx`，用于新增和编辑用户/帖子
- **authFetch**：前端封装的带认证头的 fetch 函数，位于 `api.ts`
- **DatabaseController**：后端用户 CRUD 控制器，位于 `DatabaseController.java`
- **PostController**：后端帖子 CRUD 控制器，位于 `PostController.java`
- **AuthController**：后端认证控制器，位于 `AuthController.java`，处理注册和登录
- **Bean_Validation**：Java Bean Validation 规范（JSR 380），通过注解（如 `@NotBlank`、`@Email`）声明式校验请求参数
- **UserService**：后端用户业务逻辑服务类，位于 `UserService.java`
- **VitePress_文档站**：基于 VitePress 构建的知识库文档站，位于 `docs/` 目录

## 需求

### 需求 1：JWT 白名单安全修复

**用户故事：** 作为后端开发者，我希望 JwtFilter 的白名单只放行真正不需要认证的接口，以防止未授权用户执行写操作。

#### 验收标准

1. WHEN `/api/users/batch` 请求到达 JwtFilter 时，THE JwtFilter SHALL 要求请求携带有效的 JWT token
2. WHEN `/api/posts/batch` 请求到达 JwtFilter 时，THE JwtFilter SHALL 要求请求携带有效的 JWT token
3. THE JwtFilter SHALL 仅将 `/auth/register`、`/auth/login`、`/api/health` 保留在白名单中
4. WHEN 白名单中的路径使用精确匹配时，THE JwtFilter SHALL 使用 `equals` 方法进行路径比较，不使用 `startsWith` 前缀匹配
5. IF 未携带有效 JWT token 的请求访问非白名单接口，THEN THE JwtFilter SHALL 返回 HTTP 401 状态码和 JSON 格式的错误消息

### 需求 2：前端错误边界

**用户故事：** 作为前端用户，我希望当某个组件发生运行时错误时，页面不会变成白屏，而是展示友好的错误提示和恢复操作。

#### 验收标准

1. THE ErrorBoundary SHALL 捕获其子组件树中抛出的所有 JavaScript 运行时错误
2. WHEN ErrorBoundary 捕获到错误时，THE ErrorBoundary SHALL 展示包含错误描述和"重试"按钮的降级 UI
3. WHEN 用户点击"重试"按钮时，THE ErrorBoundary SHALL 清除错误状态并重新渲染子组件树
4. THE ErrorBoundary SHALL 包裹应用的主路由组件，确保登录页和主页面均受保护
5. THE ErrorBoundary 的降级 UI SHALL 使用中文文案，与现有界面风格保持一致

### 需求 3：前端输入校验

**用户故事：** 作为前端用户，我希望在编辑弹窗中提交表单前，系统能校验输入内容的格式和长度，避免提交无效数据。

#### 验收标准

1. WHEN 用户在 EditModal 中提交用户表单时，THE EditModal SHALL 校验姓名字段长度在 1 到 50 个字符之间
2. WHEN 用户在 EditModal 中提交用户表单时，THE EditModal SHALL 校验用户名字段长度在 1 到 30 个字符之间
3. WHEN 用户在 EditModal 中提交用户表单时，THE EditModal SHALL 校验邮箱字段符合标准邮箱格式
4. WHEN 用户在 EditModal 中提交用户表单时，THE EditModal SHALL 校验电话字段长度不超过 30 个字符
5. WHEN 用户在 EditModal 中提交帖子表单时，THE EditModal SHALL 校验标题字段长度在 1 到 200 个字符之间
6. WHEN 用户在 EditModal 中提交帖子表单时，THE EditModal SHALL 校验内容字段长度在 1 到 2000 个字符之间
7. WHEN 校验失败时，THE EditModal SHALL 在对应字段下方显示红色的中文错误提示信息
8. WHILE 存在校验错误时，THE EditModal SHALL 禁用保存按钮，阻止表单提交


### 需求 4：后端输入校验

**用户故事：** 作为后端开发者，我希望所有 Controller 的写操作接口都使用 Bean Validation 校验请求体，以防止无效数据写入数据库。

#### 验收标准

1. THE User 实体 SHALL 在 name 字段上添加 `@NotBlank` 和 `@Size(max=100)` 校验注解
2. THE User 实体 SHALL 在 email 字段上添加 `@Email` 校验注解
3. THE Post 实体 SHALL 在 title 字段上添加 `@NotBlank` 校验注解
4. THE Post 实体 SHALL 在 body 字段上添加 `@NotBlank` 和 `@Size(max=2000)` 校验注解
5. WHEN DatabaseController 接收创建或更新用户请求时，THE DatabaseController SHALL 使用 `@Valid` 注解触发 Bean Validation 校验
6. WHEN PostController 接收创建或更新帖子请求时，THE PostController SHALL 使用 `@Valid` 注解触发 Bean Validation 校验
7. IF Bean Validation 校验失败，THEN THE 后端 SHALL 返回 HTTP 400 状态码和包含具体字段错误信息的 JSON 响应
8. THE 后端 SHALL 提供全局异常处理器（`@RestControllerAdvice`）统一处理 `MethodArgumentNotValidException`，返回 `ApiResponse` 格式的错误信息

### 需求 5：登录接口限流

**用户故事：** 作为后端开发者，我希望登录接口具备限流能力，以防止暴力破解攻击。

#### 验收标准

1. THE 后端 SHALL 对 `/auth/login` 接口实施基于 IP 地址的请求频率限制
2. WHILE 同一 IP 地址在 1 分钟内的登录请求次数超过 10 次时，THE AuthController SHALL 返回 HTTP 429 状态码和中文提示"请求过于频繁，请稍后再试"
3. THE 限流计数器 SHALL 在时间窗口过期后自动重置
4. THE 限流实现 SHALL 使用内存存储（如 `ConcurrentHashMap`），无需引入外部依赖

### 需求 6：前端 API 超时处理

**用户故事：** 作为前端用户，我希望当后端接口长时间无响应时，请求能自动超时并给出提示，而不是无限等待。

#### 验收标准

1. THE authFetch 函数 SHALL 为所有请求设置 15 秒的超时时间
2. THE authFetch 函数 SHALL 使用 `AbortController` 实现超时控制
3. WHEN 请求超过 15 秒未响应时，THE authFetch 函数 SHALL 中止请求并抛出包含"请求超时"描述的错误
4. IF 请求因超时被中止，THEN THE authFetch 函数 SHALL 确保 `AbortController` 资源被正确清理

### 需求 7：后端编译器警告修复

**用户故事：** 作为后端开发者，我希望消除 UserService.java 中的编译器警告，提升代码质量。

#### 验收标准

1. THE UserService SHALL 将 `extractUserId` 方法中的 `Long.parseLong(s)` 替换为 `Long.valueOf(s)` 以消除不必要的临时对象警告
2. THE UserService SHALL 在 `convertFromMap` 方法中使用 switch 模式匹配替代 `instanceof` 链式判断
3. THE UserService SHALL 消除所有 null 安全相关的编译器警告

### 需求 8：文档站测试增强

**用户故事：** 作为文档维护者，我希望测试能验证文档内部的 Markdown 链接是否有效，以避免死链接。

#### 验收标准

1. THE VitePress_文档站测试 SHALL 扫描所有 Markdown 文件中的内部链接（`[text](/path)` 格式）
2. WHEN 发现内部链接指向的目标文件不存在时，THE VitePress_文档站测试 SHALL 报告该链接为失败测试用例
3. THE VitePress_文档站测试 SHALL 忽略外部链接（以 `http://` 或 `https://` 开头的链接）
4. THE VitePress_文档站测试 SHALL 支持检测带锚点的链接（如 `/path#section`），验证目标文件存在即可
