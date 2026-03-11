# 实现计划：JWT 身份认证

## 概述

按后端基础设施 → 后端业务逻辑 → 前端状态管理 → 前端 UI 的顺序逐步实现，每个步骤都在前一步骤的基础上构建，最终通过属性测试验证正确性。

## 任务

- [x] 1. 后端依赖配置
  - [x] 1.1 在 `pom.xml` 中添加 jjwt 三件套依赖（`jjwt-api` 0.12.6、`jjwt-impl` runtime、`jjwt-jackson` runtime）
    - _需求：2.5_
  - [x] 1.2 在 `pom.xml` 中添加 `spring-security-crypto` 依赖（版本由 spring-boot-starter-parent 管理）
    - _需求：1.4_
  - [x] 1.3 在 `pom.xml` 中添加 JQwik 测试依赖（`net.jqwik:jqwik` 1.8.4，scope=test）
    - _需求：测试策略_

- [x] 2. 后端 AppUser 实体与 Repository
  - [x] 2.1 创建 `entity/AppUser.java`
    - 添加 `@Entity @Table(name = "app_users")` 注解
    - 字段：`id`（自增主键）、`username`（`@Column(unique=true, nullable=false)`）、`passwordHash`（`@Column(name="password_hash", nullable=false)`）、`createdAt`（`@PrePersist` 自动填充）
    - _需求：4.1, 4.2_
  - [x] 2.2 创建 `repository/AppUserRepository.java`
    - 继承 `JpaRepository<AppUser, Long>`
    - 声明 `Optional<AppUser> findByUsername(String username)` 方法
    - _需求：4.1_

- [x] 3. 后端 JwtUtil 工具类
  - [x] 3.1 创建 `util/JwtUtil.java`
    - 注入 `@Value("${jwt.secret}")` 密钥字段
    - 实现 `generateToken(String username)`：sub=username，有效期 86400 秒，使用 HMAC-SHA256 签名
    - 实现 `extractUsername(String token)`：验证签名并返回 sub，抛出 `ExpiredJwtException` 或 `JwtException`
    - _需求：2.2, 2.5_
  - [ ]* 3.2 为 JwtUtil 编写单元测试（`JwtUtilTest.java`）
    - 测试生成的 token 可被正确解析，sub 等于传入用户名
    - 测试过期 token 抛出 `ExpiredJwtException`
    - _需求：2.2_

- [x] 4. 后端 AuthService
  - [x] 4.1 创建 `service/AuthService.java`
    - 注入 `AppUserRepository` 和 `JwtUtil`，使用 `BCryptPasswordEncoder`（强度 10）
    - 实现 `register(username, password)`：校验非空 → 检查重复 → BCrypt 加密 → 保存
    - 实现 `login(username, password)`：查找用户 → BCrypt 验证 → 生成 token
    - 空输入抛 `IllegalArgumentException`，重复用户名抛 `UsernameExistsException`，凭据错误抛 `BadCredentialsException`
    - _需求：1.1, 1.2, 1.3, 1.4, 2.1, 2.3, 2.4_
  - [ ]* 4.2 为 AuthService 编写属性测试（`AuthServicePropertyTest.java`）
    - **属性 1：注册 Round-Trip** — 任意合法用户名/密码注册后，存储哈希不等于明文，BCrypt 可验证
    - **验证：需求 1.1, 1.4**
  - [ ]* 4.3 为 AuthService 编写属性测试（续）
    - **属性 2：重复用户名被拒绝** — 任意已存在用户名再次注册返回 409 语义异常
    - **属性 3：空输入被拒绝** — 任意空/空白用户名或密码触发 400 语义异常，数据库状态不变
    - **验证：需求 1.2, 1.3**
  - [ ]* 4.4 为 AuthService 编写属性测试（续）
    - **属性 4：登录 Token Round-Trip** — 任意已注册用户用正确凭据登录，token 解码后 sub 等于用户名
    - **属性 5：无效凭据返回 401 语义** — 不存在用户名或错误密码触发 BadCredentialsException
    - **验证：需求 2.1, 2.2, 2.3, 2.4**

- [x] 5. 后端 AuthController
  - [x] 5.1 创建 `controller/AuthController.java`
    - 映射 `POST /auth/register`：调用 `authService.register()`，成功返回 201 `ApiResponse`，捕获异常返回 409/400
    - 映射 `POST /auth/login`：调用 `authService.login()`，成功返回 200 `{ token: "..." }`，捕获异常返回 401
    - _需求：1.1, 1.2, 1.3, 2.1, 2.3, 2.4_
  - [ ]* 5.2 为 AuthController 编写单元测试（`AuthControllerTest.java`）
    - 测试注册成功返回 201，重复用户名返回 409，空输入返回 400
    - 测试登录成功返回 200 含 token，错误凭据返回 401
    - _需求：1.1, 1.2, 1.3, 2.1, 2.3, 2.4_

- [x] 6. 后端 JwtFilter
  - [x] 6.1 创建 `filter/JwtFilter.java`
    - 实现 `javax.servlet.Filter`（或 `jakarta.servlet.Filter`）
    - 白名单：`/auth/`、`/api/posts/`、`/api/users/batch` 直接放行
    - 无 `Authorization` header → `sendError(401, "缺少认证 token")`
    - 调用 `jwtUtil.extractUsername(token)`，捕获 `ExpiredJwtException` → `"token 已过期"`，`JwtException` → `"token 无效"`
    - _需求：3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 6.2 为 JwtFilter 编写属性测试（`JwtFilterPropertyTest.java`）
    - **属性 6：有效 Token 可访问受保护路径** — 任意通过登录获得的 token 访问 `/api/db/**` 不返回 401
    - **属性 7：无 Token 访问受保护路径返回 401** — 任意 `/api/db/**` 路径无 header 返回 401 "缺少认证 token"
    - **验证：需求 3.1, 3.2**
  - [ ]* 6.3 为 JwtFilter 编写属性测试（续）
    - **属性 8：篡改 Token 返回 401** — 任意被修改的 token 字符串访问受保护路径返回 401 "token 无效"
    - **属性 9：公开路径无需 Token** — 任意 `/auth/**`、`/api/posts/**`、`/api/users/batch` 路径不因缺少 token 返回 401
    - **验证：需求 3.3, 3.5, 3.6**

- [x] 7. 后端 FilterConfig 与配置文件
  - [x] 7.1 创建 `config/FilterConfig.java`
    - 使用 `@Bean FilterRegistrationBean<JwtFilter>` 注册 JwtFilter
    - 设置 URL 映射为 `/*`（Filter 内部自行处理白名单）
    - _需求：3.1_
  - [x] 7.2 在 `src/main/resources/application.properties` 中添加配置
    - 添加 `jwt.secret=${JWT_SECRET:defaultDevSecretMustBeAtLeast32CharsLong}`
    - _需求：2.5_

- [ ] 8. 检查点 — 后端基础功能验证
  - 确保所有后端测试通过，`/auth/register` 和 `/auth/login` 接口可正常调用，`/api/db/**` 路径受 JwtFilter 保护。如有问题请告知。

- [x] 9. 前端安装依赖
  - [x] 9.1 安装 `react-router-dom` 及类型声明
    - 运行 `npm install react-router-dom` 和 `npm install -D @types/react-router-dom`
    - _需求：8.1, 8.2_
  - [x] 9.2 安装前端测试依赖
    - 运行 `npm install -D vitest @testing-library/react @testing-library/user-event fast-check`
    - _需求：测试策略_

- [x] 10. 前端 AuthContext
  - [x] 10.1 创建 `src/contexts/AuthContext.tsx`
    - 定义 `AuthContextValue` 接口（`token`、`isAuthenticated`、`login`、`logout`）
    - `AuthProvider` 初始化时从 `localStorage.getItem("jwt_token")` 恢复状态
    - `login(token)` 写入 localStorage 并更新 state；`logout()` 删除 localStorage 并清空 state
    - 导出 `useAuth()` 自定义 Hook
    - _需求：6.1, 6.2, 6.3_
  - [ ]* 10.2 为 AuthContext 编写属性测试（`AuthContext.test.tsx`）
    - **属性 10：AuthContext 初始化恢复状态** — 任意 localStorage 中的 token 字符串，初始化后 `isAuthenticated` 为 true，`token` 值匹配
    - **验证：需求 6.1, 6.3**
  - [ ]* 10.3 为 AuthContext 编写属性测试（续）
    - **属性 11：Logout Round-Trip** — 任意已登录状态，调用 `logout()` 后 localStorage 无 `jwt_token`，`isAuthenticated` 为 false
    - **验证：需求 6.2**

- [x] 11. 前端 api.ts 修改
  - [x] 11.1 在 `src/services/api.ts` 中添加 `authFetch` 函数
    - 读取 `localStorage.getItem("jwt_token")`，非 `/auth/` 路径自动添加 `Authorization: Bearer <token>` header
    - `/auth/` 路径不附加 token
    - _需求：7.1, 7.3_
  - [x] 11.2 修改 `api.ts` 中的响应处理逻辑，收到 401 时派发 `window.dispatchEvent(new Event("auth:logout"))`
    - _需求：7.2, 6.4_
  - [ ]* 11.3 为 api.ts 编写属性测试（`api.test.ts`）
    - **属性 12：api.ts Token 附加规则** — 任意 localStorage 中的 token，非 auth 路径请求包含 `Authorization` header，auth 路径不包含
    - **验证：需求 7.1, 7.3**

- [x] 12. 前端 LoginPage 组件
  - [x] 12.1 创建 `src/components/LoginPage.tsx`
    - 渲染用户名输入框、密码输入框、登录按钮、注册按钮
    - 登录：`POST /auth/login`，成功后调用 `authContext.login(token)` 并 `navigate("/")`
    - 注册：`POST /auth/register`，成功后自动执行登录流程
    - 请求进行中禁用提交按钮；错误时在表单下方显示后端返回的 `message`
    - _需求：5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 12.2 为 LoginPage 编写单元测试（`LoginPage.test.tsx`）
    - 测试渲染包含所有必要元素
    - 测试提交时按钮禁用
    - 测试 API 返回错误时显示错误消息
    - _需求：5.1, 5.4, 5.5_

- [x] 13. 前端 ProtectedRoute 组件
  - [x] 13.1 创建 `src/components/ProtectedRoute.tsx`
    - 读取 `useAuth().isAuthenticated`
    - 未认证时 `<Navigate to="/login" replace />`
    - 已认证时渲染 `children`（或 `<Outlet />`）
    - _需求：8.1, 8.3_
  - [ ]* 13.2 为 ProtectedRoute 编写属性测试（`ProtectedRoute.test.tsx`）
    - **属性 13：路由守卫双向重定向** — 未认证访问受保护路由重定向到 `/login`；已认证访问 `/login` 重定向到 `/`
    - **验证：需求 8.1, 8.2**
  - [ ]* 13.3 为 ProtectedRoute 编写单元测试（续）
    - 测试未认证时渲染重定向到 `/login`
    - 测试已认证时渲染子组件
    - _需求：8.1, 8.3_

- [x] 14. 前端 App.tsx 修改
  - [x] 14.1 修改 `src/App.tsx`，用 `<AuthProvider>` 包裹整个应用
    - 引入 `BrowserRouter`、`Routes`、`Route`
    - 添加路由：`/login` → `<LoginPage />`，`/` → `<ProtectedRoute><现有主页></ProtectedRoute>`
    - 监听 `auth:logout` 自定义事件，触发时调用 `authContext.logout()` 并 `navigate("/login")`
    - _需求：6.4, 8.1, 8.2_

- [ ] 15. 最终检查点 — 全量测试验证
  - 确保所有后端和前端测试通过，完整的注册 → 登录 → 访问受保护接口 → 登出流程可通过自动化测试验证。如有问题请告知。

## 备注

- 标有 `*` 的子任务为可选测试任务，可跳过以加快 MVP 交付
- 每个任务均引用具体需求条款以保证可追溯性
- 属性测试每个属性最少运行 100 次，覆盖随机输入空间
- 后端属性测试使用 JQwik，前端属性测试使用 fast-check + Vitest
