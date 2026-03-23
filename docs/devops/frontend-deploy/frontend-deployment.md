---
outline: deep
---

# 第 3 章：前端部署

> 本章讲解如何将 React 前端项目部署到 Vercel，并通过 GitHub Actions 实现自动化部署。所有配置文件来自项目真实源码，每行配置都有中文注释。
>
> 前置阅读：建议先阅读 [前端知识点详解](/frontend/react/frontend-knowledge) 了解前端项目结构，再阅读本章效果更佳。
> 项目详情：参考 [learn-fullstack 项目详解](/projects/learn-fullstack) 了解完整项目架构。

## 3.1 Vercel 前端部署

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
| Root Directory | `learn-fullstack` | 前端代码所在目录（非仓库根目录） |
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

## 3.2 vercel.json SPA 路由重写

### 为什么需要路由重写？

React 项目使用 React Router 实现客户端路由（如 `/login`、`/posts`）。这些路由只存在于前端 JavaScript 中，服务器并不知道这些路径。

当用户直接访问 `https://your-app.vercel.app/login` 时：
- **没有路由重写**：Vercel 会尝试查找 `/login` 对应的文件 → 找不到 → 返回 404
- **有路由重写**：Vercel 将所有请求重定向到 `index.html` → React Router 接管路由 → 正确显示页面

### 配置详解

来自 `learn-fullstack/vercel.json`：

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

## 3.3 GitHub Actions 自动部署前端

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
      - 'learn-fullstack/**'                     # 前端项目目录下的文件变更
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

## 3.4 前端部署检查清单

### Vercel 项目配置

- [ ] Root Directory 设置为 `learn-fullstack`
- [ ] Framework Preset 选择 `Vite`
- [ ] `learn-fullstack/vercel.json` 已配置 SPA 路由重写

### Vercel 环境变量

| 环境变量 | 是否配置 | 示例值 |
|----------|---------|--------|
| `VITE_API_BASE_URL` | ☐ | `https://howyc-github-io.onrender.com` |

### GitHub Secrets（CI/CD 自动部署）

| Secret | 是否配置 | 用途 |
|--------|---------|------|
| `VERCEL_TOKEN` | ☐ | Vercel API 访问令牌 |
| `VERCEL_ORG_ID` | ☐ | Vercel 账户 ID |
| `VERCEL_PROJECT_ID` | ☐ | Vercel 项目 ID |

### 部署后验证

- [ ] 前端页面可访问：Vercel 生成的 `.vercel.app` 域名
- [ ] 刷新前端页面不会出现 404（vercel.json 路由重写生效）
- [ ] 前端能正常调用后端 API（登录、注册、帖子 CRUD）
- [ ] 环境变量 `VITE_API_BASE_URL` 指向正确的后端地址

## 3.5 前端部署常见问题

### 问题 1：Vercel 前端页面刷新后 404

**现象**：在 Vercel 部署的前端应用中，直接访问 `/login` 或 `/posts` 等路由时返回 404 页面。

**原因**：React Router 使用客户端路由（History API），这些路径只存在于前端 JavaScript 中。Vercel 服务器不知道这些路径，尝试查找对应的静态文件时找不到。

**解决方案**：在 `learn-fullstack/vercel.json` 中配置 SPA 路由重写：

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

### 问题 2：前端环境变量未生效

**现象**：部署后前端 API 地址指向 localhost，或者环境变量读取为 undefined。

**排查步骤**：

| 检查项 | 说明 |
|--------|------|
| 变量名是否以 `VITE_` 开头 | Vite 只暴露 `VITE_` 前缀的变量给前端代码 |
| 是否在 Vercel 中配置 | `.env.local` 只在本地开发生效，生产环境需要在 Vercel 控制台配置 |
| 修改后是否重新部署 | 环境变量修改后需要触发重新部署才能生效 |
| 代码中访问方式是否正确 | 使用 `import.meta.env.VITE_API_BASE_URL` 而非 `process.env` |

### 问题 3：GitHub Actions 前端部署工作流未触发

**现象**：push 前端代码后 GitHub Actions 没有自动运行。

**排查步骤**：

1. **检查分支**：工作流配置了 `branches: [main]`，确认你 push 到的是 `main` 分支
2. **检查路径**：`deploy-frontend.yml` 只监听 `learn-fullstack/**` 的变更，确认修改的文件在此路径内
3. **检查权限**：确认仓库 Settings → Actions → General 中允许运行工作流
4. **手动触发**：工作流配置了 `workflow_dispatch`，可以在 Actions 页面手动触发测试

更多项目细节请参考 [learn-fullstack 项目详解](/projects/learn-fullstack)。