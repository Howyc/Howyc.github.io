# 实施计划：VitePress 个人知识库重构

## 概述

将 Howyc.dev 从"按输出形式分类"重构为"按知识领域分类"的个人知识库。按照设计文档的迁移流程，依次完成：创建新目录结构 → 创建领域首页 → 迁移内容文件 → 更新 VitePress 配置 → 更新首页 → 迁移测试文件 → 清理旧目录 → 验证构建。

## Tasks

- [x] 1. 创建知识领域目录结构
  - [x] 1.1 创建前端领域目录及子分类
    - 创建 `docs/frontend/` 目录
    - 创建子分类目录：`docs/frontend/react/`、`docs/frontend/typescript/`、`docs/frontend/engineering/`
    - _需求：1.1, 1.3_

  - [x] 1.2 创建后端领域目录及子分类
    - 创建 `docs/backend/` 目录
    - 创建子分类目录：`docs/backend/java/`、`docs/backend/spring-boot/`
    - _需求：1.1, 1.4_

  - [x] 1.3 创建 DevOps 领域目录及子分类
    - 创建 `docs/devops/` 目录
    - 创建子分类目录：`docs/devops/frontend-deploy/`、`docs/devops/backend-deploy/`、`docs/devops/docs-deploy/`
    - _需求：1.1, 1.5_

  - [x] 1.4 创建工具领域目录及子分类
    - 创建 `docs/tools/` 目录
    - 创建子分类目录：`docs/tools/openclaw/`
    - _需求：1.1, 1.6_

  - [x] 1.5 创建各知识领域的 index.md 首页
    - 创建 `docs/frontend/index.md`，包含前端领域简介、React 开发 / TypeScript / 工程化实践子分类及文章链接
    - 创建 `docs/backend/index.md`，包含后端领域简介、Java 语言 / Spring Boot 框架子分类及文章链接
    - 创建 `docs/devops/index.md`，包含 DevOps 领域简介、前端部署 / 后端部署 / 文档站部署子分类及文章链接
    - 创建 `docs/tools/index.md`，包含工具领域简介、OpenClaw / AIGC 子分类及文章链接
    - 参考设计文档中 Index_Page 组件的示例格式
    - _需求：1.2, 4.4, 4.5_

- [x] 2. 迁移内容文件到新目录
  - [x] 2.1 迁移笔记文件到后端领域
    - 将 `docs/notes/java-zero-to-one.md` 移动到 `docs/backend/java/java-zero-to-one.md`
    - 将 `docs/notes/java-for-frontend.md` 移动到 `docs/backend/spring-boot/java-for-frontend.md`
    - 不修改文件内容
    - _需求：2.1, 2.2, 2.13_

  - [x] 2.2 迁移教程文件到前端领域
    - 将 `docs/tutorials/project-setup.md` 移动到 `docs/frontend/engineering/project-setup.md`
    - 将 `docs/tutorials/frontend-knowledge.md` 移动到 `docs/frontend/react/frontend-knowledge.md`
    - 不修改文件内容
    - _需求：2.3, 2.4, 2.13_

  - [x] 2.3 迁移教程文件到后端领域
    - 将 `docs/tutorials/backend-knowledge.md` 移动到 `docs/backend/spring-boot/backend-knowledge.md`
    - 不修改文件内容
    - _需求：2.6, 2.13_

  - [x] 2.4 迁移教程文件到 DevOps 领域
    - 将 `docs/tutorials/frontend-deployment.md` 移动到 `docs/devops/frontend-deploy/frontend-deployment.md`
    - 将 `docs/tutorials/backend-deployment.md` 移动到 `docs/devops/backend-deploy/backend-deployment.md`
    - 将 `docs/tutorials/docs-deployment.md` 移动到 `docs/devops/docs-deploy/docs-deployment.md`
    - 不修改文件内容
    - _需求：2.5, 2.7, 2.8, 2.13_

  - [x] 2.5 迁移教程文件到工具领域
    - 将 `docs/tutorials/openclaw-guide.md` 移动到 `docs/tools/openclaw/openclaw-guide.md`
    - 将 `docs/tutorials/openclaw-installation-journey.md` 移动到 `docs/tools/openclaw/openclaw-installation-journey.md`
    - 将 `docs/tutorials/aigc-learning-path.md` 移动到 `docs/tools/aigc-learning-path.md`
    - 不修改文件内容
    - _需求：2.9, 2.10, 2.13_

  - [x] 2.6 确认保留原位的文件
    - 确认 `docs/projects/fetch-mcp-demo.md` 保留在原位
    - 确认 `docs/blog/why-java.md` 保留在原位
    - _需求：2.11, 2.12_

- [x] 3. 检查点 - 验证文件迁移
  - 确认所有文件已正确迁移到新位置，确认所有测试通过，如有问题请向用户确认。

- [x] 4. 更新 VitePress 配置
  - [x] 4.1 更新 `docs/.vitepress/config.mts` 导航栏配置
    - 将 nav 更新为：首页、前端、后端、DevOps、工具、项目、博客
    - 参考设计文档 3.1 节的 nav 配置
    - _需求：3.1, 3.3, 5.1_

  - [x] 4.2 更新 `docs/.vitepress/config.mts` 侧边栏配置
    - 删除旧的 `/notes/` 和 `/tutorials/` 侧边栏配置
    - 添加 `/frontend/`、`/backend/`、`/devops/`、`/tools/` 侧边栏配置
    - 更新 `/projects/` 和 `/blog/` 侧边栏配置
    - 参考设计文档 3.2 节的完整 sidebar 配置
    - _需求：3.2, 3.4, 3.5, 3.6, 3.7, 5.2_

  - [x] 4.3 更新 `docs/.vitepress/config.mts` 基础配置
    - 更新 `description` 字段为 `'前端工程师的个人知识库 — React · Spring Boot · DevOps · 工程实践'`
    - 保留 `lang`、`base`、`search`、`editLink`、`markdown.lineNumbers`、`ignoreDeadLinks` 等配置不变
    - _需求：5.3, 5.4_

- [x] 5. 更新首页
  - [x] 5.1 更新 `docs/index.md` 首页内容
    - 更新 hero 区域：text 改为"前端工程师知识库"，tagline 更新为体现知识库定位
    - 更新 actions 按钮：链接到前端工程和后端开发
    - 更新 features 区域：展示六个知识领域的概览卡片（前端工程、后端开发、DevOps、工具与效率、项目实战、思考与总结），每个卡片包含 link 指向对应领域首页
    - 参考设计文档第 4 节的首页组件设计
    - _需求：4.1, 4.2, 4.3_

  - [x] 5.2 更新 `docs/projects/index.md` 和 `docs/blog/index.md`
    - 检查并更新项目首页和博客首页内容，确保与新知识库结构一致
    - _需求：1.7_

- [x] 6. 迁移测试文件并更新测试
  - [x] 6.1 创建新测试文件 `docs/__tests__/knowledge-base.test.ts`
    - 将测试文件从 `docs/tutorials/__tests__/tutorial-docs.test.ts` 迁移到 `docs/__tests__/knowledge-base.test.ts`
    - 更新所有文件路径引用以匹配新目录结构
    - 更新 VitePress 配置检查以匹配新的 nav/sidebar 结构
    - 更新关键词覆盖测试中的文件路径
    - 更新跨文档链接测试
    - _需求：6.3_

  - [ ]* 6.2 编写属性测试：目录结构完整性
    - **属性 1：目录结构完整性**
    - 验证所有知识领域目录及子分类目录存在，且每个一级知识领域目录下包含 `index.md`
    - 安装 fast-check 依赖
    - **验证需求：1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**

  - [ ]* 6.3 编写属性测试：迁移映射正确性
    - **属性 2：迁移映射正确性**
    - 验证所有迁移映射的目标路径文件存在，且源路径文件不再存在（保留原位的除外）
    - **验证需求：2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12**

  - [ ]* 6.4 编写属性测试：侧边栏配置完整性
    - **属性 4：侧边栏配置完整性**
    - 验证每个知识领域路径在 sidebar 配置中存在对应的键，且包含正确的分组和文章链接
    - **验证需求：3.2, 3.4, 3.5, 3.6, 3.7, 5.2**

  - [ ]* 6.5 编写属性测试：首页特性卡片覆盖
    - **属性 5：首页特性卡片覆盖**
    - 验证首页 features 区域包含所有知识领域的概览卡片，且 link 指向对应领域首页
    - **验证需求：4.2**

  - [ ]* 6.6 编写属性测试：领域首页内容完整性
    - **属性 6：领域首页内容完整性**
    - 验证每个知识领域的 index.md 包含简要介绍和所有子分类及文章链接
    - **验证需求：4.4, 4.5**

- [x] 7. 清理旧目录
  - [x] 7.1 删除旧的 notes 和 tutorials 目录
    - 删除 `docs/notes/` 目录（所有文件已迁移）
    - 删除 `docs/tutorials/` 目录（所有文件已迁移，测试文件已迁移到 `docs/__tests__/`）
    - _需求：6.1, 6.2_

- [x] 8. 最终检查点 - 验证构建和测试
  - 运行 `vitest --run` 确认所有测试通过
  - 运行 `vitepress build` 确认站点构建成功
  - 确认所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号以确保可追溯性
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
- 检查点确保增量验证，避免问题累积
- 迁移过程中不修改任何 `.md` 文件的正文内容（零内容修改原则）
