---
outline: deep
---

# 第 4 章：部署流程

> 本章讲解如何将全栈项目部署到云端，包括 TiDB Cloud 数据库、Render 后端、Vercel 前端和 GitHub Pages 文档站。所有配置文件来自项目真实源码，每行配置都有中文注释。
>
> 前置阅读：建议先阅读 [后端知识点详解](/tutorials/backend-knowledge) 了解 Spring Boot 项目结构，再阅读本章效果更佳。
> 项目详情：参考 [fetch-mcp-demo 项目详解](/projects/fetch-mcp-demo) 了解完整项目架构。

## 4.1 TiDB Cloud 数据库配置

### 为什么选择 TiDB Cloud？

本项目开发环境使用 SQLite（零配置、文件数据库），但生产环境需要一个云端数据库。[TiDB Cloud](https://tidbcloud.com/) 提供免费的 Serverless 方案，兼容 MySQL 协议，非常适合个人项目部署：

| 特性 | 说明 |
|------|------|
| 免费额度 | Serverless 方案每月 25 GiB 存储 + 2.5 亿 Request Units |
| MySQL 兼容 | 使用标准 MySQL 驱动连接，Spring Boot 无需额外配置 |
| SSL 加密 | 默认启用 TLS 加密连接，数据传输安全 |
| 全球节点 | 支持 AWS 多区域部署（本项目使用 us-east-1） |

### 注册与创建集群

**第 1 步：注册账号**

1. 访问 [TiDB Cloud 官网](https://tidbcloud.com/)，点击「Start Free」
2. 可以使用 GitHub、Google 或邮箱注册
3. 完成邮箱验证后进入控制台

**第 2 步：创建 Serverless Cluster**

1. 在控制台首页点击「Create Cluster」
2. 选择「Serverless」方案（免费）
3. 选择云服务商和区域：
   - Cloud Provider: **AWS**
   - Region: **us-east-1 (N. Virginia)** — 与 Render 后端同区域，减少延迟
4. 设置集群名称（如 `my-cluster`）
5. 点击「Create」，等待集群创建完成（通常 1-2 分钟）

**第 3 步：获取连接信息**

1. 集群创建完成后，点击集群名称进入详情页
2. 点击右上角「Connect」按钮
3. 在弹出的连接对话框中：
   - Connect With: 选择「General」
   - 记录以下连接信息：

| 参数 | 示例值 | 说明 |
|------|--------|------|
| Host | `gateway01.us-east-1.prod.aws.tidbcloud.com` | 数据库主机地址 |
| Port | `4000` | TiDB 默认端口（非 MySQL 的 3306） |
| Username | `3QEwxwnQkxdTGA7.root` | 格式为 `集群前缀.用户名` |
| Password | （创建时设置） | 请妥善保存，后续无法查看 |
| Database | `test` | 默认数据库名 |

::: warning 注意事项
- **密码只显示一次**：创建集群时设置的密码只在创建时显示，请立即保存。如果忘记，需要重置密码。
- **端口是 4000**：TiDB 使用 4000 端口，不是 MySQL 默认的 3306，配置时不要搞混。
- **Username 包含前缀**：TiDB Cloud 的用户名格式是 `集群前缀.root`，不是单纯的 `root`。
- **SSL 必须开启**：TiDB Cloud 强制使用 SSL 连接，Spring Boot 配置中需要设置 `sslMode=VERIFY_IDENTITY`。
:::

### 验证连接

可以使用 MySQL 命令行工具测试连接：

```bash
# 使用 mysql 客户端连接 TiDB Cloud
# -h 指定主机地址
# -P 指定端口（大写 P）
# -u 指定用户名（包含集群前缀）
# --ssl-mode 启用 SSL 加密连接
mysql -h gateway01.us-east-1.prod.aws.tidbcloud.com -P 4000 -u '3QEwxwnQkxdTGA7.root' -p --ssl-mode=VERIFY_IDENTITY
```

连接成功后，可以运行 `SHOW DATABASES;` 确认数据库列表。

## 4.2 Render 后端部署

### 为什么选择 Render？

[Render](https://render.com/) 是一个现代化的云平台，支持 Docker 容器部署，提供免费方案：

| 特性 | 说明 |
|------|------|
| Docker 支持 | 自动检测 Dockerfile 并构建部署 |
| 免费方案 | 每月 750 小时免费实例时间 |
| 自动部署 | 连接 GitHub 仓库，push 后自动重新部署 |
| 环境变量 | 支持在控制台配置环境变量，注入到容器中 |

::: warning Render 免费版限制
- 免费实例在 15 分钟无请求后会自动休眠，下次请求需要 30-60 秒冷启动
- 免费实例的磁盘存储是临时的，重新部署后数据会丢失（所以需要外部数据库如 TiDB Cloud）
:::

### 部署步骤

**第 1 步：创建 Web Service**

1. 登录 [Render 控制台](https://dashboard.render.com/)
2. 点击「New +」→「Web Service」
3. 连接你的 GitHub 仓库（`howyc/howyc.github.io`）
4. 配置基本信息：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Name | `howyc-github-io` | 服务名称，会生成 URL |
| Region | `Oregon (US West)` | 选择离用户近的区域 |
| Runtime | `Docker` | 使用 Dockerfile 构建 |
| Root Directory | `java-backend` | 指定后端代码所在目录 |
| Instance Type | `Free` | 免费方案 |

**第 2 步：配置环境变量**

在 Render 的「Environment」标签页中，添加以下环境变量：

| 环境变量 | 值 | 说明 |
|----------|-----|------|
| `SPRING_PROFILES_ACTIVE` | `prod` | 激活生产环境配置文件 |
| `DB_HOST` | `gateway01.us-east-1.prod.aws.tidbcloud.com` | TiDB Cloud 主机地址 |
| `DB_PORT` | `4000` | TiDB Cloud 端口 |
| `DB_NAME` | `test` | 数据库名称 |
| `DB_USERNAME` | `3QEwxwnQkxdTGA7.root` | TiDB Cloud 用户名 |
| `DB_PASSWORD` | （你的密码） | TiDB Cloud 密码 |
| `JWT_SECRET` | （自定义 Base64 字符串） | JWT 签名密钥 |

::: tip 环境变量的作用
`SPRING_PROFILES_ACTIVE=prod` 是关键配置。Spring Boot 会根据这个变量加载 `application-prod.properties` 配置文件，从而使用 TiDB Cloud 数据库而非本地 SQLite。其他 `DB_*` 变量会通过 `${}` 占位符注入到配置文件中。
:::

### 生产环境配置文件详解

来自 `java-backend/src/main/resources/application-prod.properties`：

Spring Boot 通过 Profiles 机制区分开发和生产环境。当 `SPRING_PROFILES_ACTIVE=prod` 时，会加载以下配置文件：

```properties
# 生产环境配置（Render 部署 + TiDB Cloud）
# 指定服务器监听端口为 8080（Render 默认使用此端口）
server.port=8080

# TiDB Cloud (MySQL 兼容) 数据库配置
# 连接信息通过 Render 环境变量注入
# ${DB_HOST:默认值} 语法：优先读取环境变量 DB_HOST，如果未设置则使用冒号后的默认值
# jdbc:mysql:// 表示使用 MySQL 协议连接（TiDB 兼容 MySQL）
# sslMode=VERIFY_IDENTITY 启用 SSL 并验证服务器证书（TiDB Cloud 强制要求）
# enabledTLSProtocols 指定允许的 TLS 版本
spring.datasource.url=jdbc:mysql://${DB_HOST:gateway01.us-east-1.prod.aws.tidbcloud.com}:${DB_PORT:4000}/${DB_NAME:test}?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3
# 数据库用户名，从环境变量 DB_USERNAME 读取
spring.datasource.username=${DB_USERNAME}
# 数据库密码，从环境变量 DB_PASSWORD 读取
spring.datasource.password=${DB_PASSWORD}
# 指定 JDBC 驱动类（MySQL 驱动，TiDB 兼容）
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA（Java 持久化 API）配置
# 使用 MySQL 方言生成 SQL（类似前端的 ORM 适配器）
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
# update 模式：启动时自动更新表结构（不删除已有数据）
spring.jpa.hibernate.ddl-auto=update
# 生产环境关闭 SQL 日志输出
spring.jpa.show-sql=false

# 日志级别配置
# 生产环境只输出 WARN 及以上级别的日志（减少日志量）
logging.level.root=WARN
# 项目代码输出 INFO 级别日志（便于排查业务问题）
logging.level.com.example=INFO
```

对比开发环境配置（来自 `java-backend/src/main/resources/application.properties`）：

```properties
# 开发环境配置（本地开发）
# 服务器端口
server.port=8080
# 应用名称
spring.application.name=fetch-demo
# 开发环境使用 SQLite 文件数据库（零配置，无需安装数据库服务）
spring.datasource.url=jdbc:sqlite:./data/app.db
# SQLite JDBC 驱动
spring.datasource.driver-class-name=org.sqlite.JDBC
# SQLite 方言
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
# 自动更新表结构
spring.jpa.hibernate.ddl-auto=update
# 开发环境开启 SQL 日志（便于调试）
spring.jpa.show-sql=true
# 格式化 SQL 输出（更易读）
spring.jpa.properties.hibernate.format_sql=true
# 开发环境使用 DEBUG 级别日志
logging.level.root=INFO
logging.level.com.example=DEBUG
# 输出详细的 SQL 参数绑定信息
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
# 启用彩色日志输出
spring.output.ansi.enabled=ALWAYS
# JWT 密钥（开发环境使用默认值，生产环境必须通过环境变量覆盖）
jwt.secret=${JWT_SECRET:dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBkZXZlbG9wbWVudA==}
```

::: tip 开发 vs 生产环境对比
| 配置项 | 开发环境 | 生产环境 |
|--------|---------|---------|
| 数据库 | SQLite（本地文件） | TiDB Cloud（云端 MySQL） |
| SQL 日志 | 开启（DEBUG） | 关闭（WARN） |
| 日志级别 | DEBUG（详细） | WARN（精简） |
| 数据库驱动 | `org.sqlite.JDBC` | `com.mysql.cj.jdbc.Driver` |
:::

## 4.3 Dockerfile 多阶段构建

### 什么是多阶段构建？

Docker 多阶段构建（Multi-stage Build）是一种优化镜像大小的技术。类比前端：

| 阶段 | Docker 后端 | 前端类比 |
|------|------------|---------|
| 构建阶段 | Maven 编译打包 → 生成 JAR 文件 | `npm run build` → 生成 `dist/` 目录 |
| 运行阶段 | JRE 运行 JAR 文件 | Nginx 托管 `dist/` 静态文件 |

构建阶段需要完整的 JDK + Maven（约 800MB），但运行阶段只需要 JRE（约 200MB）。多阶段构建让最终镜像只包含运行所需的内容，大幅减小镜像体积。

### Dockerfile 详解

来自 `java-backend/Dockerfile`：

以下是项目使用的 Dockerfile，采用两阶段构建：第一阶段用 Maven 编译打包 Java 项目，第二阶段用精简的 JRE 运行打包好的 JAR 文件。

```dockerfile
# ===== 第一阶段：构建阶段 =====
# 使用 Maven 3.9 + JDK 17 作为构建环境（类似前端的 node:20 镜像）
# AS build 给这个阶段起名为 "build"，后续阶段可以引用
FROM maven:3.9-eclipse-temurin-17 AS build
# 设置工作目录为 /app（类似前端的 WORKDIR）
WORKDIR /app
# 先复制 pom.xml（Maven 的 package.json），利用 Docker 缓存层
# 如果 pom.xml 没变，下次构建会跳过依赖下载步骤
COPY pom.xml .
# 复制源代码目录到容器中
COPY src ./src
# 执行 Maven 打包命令（类似 npm run build）
# clean 清理旧的构建产物
# package 编译并打包成 JAR 文件
# -DskipTests 跳过测试（加快构建速度）
RUN mvn clean package -DskipTests

# ===== 第二阶段：运行阶段 =====
# 使用精简的 JRE 17 镜像（只包含 Java 运行时，不含编译工具）
# 类似前端部署时用 nginx:alpine 而非 node:20
FROM eclipse-temurin:17-jre
# 设置运行时工作目录
WORKDIR /app
# 从构建阶段（build）复制打包好的 JAR 文件到当前阶段
# --from=build 引用第一阶段的构建产物
# *.jar 匹配 target 目录下生成的 JAR 文件
COPY --from=build /app/target/*.jar app.jar

# 声明容器监听 8080 端口（与 Spring Boot 配置的 server.port 一致）
EXPOSE 8080
# 容器启动时执行的命令：用 java -jar 运行 Spring Boot 应用
# 类似前端的 CMD ["nginx", "-g", "daemon off;"]
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 构建流程图

```
Dockerfile 构建流程：

┌─────────────────────────────────────┐
│  第一阶段：maven:3.9-eclipse-temurin-17  │
│                                     │
│  1. COPY pom.xml → 复制依赖配置      │
│  2. COPY src → 复制源代码            │
│  3. mvn package → 编译打包 JAR       │
│                                     │
│  产物：/app/target/fetchdemo-0.0.1.jar │
└──────────────┬──────────────────────┘
               │ COPY --from=build
               ▼
┌─────────────────────────────────────┐
│  第二阶段：eclipse-temurin:17-jre       │
│                                     │
│  1. COPY *.jar → 复制 JAR 文件       │
│  2. EXPOSE 8080 → 声明端口          │
│  3. java -jar app.jar → 启动应用    │
│                                     │
│  最终镜像大小：约 200MB（vs 800MB+）  │
└─────────────────────────────────────┘
```

## 4.4 Vercel 前端部署

### 为什么选择 Vercel？

[Vercel](https://vercel.com/) 是前端项目部署的首选平台，对 React/Vite 项目有原生支持：

| 特性 | 说明 |
|------|------|
| 零配置部署 | 自动检测 Vite 项目并配置构建命令 |
| 全球 CDN | 静态资源分发到全球边缘节点 |
| 自动 HTTPS | 免费 SSL 证书，自动续期 |
| Preview 部署 | 每个 PR 自动生成预览链接 |
| 免费方案 | 个人项目免费，足够日常使用 |

### 部署步骤

**第 1 步：导入 GitHub 仓库**

1. 登录 [Vercel 控制台](https://vercel.com/dashboard)
2. 点击「Add New...」→「Project」
3. 选择 GitHub 仓库 `howyc/howyc.github.io`
4. 配置项目设置：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Project Name | `howyc-github-io` | 项目名称 |
| Framework Preset | `Vite` | Vercel 自动检测，也可手动选择 |
| Root Directory | `fetch-mcp-demo` | 前端代码所在目录（非仓库根目录） |
| Build Command | `npm run build`（自动检测） | Vite 构建命令 |
| Output Directory | `dist`（自动检测） | Vite 默认输出目录 |

**第 2 步：配置环境变量**

在 Vercel 项目的「Settings」→「Environment Variables」中添加：

| 环境变量 | 值 | 说明 |
|----------|-----|------|
| `VITE_API_BASE_URL` | `https://howyc-github-io.onrender.com` | 后端 API 地址（Render 部署的 URL） |

::: tip VITE_ 前缀的作用
Vite 只会将以 `VITE_` 开头的环境变量暴露给前端代码。在代码中通过 `import.meta.env.VITE_API_BASE_URL` 访问。没有 `VITE_` 前缀的环境变量不会被打包到前端代码中，这是一种安全机制，防止敏感信息泄露到客户端。
:::

**第 3 步：部署**

1. 点击「Deploy」，Vercel 会自动执行 `npm install` + `npm run build`
2. 构建完成后，会生成一个 `.vercel.app` 域名的访问链接
3. 后续每次 push 到 `main` 分支，Vercel 会自动重新部署

## 4.5 vercel.json SPA 路由重写

### 为什么需要路由重写？

React 项目使用 React Router 实现客户端路由（如 `/login`、`/posts`）。这些路由只存在于前端 JavaScript 中，服务器并不知道这些路径。

当用户直接访问 `https://your-app.vercel.app/login` 时：
- **没有路由重写**：Vercel 会尝试查找 `/login` 对应的文件 → 找不到 → 返回 404
- **有路由重写**：Vercel 将所有请求重定向到 `index.html` → React Router 接管路由 → 正确显示页面

### 配置详解

来自 `fetch-mcp-demo/vercel.json`：

以下配置告诉 Vercel：无论用户访问什么路径，都返回 `index.html`，让 React Router 在客户端处理路由。

```json
{
  // rewrites 数组定义 URL 重写规则
  "rewrites": [
    {
      // source: 匹配所有路径（正则表达式 (.*) 匹配任意字符）
      "source": "/(.*)",
      // destination: 所有请求都指向 index.html（SPA 入口文件）
      "destination": "/index.html"
    }
  ]
}
```

### 工作原理

```
用户访问 https://your-app.vercel.app/login

没有 vercel.json：
  Vercel 查找 /login 文件 → 不存在 → 404 Not Found ❌

有 vercel.json：
  Vercel 匹配 /(.*) 规则 → 返回 /index.html
  → 浏览器加载 React 应用
  → React Router 解析 /login 路径
  → 渲染 LoginPage 组件 ✅
```

::: tip 类比理解
这和前端开发时 Vite 的 `historyApiFallback` 功能类似 — 开发服务器也会将所有路由请求回退到 `index.html`。`vercel.json` 的 rewrites 就是在生产环境实现同样的效果。
:::

## 4.6 GitHub Pages 文档站部署

### 部署架构

本项目的 VitePress 文档站通过 GitHub Actions 自动构建并部署到 GitHub Pages。每次 push 到 `main` 分支且修改了 `docs/` 目录下的文件时，会自动触发构建和部署。

```
开发者 push 代码 → GitHub Actions 触发
  → 安装依赖（npm install）
  → 构建 VitePress（npm run build）
  → 上传构建产物
  → 部署到 GitHub Pages
  → 用户访问 https://howyc.github.io/
```

### GitHub Actions 工作流详解

来自 `.github/workflows/deploy-docs.yml`：

以下工作流定义了文档站的自动构建和部署流程，包含两个 Job：`build`（构建）和 `deploy`（部署）。

```yaml
# 工作流名称，会显示在 GitHub Actions 页面
name: Deploy VitePress to GitHub Pages

# 触发条件：什么时候运行这个工作流
on:
  # 当代码 push 到 main 分支时触发
  push:
    branches:
      - main  # 只监听 main 分支
    paths:
      # 只有这些路径下的文件变更才触发（避免无关改动触发构建）
      - 'docs/**'                           # docs 目录下任何文件变更
      - '.github/workflows/deploy-docs.yml' # 工作流文件自身变更
  # 允许手动触发（在 GitHub Actions 页面点击 "Run workflow"）
  workflow_dispatch:

# 权限设置：工作流需要的 GitHub Token 权限
permissions:
  contents: read    # 读取仓库代码的权限
  pages: write      # 写入 GitHub Pages 的权限
  id-token: write   # 生成 OIDC Token 的权限（Pages 部署需要）

# 并发控制：防止多个部署同时运行
concurrency:
  group: pages                # 同一个 group 的工作流不会并行执行
  cancel-in-progress: false   # 不取消正在运行的部署（确保部署完整性）

# 定义工作流中的任务
jobs:
  # 第一个 Job：构建 VitePress 站点
  build:
    # 运行环境：Ubuntu 最新版
    runs-on: ubuntu-latest
    steps:
      # 步骤 1：检出代码（类似 git clone）
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 获取完整 git 历史（VitePress 的 lastUpdated 功能需要）

      # 步骤 2：安装 Node.js 20
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20  # 指定 Node.js 版本

      # 步骤 3：安装项目依赖
      - name: Install dependencies
        run: npm install           # 执行 npm install
        working-directory: docs    # 在 docs 目录下执行（因为 package.json 在 docs/ 中）

      # 步骤 4：构建 VitePress 站点
      - name: Build VitePress
        run: npm run build         # 执行构建命令，生成静态文件到 .vitepress/dist/
        working-directory: docs    # 在 docs 目录下执行

      # 步骤 5：上传构建产物（供 deploy Job 使用）
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist  # 上传 VitePress 构建输出目录

  # 第二个 Job：部署到 GitHub Pages
  deploy:
    # 配置部署环境
    environment:
      name: github-pages  # 环境名称
      url: ${{ steps.deployment.outputs.page_url }}  # 部署后的 URL
    needs: build           # 依赖 build Job（build 完成后才执行 deploy）
    runs-on: ubuntu-latest
    steps:
      # 步骤 1：部署到 GitHub Pages
      - name: Deploy to GitHub Pages
        id: deployment                    # 给步骤设置 ID，供上面的 url 引用
        uses: actions/deploy-pages@v4     # 使用官方 Pages 部署 Action
```

### GitHub Pages 配置

在使用此工作流之前，需要在 GitHub 仓库中启用 Pages：

1. 进入仓库「Settings」→「Pages」
2. Source 选择「GitHub Actions」（不是 Deploy from a branch）
3. 保存设置

::: tip 为什么用 GitHub Actions 而不是 Branch 部署？
传统的 GitHub Pages 从 `gh-pages` 分支部署，需要手动构建并推送。使用 GitHub Actions 部署更现代化：自动构建、无需维护额外分支、支持更复杂的构建流程。
:::

## 4.7 GitHub Actions CI/CD 自动部署前端

### 为什么需要 CI/CD 自动部署？

虽然 Vercel 可以通过 GitHub 集成自动部署，但如果你需要更精细的控制（如只在特定路径变更时部署），可以使用 GitHub Actions + Vercel CLI 实现自动部署。

### 工作流详解

来自 `.github/workflows/deploy-frontend.yml`：

以下工作流在前端代码变更时，自动使用 Vercel CLI 将前端项目部署到 Vercel。

```yaml
# 工作流名称
name: Deploy Frontend to Vercel

# 触发条件
on:
  # push 到 main 分支时触发
  push:
    branches:
      - main  # 只监听 main 分支
    paths:
      # 只有前端代码或工作流文件变更才触发
      - 'fetch-mcp-demo/**'                     # 前端项目目录下的文件变更
      - '.github/workflows/deploy-frontend.yml'  # 工作流文件自身变更
  # 允许手动触发
  workflow_dispatch:

# 定义部署任务
jobs:
  deploy:
    # 运行环境
    runs-on: ubuntu-latest
    steps:
      # 步骤 1：检出代码
      - uses: actions/checkout@v4

      # 步骤 2：全局安装 Vercel CLI（命令行工具）
      - name: Install Vercel CLI
        run: npm install -g vercel  # 安装 Vercel 命令行工具

      # 步骤 3：创建 Vercel 项目配置文件
      # Vercel CLI 需要 .vercel/project.json 来知道部署到哪个项目
      - name: Create .vercel/project.json
        env:
          # 从 GitHub Secrets 读取 Vercel 项目 ID
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          # 从 GitHub Secrets 读取 Vercel 组织 ID
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
        run: |
          # 创建 .vercel 目录
          mkdir -p .vercel
          # 生成 project.json 文件，包含项目 ID 和组织 ID
          # printf 用于格式化 JSON 字符串
          printf '{"projectId":"%s","orgId":"%s"}' "$VERCEL_PROJECT_ID" "$VERCEL_ORG_ID" > .vercel/project.json

      # 步骤 4：执行部署
      - name: Deploy to Vercel
        env:
          # 从 GitHub Secrets 读取 Vercel API Token
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod --yes --token=$VERCEL_TOKEN
        # --prod 部署到生产环境（而非预览环境）
        # --yes 自动确认所有提示
        # --token 使用 API Token 认证（无需交互式登录）
```

### 配置 GitHub Secrets

在 GitHub 仓库的「Settings」→「Secrets and variables」→「Actions」中添加以下 Secrets：

| Secret 名称 | 获取方式 | 说明 |
|-------------|---------|------|
| `VERCEL_TOKEN` | Vercel 控制台 → Settings → Tokens → Create | Vercel API 访问令牌 |
| `VERCEL_ORG_ID` | Vercel 控制台 → Settings → General → Your ID | Vercel 账户/组织 ID |
| `VERCEL_PROJECT_ID` | Vercel 项目 → Settings → General → Project ID | Vercel 项目 ID |

### 获取 Vercel Token 和 ID

**获取 VERCEL_TOKEN：**

1. 登录 [Vercel 控制台](https://vercel.com/account/tokens)
2. 点击「Create」创建新 Token
3. 设置名称（如 `github-actions`）和过期时间
4. 复制生成的 Token

**获取 VERCEL_ORG_ID 和 VERCEL_PROJECT_ID：**

1. 在本地项目目录运行 `vercel link`（首次需要登录）
2. 选择对应的 Vercel 项目
3. 命令会在 `.vercel/project.json` 中生成 `orgId` 和 `projectId`
4. 或者在 Vercel 控制台的项目设置页面直接查看

::: warning 安全提醒
- **永远不要**将 Token 和 ID 直接写在代码中或提交到 Git 仓库
- 使用 GitHub Secrets 存储敏感信息，工作流通过 <code v-pre>${{ secrets.XXX }}</code> 安全引用
- 定期轮换 Token，设置合理的过期时间
:::

## 4.8 部署检查清单

在部署之前，请确认以下所有配置项都已正确设置。

### TiDB Cloud 数据库

- [ ] 已注册 TiDB Cloud 账号
- [ ] 已创建 Serverless Cluster（区域：us-east-1）
- [ ] 已记录连接信息：Host、Port、Username、Password
- [ ] 已验证数据库连接可用

### Render 后端环境变量

| 环境变量 | 是否配置 | 示例值 |
|----------|---------|--------|
| `SPRING_PROFILES_ACTIVE` | ☐ | `prod` |
| `DB_HOST` | ☐ | `gateway01.us-east-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | ☐ | `4000` |
| `DB_NAME` | ☐ | `test` |
| `DB_USERNAME` | ☐ | `3QEwxwnQkxdTGA7.root` |
| `DB_PASSWORD` | ☐ | （你的 TiDB Cloud 密码） |
| `JWT_SECRET` | ☐ | （自定义 Base64 编码字符串） |

### Render 项目配置

- [ ] Runtime 选择 `Docker`
- [ ] Root Directory 设置为 `java-backend`
- [ ] Instance Type 选择 `Free`
- [ ] 已确认 `java-backend/Dockerfile` 存在

### Vercel 前端环境变量

| 环境变量 | 是否配置 | 示例值 |
|----------|---------|--------|
| `VITE_API_BASE_URL` | ☐ | `https://howyc-github-io.onrender.com` |

### Vercel 项目配置

- [ ] Root Directory 设置为 `fetch-mcp-demo`
- [ ] Framework Preset 选择 `Vite`
- [ ] `fetch-mcp-demo/vercel.json` 已配置 SPA 路由重写

### GitHub Secrets（CI/CD 自动部署）

| Secret | 是否配置 | 用途 |
|--------|---------|------|
| `VERCEL_TOKEN` | ☐ | Vercel API 访问令牌 |
| `VERCEL_ORG_ID` | ☐ | Vercel 账户 ID |
| `VERCEL_PROJECT_ID` | ☐ | Vercel 项目 ID |

### GitHub Pages 配置

- [ ] 仓库 Settings → Pages → Source 选择「GitHub Actions」
- [ ] `.github/workflows/deploy-docs.yml` 已提交到仓库
- [ ] `.github/workflows/deploy-frontend.yml` 已提交到仓库

### 部署后验证

- [ ] 后端 API 可访问：`https://howyc-github-io.onrender.com`（首次可能需要等待冷启动）
- [ ] 前端页面可访问：Vercel 生成的 `.vercel.app` 域名
- [ ] 文档站可访问：`https://howyc.github.io/`
- [ ] 前端能正常调用后端 API（登录、注册、帖子 CRUD）
- [ ] 刷新前端页面不会出现 404（vercel.json 路由重写生效）

## 4.9 常见部署问题及解决方案

### 问题 1：Render 免费版重新部署后数据丢失

**现象**：每次 Render 重新部署后，之前注册的用户和发布的帖子都消失了。

**原因**：Render 免费版的磁盘存储是临时的（Ephemeral Storage）。每次重新部署会创建新的容器，旧容器的文件系统数据会被清除。如果使用 SQLite（文件数据库），数据文件会随容器销毁而丢失。

**解决方案**：使用外部数据库（如 TiDB Cloud）替代 SQLite。本项目通过 `SPRING_PROFILES_ACTIVE=prod` 切换到 TiDB Cloud，数据存储在云端数据库中，不受容器重启影响。

```
开发环境：SQLite（本地文件 ./data/app.db）→ 数据随文件存在
生产环境：TiDB Cloud（云端数据库）→ 数据持久化，不受部署影响 ✅
```

### 问题 2：Vercel 前端页面刷新后 404

**现象**：在 Vercel 部署的前端应用中，直接访问 `/login` 或 `/posts` 等路由时返回 404 页面。

**原因**：React Router 使用客户端路由（History API），这些路径只存在于前端 JavaScript 中。Vercel 服务器不知道这些路径，尝试查找对应的静态文件时找不到。

**解决方案**：在 `fetch-mcp-demo/vercel.json` 中配置 SPA 路由重写：

```json
{
  // 将所有路径重写到 index.html，让 React Router 处理路由
  "rewrites": [
    {
      // 匹配所有路径
      "source": "/(.*)",
      // 统一返回 SPA 入口文件
      "destination": "/index.html"
    }
  ]
}
```

### 问题 3：CORS 跨域请求被拒绝

**现象**：前端调用后端 API 时，浏览器控制台报错 `Access to fetch at 'https://xxx.onrender.com' from origin 'https://xxx.vercel.app' has been blocked by CORS policy`。

**原因**：前端和后端部署在不同域名下（Vercel vs Render），浏览器的同源策略会阻止跨域请求。

**解决方案**：后端需要配置 CORS 允许前端域名访问。本项目在 `CorsConfig.java` 中已配置：

```java
// 来自 java-backend/src/.../config/CorsConfig.java
// CORS 配置类，允许前端跨域访问后端 API
@Configuration  // 标记为 Spring 配置类
public class CorsConfig implements WebMvcConfigurer {  // 实现 Web MVC 配置接口
    @Override
    public void addCorsMappings(CorsRegistry registry) {  // 重写 CORS 映射方法
        registry.addMapping("/**")           // 对所有路径生效
                .allowedOriginPatterns("*")  // 允许所有来源（生产环境建议限制为具体域名）
                .allowedMethods("*")         // 允许所有 HTTP 方法（GET、POST、PUT、DELETE 等）
                .allowedHeaders("*")         // 允许所有请求头
                .allowCredentials(true);     // 允许携带 Cookie/认证信息
    }
}
```

::: warning 安全建议
生产环境中，`allowedOriginPatterns("*")` 应该替换为具体的前端域名（如 `"https://your-app.vercel.app"`），避免任意网站都能调用你的 API。
:::

### 问题 4：环境变量未生效

**现象**：部署后应用行为不符合预期，例如后端仍然连接 SQLite 而非 TiDB Cloud，或前端 API 地址指向 localhost。

**可能原因及解决方案**：

**后端环境变量未生效：**

| 检查项 | 说明 |
|--------|------|
| `SPRING_PROFILES_ACTIVE` 是否设置为 `prod` | 没有这个变量，Spring Boot 会加载默认的 `application.properties`（SQLite 配置） |
| 环境变量名是否拼写正确 | `DB_HOST` 不是 `DATABASE_HOST`，注意大小写 |
| Render 环境变量是否保存 | 添加环境变量后需要点击「Save Changes」并重新部署 |
| 变量值是否包含多余空格 | 复制粘贴时可能带入空格，导致连接失败 |

**前端环境变量未生效：**

| 检查项 | 说明 |
|--------|------|
| 变量名是否以 `VITE_` 开头 | Vite 只暴露 `VITE_` 前缀的变量给前端代码 |
| 是否在 Vercel 中配置 | `.env.local` 只在本地开发生效，生产环境需要在 Vercel 控制台配置 |
| 修改后是否重新部署 | 环境变量修改后需要触发重新部署才能生效 |
| 代码中访问方式是否正确 | 使用 `import.meta.env.VITE_API_BASE_URL` 而非 `process.env` |

### 问题 5：Render 冷启动慢

**现象**：一段时间没有访问后，首次请求后端 API 需要等待 30-60 秒。

**原因**：Render 免费版实例在 15 分钟无请求后会自动休眠（Spin Down）。下次请求时需要重新启动容器（Cold Start），Spring Boot 应用启动需要一定时间。

**缓解方案**：

1. **接受冷启动**：免费方案的限制，首次请求慢是正常的
2. **使用定时请求**：通过外部服务（如 [UptimeRobot](https://uptimerobot.com/)）每 14 分钟 ping 一次后端 URL，保持实例活跃
3. **升级付费方案**：Render 付费方案的实例不会休眠

### 问题 6：GitHub Actions 工作流未触发

**现象**：push 代码后 GitHub Actions 没有自动运行。

**排查步骤**：

1. **检查分支**：工作流配置了 `branches: [main]`，确认你 push 到的是 `main` 分支
2. **检查路径**：工作流配置了 `paths` 过滤，确认修改的文件在监听路径内
   - `deploy-docs.yml` 只监听 `docs/**` 的变更
   - `deploy-frontend.yml` 只监听 `fetch-mcp-demo/**` 的变更
3. **检查权限**：确认仓库 Settings → Actions → General 中允许运行工作流
4. **手动触发**：两个工作流都配置了 `workflow_dispatch`，可以在 Actions 页面手动触发测试

## 总结

本章介绍了全栈项目的完整部署流程：

| 组件 | 部署平台 | 关键配置 |
|------|---------|---------|
| 数据库 | TiDB Cloud | Serverless Cluster，SSL 连接 |
| 后端 | Render | Docker Runtime，7 个环境变量 |
| 前端 | Vercel | Root Directory，1 个环境变量，SPA 路由重写 |
| 文档站 | GitHub Pages | GitHub Actions 自动构建部署 |
| CI/CD | GitHub Actions | Vercel CLI + 3 个 Secrets |

部署的核心思路是**环境隔离**：通过 Spring Profiles 和环境变量，同一套代码在开发和生产环境使用不同的配置。开发时用 SQLite + localhost，部署时切换到 TiDB Cloud + 云端 URL，代码无需任何修改。

更多项目细节请参考 [fetch-mcp-demo 项目详解](/projects/fetch-mcp-demo)，Java 基础语法请参考 [Java 入门笔记](/notes/java-zero-to-one)。