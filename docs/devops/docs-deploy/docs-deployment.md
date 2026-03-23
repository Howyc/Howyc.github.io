---
outline: deep
---

# 第 7 章：文档站部署

> 本章讲解如何通过 GitHub Actions 将 VitePress 文档站自动部署到 GitHub Pages。
>
> 项目详情：参考 [learn-fullstack 项目详解](/projects/learn-fullstack) 了解完整项目架构。

## 7.1 部署架构

本项目的 VitePress 文档站通过 GitHub Actions 自动构建并部署到 GitHub Pages。每次 push 到 `main` 分支且修改了 `docs/` 目录下的文件时，会自动触发构建和部署。

```
开发者 push 代码 → GitHub Actions 触发
  → 安装依赖（npm install）
  → 构建 VitePress（npm run build）
  → 上传构建产物
  → 部署到 GitHub Pages
  → 用户访问 https://howyc.github.io/
```

## 7.2 GitHub Actions 工作流详解

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

## 7.3 GitHub Pages 配置

在使用此工作流之前，需要在 GitHub 仓库中启用 Pages：

1. 进入仓库「Settings」→「Pages」
2. Source 选择「GitHub Actions」（不是 Deploy from a branch）
3. 保存设置

::: tip 为什么用 GitHub Actions 而不是 Branch 部署？
传统的 GitHub Pages 从 `gh-pages` 分支部署，需要手动构建并推送。使用 GitHub Actions 部署更现代化：自动构建、无需维护额外分支、支持更复杂的构建流程。
:::

## 7.4 文档站部署检查清单

- [ ] 仓库 Settings → Pages → Source 选择「GitHub Actions」
- [ ] `.github/workflows/deploy-docs.yml` 已提交到仓库
- [ ] 文档站可访问：`https://howyc.github.io/`

## 7.5 常见问题

### 问题：GitHub Actions 文档站部署工作流未触发

**现象**：push 文档代码后 GitHub Actions 没有自动运行。

**排查步骤**：

1. **检查分支**：工作流配置了 `branches: [main]`，确认你 push 到的是 `main` 分支
2. **检查路径**：`deploy-docs.yml` 只监听 `docs/**` 的变更，确认修改的文件在此路径内
3. **检查权限**：确认仓库 Settings → Actions → General 中允许运行工作流
4. **手动触发**：工作流配置了 `workflow_dispatch`，可以在 Actions 页面手动触发测试

更多项目细节请参考 [learn-fullstack 项目详解](/projects/learn-fullstack)。