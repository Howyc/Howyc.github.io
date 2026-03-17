# fetch-mcp-demo 项目详解

一个前后端分离的全栈 Demo 项目，展示完整的数据流：外部 API → Java 后端 → 数据库 → React 前端。

## 项目地址

- 前端（Vercel）：[howyc-github-io.vercel.app](https://howyc-github-io.vercel.app)
- 后端（Render）：[howyc-github-io.onrender.com](https://howyc-github-io.onrender.com)
- 源码：[GitHub](https://github.com/Howyc/howyc.github.io)

---

## 技术栈选择

### 前端：React 19 + TypeScript + Vite

为什么选这套？

- **React 19**：我最熟悉的框架，生态成熟，找工作也用得上
- **TypeScript**：类型安全，写 API 调用时自动补全太舒服了
- **Vite**：开发体验比 Webpack 好太多，HMR 秒级刷新
- **Arco Design**：字节的组件库，暗色主题开箱即用，API 设计合理

### 后端：Spring Boot 3 + JPA + TiDB Cloud

为什么选 Java 而不是 Node.js？

- 想跳出舒适区，真正理解后端在做什么
- Spring Boot 是 Java 生态最主流的框架，学了通用性强
- JPA 自动生成 SQL，不用手写，对新手友好
- 三层架构（Controller → Service → Repository）和前端的组件化思维很像

### 数据库：SQLite（本地） + TiDB Cloud（生产）

- **本地开发用 SQLite**：零配置，一个文件就是一个数据库，学习零门槛
- **生产环境用 TiDB Cloud**：免费 5GB，MySQL 兼容，数据持久化不丢失
- 为什么不一直用 SQLite？因为 Render 免费版每次重新部署会重建容器，SQLite 文件会丢失

### 部署平台

| 服务 | 平台 | 原因 |
|------|------|------|
| 文档站 | GitHub Pages | 免费，和 GitHub 仓库天然集成 |
| 前端 | Vercel | 免费，自动 CI/CD，全球 CDN |
| 后端 | Render | 免费，支持 Docker 部署 |
| 数据库 | TiDB Cloud | 免费 5GB，MySQL 兼容 |

全部免费，零成本。

---

## 项目架构

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│  Spring Boot │────▶│ TiDB Cloud  │
│  (Vercel)   │◀────│  (Render)    │◀────│  (MySQL)    │
└─────────────┘     └──────────────┘     └─────────────┘
      │                    │
      │              ┌─────┴──────┐
      │              │ 外部 API   │
      │              │ JSONPlace  │
      │              │ holder     │
      │              └────────────┘
      │
┌─────┴──────┐
│ VitePress  │
│ (GitHub    │
│  Pages)    │
└────────────┘
```


### 前端目录结构

```
fetch-mcp-demo/
├── src/
│   ├── components/       # 页面组件
│   │   ├── LoginPage.tsx       # 登录/注册页
│   │   ├── TopBar.tsx          # 顶部导航栏
│   │   ├── Sidebar.tsx         # 侧边栏导航
│   │   ├── ApiPlayground.tsx   # API 练习场
│   │   ├── UserCardEditable.tsx # 用户卡片（可编辑）
│   │   ├── PostCard.tsx        # 帖子卡片
│   │   ├── EditModal.tsx       # 编辑弹窗
│   │   └── ProtectedRoute.tsx  # 路由守卫
│   ├── contexts/
│   │   └── AuthContext.tsx     # JWT 认证上下文
│   ├── services/
│   │   └── api.ts             # 统一请求封装
│   ├── types/
│   │   └── index.ts           # TypeScript 类型定义
│   ├── App.tsx                # 主应用（路由 + 状态管理）
│   └── main.tsx               # 入口文件
├── .env.production            # 生产环境变量
└── vercel.json                # Vercel SPA 路由配置
```

### 后端目录结构

```
java-backend/src/main/java/com/example/fetchdemo/
├── controller/          # 接收 HTTP 请求（类似前端的路由处理）
│   ├── AuthController.java      # 登录/注册接口
│   ├── DatabaseController.java  # 数据库 CRUD 接口
│   ├── FetchController.java     # 外部 API 代理
│   └── PostController.java      # 帖子接口
├── service/             # 业务逻辑层（类似前端的 hooks/utils）
│   ├── AuthService.java         # 认证逻辑
│   ├── UserService.java         # 用户业务
│   └── PostService.java         # 帖子业务
├── repository/          # 数据访问层（类似前端的 API 调用）
│   ├── AppUserRepository.java   # 登录用户表
│   ├── UserRepository.java      # 用户数据表
│   └── PostRepository.java      # 帖子数据表
├── entity/              # 数据模型（类似 TypeScript 的 interface）
│   ├── AppUser.java             # 登录用户实体
│   ├── User.java                # 用户实体
│   └── Post.java                # 帖子实体
├── config/              # 配置类
│   ├── CorsConfig.java          # 跨域配置
│   └── FilterConfig.java        # 过滤器配置
├── filter/
│   └── JwtFilter.java           # JWT 认证过滤器
├── util/
│   └── JwtUtil.java             # JWT 工具类
└── common/
    └── ApiResponse.java         # 统一响应格式
```

---

## 核心功能

### 1. JWT 登录认证

完整的前后端 JWT 认证流程，没有用 Spring Security，用 Filter 手动实现：

```
注册流程：
用户输入 → 前端校验 → POST /auth/register → BCrypt 加密密码 → 存入数据库

登录流程：
用户输入 → POST /auth/login → 验证密码 → 生成 JWT → 前端存 localStorage

请求认证：
前端请求 → authFetch 自动带 Bearer Token → JwtFilter 验证 → 放行或 401

Token 过期：
任意请求返回 401 → 前端自动清除 Token → 跳转登录页
```

前端关键代码（`api.ts`）：

```typescript
// 统一请求封装，自动带 Token
function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('jwt_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(url, { ...options, headers })
}

// 统一响应处理，401 自动跳转登录
async function unwrap<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:logout'))
    throw new Error('认证已过期，请重新登录')
  }
  const body = await response.json()
  return body.data
}
```

### 2. 数据 CRUD

- 从 JSONPlaceholder 获取外部数据（用户、帖子）
- 保存到后端数据库
- 支持增删改查、按城市筛选、按邮箱/标题搜索

### 3. API 练习场

内置的接口测试工具，类似简化版 Postman：
- 预设了所有后端接口
- 支持 GET/POST/PUT/DELETE
- 自动带 JWT Token
- 显示响应状态码和耗时

### 4. 路由守卫

```typescript
// 未登录自动跳转登录页
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
```

---

## 部署指南

### 前提条件

- GitHub 账号
- Vercel 账号（用 GitHub 登录）
- Render 账号（用 GitHub 登录）
- TiDB Cloud 账号（用邮箱注册）

### 第一步：TiDB Cloud 数据库

1. 打开 [tidbcloud.com](https://tidbcloud.com)，注册账号
2. 创建 Cluster → 选 **Serverless**（免费）
3. 区域选 `us-east-1`（和 Render 同区域，延迟低）
4. 点 **Connect** → 选 **General**
5. 点 **Generate Password**，保存好密码（只显示一次）
6. 记录连接信息：
   - Host: `gateway01.us-east-1.prod.aws.tidbcloud.com`
   - Port: `4000`
   - Username: `xxx.root`
   - Database: `test`

### 第二步：Render 后端部署

1. 打开 [render.com](https://render.com)，用 GitHub 登录
2. New → **Web Service** → 连接 GitHub 仓库
3. 配置：
   - **Name**: `howyc-github-io`（随意）
   - **Root Directory**: `java-backend`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
4. 添加环境变量：

| Key | Value |
|-----|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | `gateway01.us-east-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | `4000` |
| `DB_NAME` | `test` |
| `DB_USERNAME` | `你的TiDB用户名` |
| `DB_PASSWORD` | `你的TiDB密码` |
| `JWT_SECRET` | `随机生成一个Base64字符串` |

5. 点 **Create Web Service**，等待部署完成
6. 部署成功后会得到地址：`https://xxx.onrender.com`


### 第三步：Vercel 前端部署

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
2. **Import** → 选择 GitHub 仓库
3. 配置：
   - **Root Directory**: `fetch-mcp-demo`
   - **Framework Preset**: `Vite`
4. 添加环境变量：

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://你的render地址.onrender.com` |

5. 点 **Deploy**，等待部署完成

### 第四步：GitHub Pages 文档站

文档站通过 GitHub Actions 自动部署，push 到 main 分支时自动触发。

`.github/workflows/deploy-docs.yml` 配置：

```yaml
name: Deploy VitePress to GitHub Pages
on:
  push:
    branches: [main]
    paths: ['docs/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
        working-directory: docs
      - run: npm run docs:build
        working-directory: docs
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

### 第五步：Vercel 自动部署（CI/CD）

前端也通过 GitHub Actions 自动部署：

`.github/workflows/deploy-frontend.yml` 配置：

```yaml
name: Deploy Frontend to Vercel
on:
  push:
    branches: [main]
    paths: ['fetch-mcp-demo/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g vercel
      - run: |
          mkdir -p .vercel
          printf '{"projectId":"%s","orgId":"%s"}' \
            "$VERCEL_PROJECT_ID" "$VERCEL_ORG_ID" > .vercel/project.json
        env:
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      - run: vercel --prod --yes --token=$VERCEL_TOKEN
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

需要在 GitHub 仓库 Settings → Secrets 添加：
- `VERCEL_TOKEN`：Vercel 个人 Token
- `VERCEL_ORG_ID`：Vercel 组织 ID
- `VERCEL_PROJECT_ID`：Vercel 项目 ID

---

## 本地开发

### 后端

```bash
cd java-backend
mvn spring-boot:run
# 默认启动在 http://localhost:8080
# 本地使用 SQLite，数据存在 ./data/app.db
```

### 前端

```bash
cd fetch-mcp-demo
npm install
npm run dev
# 默认启动在 http://localhost:5173
# 自动连接 http://localhost:8080 后端
```

### 文档站

```bash
cd docs
npm install
npm run docs:dev
# 默认启动在 http://localhost:5173
```

---

## 遇到的坑和解决方案

### 1. Render 免费版数据丢失

**问题**：Render 免费版每次重新部署会重建容器，SQLite 文件数据库丢失。

**解决**：将生产环境数据库从 SQLite 迁移到 TiDB Cloud（MySQL 兼容），数据存在云端不受容器重建影响。

### 2. Vercel 部署路径问题

**问题**：GitHub Actions 里用 `working-directory: fetch-mcp-demo`，但 Vercel Dashboard 的 Root Directory 也设置了 `fetch-mcp-demo`，导致路径重复。

**解决**：在仓库根目录创建 `.vercel/project.json`，不用 `working-directory`，让 Vercel Dashboard 的设置来决定构建子目录。

### 3. SPA 路由 404

**问题**：Vercel 部署后，刷新页面返回 404。

**解决**：添加 `vercel.json` 配置 SPA 路由重写：

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 4. CORS 跨域

**问题**：前端（Vercel）和后端（Render）域名不同，浏览器拦截请求。

**解决**：后端用 Filter 动态设置 `Access-Control-Allow-Origin`，读取请求的 Origin 头并回写，支持任意来源。

### 5. Arco Design 组件问题

**问题**：`StrictMode` 下 Arco 组件显示异常标签名。

**解决**：去掉 `main.tsx` 中的 `<StrictMode>`。

### 6. JWT Token 过期处理

**问题**：Token 过期后页面没有反应，用户不知道需要重新登录。

**解决**：`api.ts` 统一拦截 401 响应，触发 `auth:logout` 事件，App.tsx 监听后自动清除 Token 并跳转登录页。

---

## 技术要点总结

| 技术点 | 前端实现 | 后端实现 |
|--------|---------|---------|
| 认证 | AuthContext + localStorage | JwtFilter + JwtUtil |
| 路由守卫 | ProtectedRoute 组件 | JwtFilter 拦截 |
| 请求封装 | authFetch + unwrap | ApiResponse 统一格式 |
| 跨域 | 无需处理（浏览器行为） | CorsConfig Filter |
| 密码安全 | 明文传输（HTTPS 加密） | BCrypt 哈希存储 |
| 环境切换 | .env.production | application-prod.properties |

---

> 这个项目是我从前端转全栈的第一个完整实践。如果你也是前端开发者想学后端，希望这个项目能给你一些参考。
