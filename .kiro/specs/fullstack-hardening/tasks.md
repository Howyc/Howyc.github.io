# 实施计划：全栈项目加固

## 概述

按优先级逐步实施 8 个加固需求，从安全修复开始，到前端健壮性，最后是代码质量。每个任务独立且增量构建，确保每一步都可验证。

## 任务

- [x] 1. JWT 白名单安全修复
  - [x] 1.1 修复 JwtFilter 白名单配置和匹配逻辑
    - 修改 `java-backend/src/main/java/com/example/fetchdemo/filter/JwtFilter.java`
    - 将 `WHITELIST` 缩减为 `["/auth/register", "/auth/login", "/api/health"]`，移除 `/api/posts/` 和 `/api/users/batch`
    - 将 `isWhitelisted` 方法改为纯 `equals` 精确匹配，移除 `startsWith` 逻辑
    - _需求：1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.2 编写 JwtFilter 白名单属性测试
    - 新建 `java-backend/src/test/java/com/example/fetchdemo/filter/JwtFilterTest.java`
    - 添加 jqwik 依赖到 `pom.xml`（test scope）
    - **属性 1：非白名单路径需要 JWT 认证**
    - **属性 2：白名单精确匹配不允许前缀扩展**
    - **验证需求：1.1, 1.2, 1.4, 1.5**

- [x] 2. 后端 Bean Validation 输入校验
  - [x] 2.1 为 User 和 Post 实体添加校验注解
    - 修改 `java-backend/src/main/java/com/example/fetchdemo/entity/User.java`
    - User.name 添加 `@NotBlank @Size(max=100)`，User.email 添加 `@Email`
    - 修改 `java-backend/src/main/java/com/example/fetchdemo/entity/Post.java`
    - Post.title 添加 `@NotBlank`，Post.body 添加 `@NotBlank @Size(max=2000)`
    - _需求：4.1, 4.2, 4.3, 4.4_

  - [x] 2.2 在 Controller 写操作方法中添加 @Valid 注解
    - 修改 `DatabaseController.java` 的 `createUser` 和 `updateUser` 方法，在 `@RequestBody` 参数前添加 `@Valid`
    - 修改 `PostController.java` 的 `create` 和 `update` 方法，在 `@RequestBody` 参数前添加 `@Valid`
    - _需求：4.5, 4.6_

  - [x] 2.3 创建全局异常处理器 GlobalExceptionHandler
    - 新建 `java-backend/src/main/java/com/example/fetchdemo/common/GlobalExceptionHandler.java`
    - 使用 `@RestControllerAdvice` 捕获 `MethodArgumentNotValidException`
    - 提取 `FieldError` 列表，返回 HTTP 400 + `ApiResponse` 格式的字段错误信息
    - _需求：4.7, 4.8_

  - [ ]* 2.4 编写 Bean Validation 属性测试
    - 新建 `java-backend/src/test/java/com/example/fetchdemo/entity/ValidationTest.java`
    - **属性 7：Bean Validation 拒绝无效实体字段**
    - **验证需求：4.1, 4.2, 4.3, 4.4, 4.7**

- [x] 3. 登录接口限流
  - [x] 3.1 在 AuthController 中实现基于 IP 的登录限流
    - 修改 `java-backend/src/main/java/com/example/fetchdemo/controller/AuthController.java`
    - 使用 `ConcurrentHashMap<String, List<Long>>` 记录每个 IP 的请求时间戳
    - 实现 `isRateLimited` 方法：1 分钟窗口内最多 10 次请求
    - 在 `login` 方法开头检查限流，超限返回 HTTP 429 + 中文提示
    - 旧记录在每次检查时惰性清理
    - _需求：5.1, 5.2, 5.3, 5.4_

  - [ ]* 3.2 编写登录限流属性测试
    - 新建 `java-backend/src/test/java/com/example/fetchdemo/controller/RateLimiterTest.java`
    - **属性 8：登录限流在阈值内放行、超阈值拒绝**
    - **属性 9：限流时间窗口过期后计数器重置**
    - **验证需求：5.1, 5.2, 5.3**

- [x] 4. 检查点 - 后端任务验证
  - 确保所有后端测试通过，ask the user if questions arise。

- [x] 5. 前端 ErrorBoundary 组件
  - [x] 5.1 创建 ErrorBoundary class 组件
    - 新建 `fetch-mcp-demo/src/components/ErrorBoundary.tsx`
    - 使用 React class 组件实现 `static getDerivedStateFromError` 和 `componentDidCatch`
    - 降级 UI 显示中文错误描述和"重试"按钮
    - 重试按钮调用 `setState({ hasError: false, error: null })` 清除错误状态
    - _需求：2.1, 2.2, 2.3, 2.5_

  - [x] 5.2 在 App.tsx 中集成 ErrorBoundary
    - 修改 `fetch-mcp-demo/src/App.tsx`
    - 在 `<Routes>` 外层包裹 `<ErrorBoundary>`，确保登录页和主页面均受保护
    - _需求：2.4_

  - [ ]* 5.3 编写 ErrorBoundary 属性测试
    - 安装 `vitest`、`@testing-library/react`、`@testing-library/jest-dom`、`fast-check` 到 `fetch-mcp-demo/` 的 devDependencies
    - 配置 vitest（在 `vite.config.ts` 或新建 `vitest.config.ts` 中添加 test 配置）
    - 新建 `fetch-mcp-demo/src/__tests__/ErrorBoundary.test.tsx`
    - **属性 3：ErrorBoundary 捕获错误并展示降级 UI**
    - **验证需求：2.1, 2.2**

- [x] 6. 前端 EditModal 输入校验
  - [x] 6.1 实现校验函数并集成到 EditModal
    - 修改 `fetch-mcp-demo/src/components/EditModal.tsx`
    - 新增纯函数 `validateUser` 和 `validatePost`，返回 `ValidationErrors` 对象
    - 校验规则：name 1-50 字符、username 1-30 字符、email 邮箱格式、phone ≤30 字符、title 1-200 字符、body 1-2000 字符
    - 在 `handleSubmit` 中调用校验函数，校验失败时在字段下方显示红色中文错误提示
    - 存在错误时禁用保存按钮
    - _需求：3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 6.2 编写前端校验函数属性测试
    - 新建 `fetch-mcp-demo/src/__tests__/validation.test.ts`
    - **属性 4：字符串长度校验函数正确性**
    - **属性 5：邮箱格式校验正确性**
    - **属性 6：存在校验错误时阻止表单提交**
    - **验证需求：3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8**

- [x] 7. 前端 API 超时处理
  - [x] 7.1 为 authFetch 添加 AbortController 超时控制
    - 修改 `fetch-mcp-demo/src/services/api.ts`
    - 在 `authFetch` 函数中创建 `AbortController`，设置 15 秒超时
    - 捕获 `AbortError` 并抛出包含"请求超时"描述的 Error
    - 在 `finally` 中清理 `setTimeout`，避免内存泄漏
    - _需求：6.1, 6.2, 6.3, 6.4_

  - [ ]* 7.2 编写 API 超时属性测试
    - 新建 `fetch-mcp-demo/src/__tests__/api-timeout.test.ts`
    - **属性 10：API 请求超时抛出包含"请求超时"的错误**
    - **验证需求：6.1, 6.3**

- [x] 8. 检查点 - 前端任务验证
  - 确保所有前端测试通过，ask the user if questions arise。

- [x] 9. 后端编译器警告修复
  - [x] 9.1 修复 UserService 中的编译器警告
    - 修改 `java-backend/src/main/java/com/example/fetchdemo/service/UserService.java`
    - `extractUserId` 中 `Long.parseLong(s)` → `Long.valueOf(s)`
    - `convertFromMap` 中 `instanceof` 链 → `switch` 模式匹配（Java 17+）
    - 添加必要的 null 检查或 `@SuppressWarnings` 消除 null 安全警告
    - _需求：7.1, 7.2, 7.3_

- [x] 10. 文档站测试增强
  - [x] 10.1 新增内部链接校验测试用例
    - 修改 `docs/__tests__/knowledge-base.test.ts`
    - 新增测试：扫描所有 `.md` 文件中的内部链接 `[text](/path)`
    - 忽略 `http://` 和 `https://` 开头的外部链接
    - 带锚点的链接去除 `#section` 后验证目标文件存在
    - 解析路径时补 `.md` 后缀或 `index.md`
    - _需求：8.1, 8.2, 8.3, 8.4_

  - [ ]* 10.2 编写链接提取函数属性测试
    - 新建 `docs/__tests__/link-extraction.test.ts`
    - **属性 11：内部链接提取与外部链接过滤**
    - **验证需求：8.1, 8.3, 8.4**

- [x] 11. 最终检查点 - 全部验证
  - 确保所有项目的测试通过，ask the user if questions arise。

## 备注

- 标记 `*` 的子任务为可选测试任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号，确保可追溯性
- 属性测试验证设计文档中定义的 11 个正确性属性
- 后端测试使用 JUnit 5 + jqwik，前端/文档测试使用 Vitest + fast-check
- 检查点任务确保增量验证，及时发现问题
