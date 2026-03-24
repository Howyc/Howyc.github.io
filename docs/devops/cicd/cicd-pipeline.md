---
outline: deep
---

# CI/CD 持续集成与部署

> 本章讲解项目的 CI/CD 流水线设计，包括 GitHub Actions 自动部署前端到 Vercel、后端到 Render 的完整流程。
>
> 前置阅读：建议先阅读 [前端部署](/devops/frontend-deploy/frontend-deployment) 和 [后端部署](/devops/backend-deploy/backend-deployment)。

## CI/CD 是什么？

CI/CD 是两个概念的组合：

| 概念 | 全称 | 含义 | 类比 |
|------|------|------|------|
| CI | Continuous Integration | 代码提交后自动构建、测试 | 每次提交代码自动跑 `npm run build` |
| CD | Continuous Deployment | 测试通过后自动部署到生产环境 | 构建成功后自动发布到线上 |

```
开发者 push 代码 → GitHub Actions 触发 → 构建 → 测试 → 部署
```

## 项目 CI/CD 架构

本项目使用 GitHub Actions 作为 CI/CD 平台，根据代码变更路径自动触发对应的部署流程：

```
代码推送到 main 分支
    │
    ├── learn-fullstack/** 变更 → 前端部署到 Vercel
    ├── java-backend/** 变更   → 后端部署到 Render
    └── docs/** 变更           → 文档站由 GitHub Pages 自动部署
```

## 前端部署流水线

`.github/workflows/deploy-frontend.yml`：

```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'learn-fullstack/**'           # 只在前端代码变更时触发
      - '.github/workflows/deploy-frontend.yml'
  workflow_dispatch:                     # 支持手动触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: learn-fullstack
    steps:
      - uses: actions/checkout@v4       # 拉取代码

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci                     # 安装依赖（使用 lock 文件）

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel config        # 拉取 Vercel 项目配置
        run: vercel pull --yes --environment=production --token=$VERCEL_TOKEN

      - name: Build locally             # 本地构建
        run: vercel build --prod --token=$VERCEL_TOKEN

      - name: Deploy prebuilt           # 部署预构建产物
        run: vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

### 关键步骤解析

| 步骤 | 作用 | 类比 |
|------|------|------|
| `paths` 过滤 | 只在前端代码变更时触发，避免无关部署 | Git hook 的路径过滤 |
| `npm ci` | 根据 lock 文件精确安装依赖 | 比 `npm install` 更快更可靠 |
| `vercel pull` | 拉取 Vercel 项目配置和环境变量 | 类似 `git pull` 拉取远程配置 |
| `vercel build --prod` | 在 CI 环境中构建 | 等同于 `npm run build` |
| `vercel deploy --prebuilt` | 部署已构建的产物 | 跳过远程构建，直接上传 |

### 需要配置的 Secrets

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 获取方式 |
|-------------|---------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Vercel Dashboard → Settings → General → Your ID |
| `VERCEL_PROJECT_ID` | Vercel 项目 → Settings → General → Project ID |

## 后端部署流水线

`.github/workflows/deploy-backend.yml`：

```yaml
name: Deploy Backend to Render

on:
  push:
    branches: [main]
    paths:
      - 'java-backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"
```

### Render Deploy Hook

Render 提供 Deploy Hook（部署钩子），是一个 URL，向它发送 POST 请求就会触发重新部署：

**获取 Deploy Hook：**

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 进入后端服务 → Settings
3. 找到「Deploy Hook」部分
4. 点击「Create Deploy Hook」，复制生成的 URL
5. 将 URL 添加到 GitHub Secrets：`RENDER_DEPLOY_HOOK_URL`

```
GitHub push → Actions 触发 → curl POST Deploy Hook → Render 拉取最新代码 → Docker 构建 → 部署
```

::: tip 为什么用 Deploy Hook 而不是直接构建？
Render 本身就支持 Docker 构建和部署，我们只需要通知它「有新代码了，请重新部署」。这样 CI 流水线非常轻量，构建工作交给 Render 完成。
:::

## 部署流程对比

| 对比项 | 前端（Vercel） | 后端（Render） |
|--------|---------------|---------------|
| 触发条件 | `learn-fullstack/**` 变更 | `java-backend/**` 变更 |
| 构建位置 | GitHub Actions 中构建 | Render 服务器构建 |
| 部署方式 | 上传预构建产物 | Docker 镜像构建 |
| 构建时间 | ~1-2 分钟 | ~3-5 分钟 |
| 回滚方式 | Vercel Dashboard 一键回滚 | Render Dashboard 选择历史版本 |

## GitHub Actions 核心概念

```yaml
name: 工作流名称          # 在 Actions 页面显示的名称

on:                       # 触发条件
  push:
    branches: [main]      # 只在 main 分支触发
    paths: ['src/**']     # 只在指定路径变更时触发
  workflow_dispatch:       # 允许手动触发

jobs:                     # 任务定义
  job-name:
    runs-on: ubuntu-latest  # 运行环境
    steps:                  # 步骤列表
      - uses: actions/checkout@v4  # 使用社区 Action
      - name: 步骤名称
        run: echo "执行命令"       # 运行 Shell 命令
```

| 概念 | 说明 | 类比 |
|------|------|------|
| Workflow | 一个 YAML 文件定义的自动化流程 | 一个脚本文件 |
| Job | 工作流中的一个任务 | 脚本中的一个函数 |
| Step | 任务中的一个步骤 | 函数中的一行代码 |
| Action | 可复用的步骤（社区提供） | npm 包 |
| Secret | 加密的环境变量 | `.env` 文件中的敏感信息 |

## 手动触发部署

除了代码推送自动触发，也可以手动触发部署：

1. 进入 GitHub 仓库 → Actions 页面
2. 选择对应的 Workflow
3. 点击「Run workflow」→ 选择分支 → 确认

这在以下场景很有用：
- 环境变量更新后需要重新部署
- 排查部署问题时手动触发
- 不涉及代码变更但需要重新部署
