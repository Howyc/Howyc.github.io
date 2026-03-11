# 需求文档

## 简介

为现有的前后端项目添加 JWT 身份认证功能。后端（Spring Boot 3 + SQLite）提供注册、登录接口，并通过 Servlet Filter 保护现有 API；前端（React 19 + TypeScript）提供登录/注册页面，将 JWT token 存储在 localStorage，并在所有受保护请求中自动附加 `Authorization` header。整个方案不依赖 Spring Security，不使用任何付费服务。

---

## 术语表

- **Auth_Service**：后端认证服务，负责用户注册、登录及 JWT 签发
- **JWT_Filter**：后端 Servlet Filter，负责拦截受保护路由并验证 JWT
- **Auth_Controller**：后端控制器，暴露 `/auth/register` 和 `/auth/login` 接口
- **AppUser**：存储在 SQLite 中的认证用户实体（区别于现有的 `User` 业务实体）
- **Token**：由后端签发的 JWT 字符串，有效期为 24 小时
- **Auth_Store**：前端认证状态管理模块（React Context），持有 token 和当前用户信息
- **Api_Client**：前端统一 HTTP 请求模块（`api.ts`），负责在请求头中附加 token
- **Login_Page**：前端登录/注册页面组件
- **Protected_Route**：前端路由守卫组件，未登录时重定向到登录页

---

## 需求

### 需求 1：用户注册

**用户故事：** 作为新用户，我希望通过用户名和密码注册账号，以便能够登录系统。

#### 验收标准

1. WHEN 客户端向 `/auth/register` 发送包含 `username` 和 `password` 字段的 POST 请求，THE Auth_Controller SHALL 将密码经 BCrypt 加密后持久化到 SQLite 数据库，并返回 HTTP 201 及成功消息。
2. IF 注册请求中的 `username` 已存在于数据库，THEN THE Auth_Controller SHALL 返回 HTTP 409 及错误消息 "用户名已存在"。
3. IF 注册请求中 `username` 或 `password` 字段为空或缺失，THEN THE Auth_Controller SHALL 返回 HTTP 400 及错误消息。
4. THE Auth_Service SHALL 使用 BCrypt 算法（强度因子 ≥ 10）对密码进行单向加密存储，明文密码不得写入数据库。

---

### 需求 2：用户登录与 JWT 签发

**用户故事：** 作为已注册用户，我希望通过用户名和密码登录，以便获取访问受保护资源的 token。

#### 验收标准

1. WHEN 客户端向 `/auth/login` 发送包含正确 `username` 和 `password` 的 POST 请求，THE Auth_Controller SHALL 返回 HTTP 200 及包含 `token` 字段的 JSON 响应。
2. THE Auth_Service SHALL 签发有效期为 24 小时的 JWT，payload 中包含 `sub`（用户名）和 `exp`（过期时间戳）字段。
3. IF 登录请求中的 `username` 不存在，THEN THE Auth_Controller SHALL 返回 HTTP 401 及错误消息 "用户名或密码错误"。
4. IF 登录请求中的 `password` 与数据库中存储的 BCrypt 哈希不匹配，THEN THE Auth_Controller SHALL 返回 HTTP 401 及错误消息 "用户名或密码错误"。
5. THE Auth_Service SHALL 使用 `io.jsonwebtoken:jjwt` 库签发和验证 JWT，密钥长度不低于 256 位，密钥通过环境变量 `JWT_SECRET` 注入。

---

### 需求 3：受保护 API 的 JWT 验证

**用户故事：** 作为系统管理员，我希望 `/api/db/**` 路径下的所有接口都需要有效 JWT 才能访问，以防止未授权访问。

#### 验收标准

1. WHEN 请求携带有效且未过期的 JWT（格式为 `Authorization: Bearer <token>`）访问 `/api/db/**` 路径，THE JWT_Filter SHALL 允许请求通过并继续处理。
2. IF 请求访问 `/api/db/**` 路径时未携带 `Authorization` header，THEN THE JWT_Filter SHALL 返回 HTTP 401 及错误消息 "缺少认证 token"。
3. IF 请求携带的 JWT 签名无效或已被篡改，THEN THE JWT_Filter SHALL 返回 HTTP 401 及错误消息 "token 无效"。
4. IF 请求携带的 JWT 已过期，THEN THE JWT_Filter SHALL 返回 HTTP 401 及错误消息 "token 已过期"。
5. THE JWT_Filter SHALL 对 `/auth/register`、`/auth/login` 路径放行，不进行 JWT 验证。
6. THE JWT_Filter SHALL 对 `/api/posts/**`、`/api/users/batch` 等非 `/api/db/**` 路径放行，不进行 JWT 验证。

---

### 需求 4：AppUser 数据持久化

**用户故事：** 作为开发者，我希望认证用户信息独立存储，不与现有业务 `User` 实体冲突。

#### 验收标准

1. THE Auth_Service SHALL 将认证用户信息存储在独立的 `app_users` 数据库表中，该表包含 `id`（自增主键）、`username`（唯一索引）、`password_hash`、`created_at` 字段。
2. THE Auth_Service SHALL 通过 JPA 自动创建 `app_users` 表（`ddl-auto=update`），无需手动执行 SQL。
3. WHEN 应用启动时 `app_users` 表不存在，THE Auth_Service SHALL 自动创建该表。

---

### 需求 5：前端登录/注册页面

**用户故事：** 作为用户，我希望有一个简洁的登录/注册页面，以便完成身份认证。

#### 验收标准

1. THE Login_Page SHALL 提供用户名输入框、密码输入框、登录按钮和注册按钮。
2. WHEN 用户点击登录按钮，THE Login_Page SHALL 向 `/auth/login` 发送请求；登录成功后将 token 存入 localStorage（key 为 `jwt_token`），并跳转到主页。
3. WHEN 用户点击注册按钮，THE Login_Page SHALL 向 `/auth/register` 发送请求；注册成功后自动执行登录流程。
4. IF 登录或注册请求返回错误，THEN THE Login_Page SHALL 在页面上显示后端返回的错误消息。
5. WHILE 登录或注册请求正在进行中，THE Login_Page SHALL 禁用提交按钮以防止重复提交。

---

### 需求 6：前端认证状态管理

**用户故事：** 作为用户，我希望刷新页面后仍保持登录状态，不需要重新登录。

#### 验收标准

1. THE Auth_Store SHALL 在应用初始化时从 localStorage 读取 `jwt_token`，若存在则恢复登录状态。
2. WHEN 用户登出，THE Auth_Store SHALL 从 localStorage 中删除 `jwt_token` 并清空内存中的认证状态。
3. THE Auth_Store SHALL 通过 React Context 向全局组件树提供 `token`、`isAuthenticated`、`login`、`logout` 方法。
4. IF localStorage 中存储的 token 已过期（后端返回 401），THEN THE Auth_Store SHALL 自动执行登出并跳转到登录页。

---

### 需求 7：前端 API 请求自动附加 token

**用户故事：** 作为开发者，我希望所有受保护的 API 请求自动携带 JWT，不需要在每个调用处手动添加 header。

#### 验收标准

1. THE Api_Client SHALL 在发送请求前检查 localStorage 中是否存在 `jwt_token`，若存在则自动在请求头中添加 `Authorization: Bearer <token>`。
2. WHEN 后端返回 HTTP 401 响应，THE Api_Client SHALL 触发全局登出流程并将用户重定向到登录页。
3. THE Api_Client SHALL 对 `/auth/register` 和 `/auth/login` 请求不附加 `Authorization` header。

---

### 需求 8：前端路由守卫

**用户故事：** 作为用户，我希望未登录时访问任何页面都会自动跳转到登录页。

#### 验收标准

1. WHEN 未认证用户访问受保护路由，THE Protected_Route SHALL 将用户重定向到 `/login` 页面。
2. WHEN 已认证用户访问 `/login` 页面，THE Protected_Route SHALL 将用户重定向到主页 `/`。
3. THE Protected_Route SHALL 基于 Auth_Store 中的 `isAuthenticated` 状态进行路由判断。
