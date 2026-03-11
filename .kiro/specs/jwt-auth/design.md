# 技术设计文档：JWT 身份认证

## 概述

本文档描述为现有 Spring Boot 3 + React 19 项目添加 JWT 身份认证的技术方案。后端通过手写 Servlet Filter（不依赖 Spring Security）实现 JWT 验证，前端通过 React Context 管理认证状态，`api.ts` 自动附加 token。

**关键技术决策：**
- 不引入 Spring Security，避免复杂的安全配置，降低学习成本
- 使用 `spring-security-crypto` 单独引入 BCrypt，仅用其加密功能
- JWT 密钥通过环境变量注入，不硬编码在代码中
- 前端使用 `react-router-dom` 实现路由和路由守卫

## 架构

### 整体架构图

```
前端 (React 19 + Vite)                    后端 (Spring Boot 3 + SQLite)
┌─────────────────────────────┐           ┌──────────────────────────────────┐
│  App.tsx                    │           │  JwtFilter (Servlet Filter)      │
│  ├── AuthProvider           │           │  ├── 放行: /auth/**, /api/posts/**│
│  │   └── AuthContext        │           │  ├── 拦截: /api/db/**            │
│  ├── ProtectedRoute         │           │  └── 验证 JWT → 401 或放行       │
│  ├── LoginPage              │           │                                  │
│  └── 现有页面 (受保护)       │           │  AuthController                  │
│                             │           │  ├── POST /auth/register         │
│  services/api.ts            │           │  └── POST /auth/login            │
│  ├── 自动附加 Bearer token   │──HTTP──▶  │                                  │
│  └── 401 → 自动登出          │           │  AuthService                     │
│                             │           │  ├── BCrypt 加密/验证密码         │
│  localStorage               │           │  └── JwtUtil 签发/验证 token     │
│  └── jwt_token              │           │                                  │
└─────────────────────────────┘           │  AppUserRepository (JPA)         │
                                          │  └── app_users 表 (SQLite)       │
                                          └──────────────────────────────────┘
```

### 请求过滤逻辑

```
所有请求
  │
  ▼
JwtFilter
  ├── 路径是 /auth/** 或 /api/posts/** 或 /api/users/batch？
  │     └── YES → 直接放行 (chain.doFilter)
  │
  └── NO → 读取 Authorization header
              ├── 无 header → 返回 401 "缺少认证 token"
              ├── token 签名无效 → 返回 401 "token 无效"
              ├── token 已过期 → 返回 401 "token 已过期"
              └── token 有效 → 放行
```

## 组件与接口

### 后端新增文件

| 文件路径 | 职责 |
|---------|------|
| `entity/AppUser.java` | JPA 实体，映射 `app_users` 表 |
| `repository/AppUserRepository.java` | JPA Repository，提供 `findByUsername` 方法 |
| `service/AuthService.java` | 注册/登录业务逻辑，调用 BCrypt 和 JwtUtil |
| `controller/AuthController.java` | 暴露 `/auth/register` 和 `/auth/login` REST 接口 |
| `util/JwtUtil.java` | JWT 签发与验证工具类，封装 jjwt 操作 |
| `filter/JwtFilter.java` | Servlet Filter，拦截受保护路径并验证 JWT |
| `config/FilterConfig.java` | 将 JwtFilter 注册到 Spring 容器并配置 URL 映射 |

### 后端修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `pom.xml` | 添加 `jjwt-api/impl/jackson` 和 `spring-security-crypto` 依赖 |
| `src/main/resources/application.properties` | 添加 `jwt.secret` 配置项（从环境变量读取） |

### 前端新增文件

| 文件路径 | 职责 |
|---------|------|
| `src/contexts/AuthContext.tsx` | React Context，管理 token/isAuthenticated/login/logout |
| `src/components/LoginPage.tsx` | 登录/注册页面组件 |
| `src/components/ProtectedRoute.tsx` | 路由守卫，未登录重定向到 `/login` |

### 前端修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `src/services/api.ts` | 添加 token 自动附加逻辑，401 触发登出 |
| `src/App.tsx` | 包裹 `AuthProvider`，添加路由配置 |
| `package.json` | 添加 `react-router-dom` 依赖 |

### REST 接口定义

**POST /auth/register**
```
请求体: { "username": "string", "password": "string" }
成功响应 (201): { "success": true, "data": null, "message": "注册成功" }
失败响应 (409): { "success": false, "data": null, "message": "用户名已存在" }
失败响应 (400): { "success": false, "data": null, "message": "用户名和密码不能为空" }
```

**POST /auth/login**
```
请求体: { "username": "string", "password": "string" }
成功响应 (200): { "success": true, "data": { "token": "eyJ..." }, "message": "登录成功" }
失败响应 (401): { "success": false, "data": null, "message": "用户名或密码错误" }
```

## 数据模型

### AppUser 实体

```java
// entity/AppUser.java
@Entity
@Table(name = "app_users")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                    // 自增主键

    @Column(unique = true, nullable = false)
    private String username;            // 唯一用户名

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;        // BCrypt 哈希，不存明文

    @Column(name = "created_at")
    private LocalDateTime createdAt;    // 注册时间，@PrePersist 自动填充
}
```

**对应数据库表 `app_users`：**

| 列名 | 类型 | 约束 |
|-----|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| username | TEXT | UNIQUE NOT NULL |
| password_hash | TEXT | NOT NULL |
| created_at | TEXT | - |

> 注意：`app_users` 与现有的 `users` 表完全独立，`AppUser` 与现有 `User` 实体无关联。

### JWT Payload 结构

```json
{
  "sub": "用户名",
  "iat": 1700000000,
  "exp": 1700086400
}
```

- `sub`：Subject，存储用户名
- `iat`：签发时间（Unix 时间戳）
- `exp`：过期时间 = 签发时间 + 86400 秒（24 小时）

### 前端认证状态类型

```typescript
// contexts/AuthContext.tsx
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}
```

## 关键数据流

### 注册流程

```
前端 LoginPage
  │  POST /auth/register { username, password }
  ▼
AuthController.register()
  │  调用 authService.register(username, password)
  ▼
AuthService.register()
  ├── 检查 username 是否为空 → 400
  ├── 查询 appUserRepository.findByUsername(username)
  │     └── 存在 → 抛出异常 → 409
  ├── BCrypt.hashpw(password, BCrypt.gensalt(10))
  ├── 创建 AppUser { username, passwordHash, createdAt }
  └── appUserRepository.save(appUser)
  │
  ▼
返回 201 { success: true, message: "注册成功" }
  │
  ▼
前端：注册成功 → 自动调用登录流程
```

### 登录流程

```
前端 LoginPage
  │  POST /auth/login { username, password }
  ▼
AuthController.login()
  │  调用 authService.login(username, password)
  ▼
AuthService.login()
  ├── 查询 appUserRepository.findByUsername(username)
  │     └── 不存在 → 抛出异常 → 401
  ├── BCrypt.checkpw(password, appUser.passwordHash)
  │     └── 不匹配 → 抛出异常 → 401
  └── jwtUtil.generateToken(username)
        └── Jwts.builder().subject(username).expiration(now+24h).signWith(key).compact()
  │
  ▼
返回 200 { success: true, data: { token: "eyJ..." } }
  │
  ▼
前端：localStorage.setItem("jwt_token", token)
      authContext.login(token)
      navigate("/")
```

### 受保护请求流程

```
前端 api.ts
  │  读取 localStorage.getItem("jwt_token")
  │  fetch(url, { headers: { Authorization: "Bearer eyJ..." } })
  ▼
JwtFilter.doFilter()
  ├── 路径匹配白名单？ → 直接 chain.doFilter()
  ├── 读取 Authorization header
  │     └── 无 → response.sendError(401, "缺少认证 token")
  ├── 提取 token（去掉 "Bearer " 前缀）
  ├── jwtUtil.validateToken(token)
  │     ├── ExpiredJwtException → response.sendError(401, "token 已过期")
  │     └── JwtException → response.sendError(401, "token 无效")
  └── 验证通过 → chain.doFilter()
  │
  ▼
Controller 处理请求，返回数据
  │
  ▼
前端：正常处理响应
  └── 若响应 401 → authContext.logout() → navigate("/login")
```

## 核心模块设计

### JwtUtil 工具类

```java
// util/JwtUtil.java
@Component
public class JwtUtil {
    // 从环境变量 JWT_SECRET 读取，通过 application.properties 桥接
    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getKey() {
        // 将 Base64 编码的密钥字符串转为 HMAC-SHA256 密钥对象
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    // 签发 token：sub=username，有效期 24 小时
    public String generateToken(String username) {
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 86400_000L))
            .signWith(getKey())
            .compact();
    }

    // 验证并解析 token，抛出 ExpiredJwtException 或 JwtException
    public String extractUsername(String token) {
        return Jwts.parser()
            .verifyWith(getKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }
}
```

### JwtFilter 设计

```java
// filter/JwtFilter.java
public class JwtFilter implements Filter {
    // 白名单路径前缀（不需要 token）
    private static final List<String> WHITELIST = List.of(
        "/auth/", "/api/posts/", "/api/users/batch"
    );

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        HttpServletRequest request = (HttpServletRequest) req;
        String path = request.getRequestURI();

        // 1. 白名单放行
        if (isWhitelisted(path)) {
            chain.doFilter(req, res);
            return;
        }

        // 2. 读取 Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(res, 401, "缺少认证 token");
            return;
        }

        // 3. 验证 token
        String token = authHeader.substring(7);
        try {
            jwtUtil.extractUsername(token); // 验证签名和过期
            chain.doFilter(req, res);       // 通过，继续处理
        } catch (ExpiredJwtException e) {
            sendError(res, 401, "token 已过期");
        } catch (JwtException e) {
            sendError(res, 401, "token 无效");
        }
    }
}
```

### AuthContext 设计

```typescript
// contexts/AuthContext.tsx
const TOKEN_KEY = "jwt_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  // 初始化时从 localStorage 恢复状态
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );

  const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### api.ts 修改方案

核心思路：将 `fetch` 调用统一封装，在发出请求前注入 token，在收到 401 时触发登出。

```typescript
// 修改 api.ts 中的 unwrap 函数，增加 401 处理
async function unwrap<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // 触发全局登出（通过自定义事件解耦）
    window.dispatchEvent(new Event("auth:logout"));
    throw new Error("认证已过期，请重新登录");
  }
  if (!response.ok) { /* 原有逻辑 */ }
  // ...
}

// 新增带 token 的 fetch 包装函数
function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("jwt_token");
  const isAuthRoute = url.includes("/auth/");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token && !isAuthRoute) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}
```

`App.tsx` 中监听 `auth:logout` 事件，调用 `authContext.logout()` 并跳转到 `/login`。

## 依赖变更

### pom.xml 新增依赖

```xml
<!-- JWT 库：jjwt（分三个模块） -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- BCrypt 加密（仅引入 spring-security-crypto，不引入完整 Spring Security） -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
    <!-- 版本由 spring-boot-starter-parent 管理，无需指定 -->
</dependency>
```

> 为什么分三个模块？jjwt 0.12.x 将 API、实现、JSON 序列化分离，`jjwt-api` 是编译时接口，`jjwt-impl` 和 `jjwt-jackson` 是运行时实现，这样可以在不改代码的情况下替换实现。

### application.properties 新增配置

```properties
# JWT 密钥从环境变量读取，本地开发可在 .env 或 IDE 运行配置中设置
# 生产环境通过 Docker -e JWT_SECRET=xxx 注入
jwt.secret=${JWT_SECRET:defaultDevSecretMustBeAtLeast32CharsLong}
```

> `${JWT_SECRET:defaultDevSecretMustBeAtLeast32CharsLong}` 语法：优先读取环境变量 `JWT_SECRET`，若不存在则使用冒号后的默认值（仅用于本地开发，生产环境必须设置真实密钥）。

### package.json 新增依赖

```bash
npm install react-router-dom
npm install -D @types/react-router-dom
```

```json
{
  "dependencies": {
    "react-router-dom": "^6.x"
  }
}
```

## 正确性属性

*属性（Property）是在系统所有合法执行中都应成立的特征或行为——本质上是对系统应该做什么的形式化陈述。属性是人类可读规范与机器可验证正确性保证之间的桥梁。*

### 属性 1：注册 Round-Trip

*对于任意* 合法的用户名和密码，注册成功后：(1) 数据库中存在该用户，(2) 存储的密码字段不等于原始明文密码，(3) BCrypt 可以验证原始密码与存储哈希匹配。

**验证需求：1.1, 1.4**

### 属性 2：重复用户名被拒绝

*对于任意* 已存在于数据库的用户名，再次注册时系统应返回 HTTP 409。

**验证需求：1.2**

### 属性 3：空输入被拒绝

*对于任意* username 或 password 为空字符串或纯空白字符串的注册请求，系统应返回 HTTP 400，且数据库状态不变。

**验证需求：1.3**

### 属性 4：登录 Token Round-Trip

*对于任意* 已注册用户，使用正确凭据登录后返回的 token，解码后应包含 `sub`（等于用户名）和 `exp`（约为当前时间 + 24 小时）字段。

**验证需求：2.1, 2.2**

### 属性 5：无效凭据返回 401

*对于任意* 不存在的用户名，或任意已注册用户的错误密码，登录请求应返回 HTTP 401。

**验证需求：2.3, 2.4**

### 属性 6：有效 Token 可访问受保护路径

*对于任意* 通过登录获得的有效 token，携带该 token 访问 `/api/db/**` 路径应被允许（不返回 401）。

**验证需求：3.1**

### 属性 7：无 Token 访问受保护路径返回 401

*对于任意* `/api/db/**` 路径，不携带 `Authorization` header 的请求应返回 HTTP 401，消息为"缺少认证 token"。

**验证需求：3.2**

### 属性 8：篡改 Token 返回 401

*对于任意* 被修改过（签名无效）的 token 字符串，访问受保护路径应返回 HTTP 401，消息为"token 无效"。

**验证需求：3.3**

### 属性 9：公开路径无需 Token

*对于任意* `/auth/**`、`/api/posts/**`、`/api/users/batch` 路径，不携带 token 的请求不应因缺少 token 而返回 401。

**验证需求：3.5, 3.6**

### 属性 10：AuthContext 初始化恢复状态

*对于任意* 存储在 localStorage 中的 token 字符串，初始化 `AuthProvider` 后，`isAuthenticated` 应为 `true`，`token` 值应等于 localStorage 中的值。

**验证需求：6.1, 6.3**

### 属性 11：Logout Round-Trip

*对于任意* 已登录状态（localStorage 有 token，isAuthenticated 为 true），调用 `logout()` 后，localStorage 中不应存在 `jwt_token`，`isAuthenticated` 应为 `false`。

**验证需求：6.2**

### 属性 12：api.ts Token 附加规则

*对于任意* 存储在 localStorage 中的 token，发往非 `/auth/` 路径的请求应包含 `Authorization: Bearer <token>` header；发往 `/auth/` 路径的请求不应包含该 header。

**验证需求：7.1, 7.3**

### 属性 13：路由守卫双向重定向

*对于任意* 认证状态：(1) 未认证时访问受保护路由应重定向到 `/login`；(2) 已认证时访问 `/login` 应重定向到 `/`。

**验证需求：8.1, 8.2**

## 错误处理

### 后端错误处理策略

所有错误响应统一使用现有的 `ApiResponse` 结构：

```json
{ "success": false, "data": null, "message": "错误描述" }
```

| 场景 | HTTP 状态码 | 消息 |
|-----|------------|------|
| 用户名/密码为空 | 400 | "用户名和密码不能为空" |
| 用户名已存在 | 409 | "用户名已存在" |
| 用户名不存在或密码错误 | 401 | "用户名或密码错误" |
| 缺少 Authorization header | 401 | "缺少认证 token" |
| Token 签名无效/被篡改 | 401 | "token 无效" |
| Token 已过期 | 401 | "token 已过期" |

> 登录失败统一返回"用户名或密码错误"，不区分"用户不存在"和"密码错误"，防止用户名枚举攻击。

### 前端错误处理策略

- `LoginPage`：捕获 API 错误，在表单下方显示后端返回的 `message` 字段
- `api.ts`：收到 401 时派发 `auth:logout` 自定义事件，由 `App.tsx` 统一处理登出和跳转
- 网络错误（fetch 抛出异常）：显示通用错误消息"网络请求失败，请重试"

## 测试策略

### 双轨测试方法

本功能同时采用单元测试和属性测试，两者互补：
- **单元测试**：验证具体示例、边界条件和错误场景
- **属性测试**：通过随机输入验证普遍性规则，覆盖单元测试难以穷举的输入空间

### 后端测试

**测试框架：** JUnit 5（Spring Boot 默认集成）+ JQwik（属性测试库）

添加 JQwik 依赖：
```xml
<dependency>
    <groupId>net.jqwik</groupId>
    <artifactId>jqwik</artifactId>
    <version>1.8.4</version>
    <scope>test</scope>
</dependency>
```

**属性测试（每个属性最少运行 100 次）：**

```java
// Feature: jwt-auth, Property 1: 注册 Round-Trip
@Property(tries = 100)
void registerRoundTrip(@ForAll @AlphaChars @StringLength(min=3, max=20) String username,
                       @ForAll @StringLength(min=6, max=30) String password) {
    authService.register(username, password);
    AppUser saved = appUserRepository.findByUsername(username).orElseThrow();
    assertThat(saved.getPasswordHash()).isNotEqualTo(password);
    assertThat(BCrypt.checkpw(password, saved.getPasswordHash())).isTrue();
}

// Feature: jwt-auth, Property 4: 登录 Token Round-Trip
@Property(tries = 100)
void loginTokenRoundTrip(@ForAll @AlphaChars @StringLength(min=3) String username,
                         @ForAll @StringLength(min=6) String password) {
    authService.register(username, password);
    String token = authService.login(username, password);
    String extractedUsername = jwtUtil.extractUsername(token);
    assertThat(extractedUsername).isEqualTo(username);
}
```

**单元测试（具体示例）：**
- `AuthServiceTest`：注册重复用户名抛异常，空密码抛异常，错误密码登录抛异常
- `JwtUtilTest`：生成的 token 可被解析，过期 token 抛 `ExpiredJwtException`
- `JwtFilterTest`：无 header 返回 401，有效 token 放行，白名单路径放行

### 前端测试

**测试框架：** Vitest + React Testing Library + fast-check（属性测试库）

```bash
npm install -D vitest @testing-library/react @testing-library/user-event fast-check
```

**属性测试（每个属性最少运行 100 次）：**

```typescript
// Feature: jwt-auth, Property 10: AuthContext 初始化恢复状态
test("AuthContext 从 localStorage 恢复状态", () => {
  fc.assert(fc.property(fc.string({ minLength: 10 }), (token) => {
    localStorage.setItem("jwt_token", token);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(token);
    localStorage.clear();
  }), { numRuns: 100 });
});

// Feature: jwt-auth, Property 12: api.ts Token 附加规则
test("非 auth 路径自动附加 token", () => {
  fc.assert(fc.property(fc.string({ minLength: 10 }), (token) => {
    localStorage.setItem("jwt_token", token);
    const headers = buildAuthHeaders("/api/db/users");
    expect(headers["Authorization"]).toBe(`Bearer ${token}`);
    localStorage.clear();
  }), { numRuns: 100 });
});
```

**单元测试（具体示例）：**
- `LoginPage`：渲染包含用户名输入框、密码输入框、登录/注册按钮
- `LoginPage`：提交时按钮禁用（防重复提交）
- `LoginPage`：API 返回错误时显示错误消息
- `ProtectedRoute`：未认证时渲染重定向到 `/login`
- `ProtectedRoute`：已认证时渲染子组件
