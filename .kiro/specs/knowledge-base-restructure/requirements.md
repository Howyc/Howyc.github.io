# 需求文档：VitePress 个人知识库重构

## 简介

将现有的 VitePress 个人文档站（Howyc.dev）从"按输出形式分类"（博客、笔记、项目、教程）升级为"按知识领域分类"的大型个人知识库。知识库围绕前端工程师的知识体系组织，采用数字花园（Digital Garden）风格，强调知识的关联性和成长性。不修改现有内容文件本身，仅通过移动文件位置、重新分类和更新配置来完成重构。

## 术语表

- **Knowledge_Base**: 重构后的 VitePress 知识库站点，即 Howyc.dev
- **Config_Generator**: 负责生成 VitePress 配置文件（`config.mts`）的模块，包含导航栏、侧边栏、搜索等配置
- **Content_Migrator**: 负责将现有内容文件从旧目录结构移动到新目录结构的过程
- **Nav_System**: Knowledge_Base 的导航系统，包含顶部导航栏（nav）和侧边栏（sidebar）
- **Knowledge_Domain**: 按知识领域划分的一级分类目录，如前端、后端、DevOps 等
- **Index_Page**: 每个 Knowledge_Domain 下的首页（`index.md`），提供该领域的内容概览和导航

## 需求

### 需求 1：知识库目录结构设计

**用户故事：** 作为前端工程师，我希望知识库按知识领域组织内容，以便我能按主题快速定位和浏览相关知识。

#### 验收标准

1. THE Knowledge_Base SHALL 采用以下一级知识领域目录结构：`/frontend/`（前端工程）、`/backend/`（后端开发）、`/devops/`（部署与运维）、`/tools/`（工具与效率）、`/projects/`（项目实战）、`/blog/`（思考与总结）
2. WHEN 一级知识领域目录被创建时，THE Knowledge_Base SHALL 在每个一级目录下创建一个 `index.md` 文件作为该领域的 Index_Page
3. THE Knowledge_Base SHALL 在 `/frontend/` 目录下包含以下子分类：`react/`（React 开发）、`typescript/`（TypeScript）、`engineering/`（工程化实践）
4. THE Knowledge_Base SHALL 在 `/backend/` 目录下包含以下子分类：`java/`（Java 语言）、`spring-boot/`（Spring Boot 框架）
5. THE Knowledge_Base SHALL 在 `/devops/` 目录下包含以下子分类：`frontend-deploy/`（前端部署）、`backend-deploy/`（后端部署）、`docs-deploy/`（文档站部署）
6. THE Knowledge_Base SHALL 在 `/tools/` 目录下包含以下子分类：`openclaw/`（OpenClaw 工具）
7. THE Knowledge_Base SHALL 保留 `/projects/` 和 `/blog/` 作为独立的一级目录，不做子分类拆分

### 需求 2：内容迁移映射

**用户故事：** 作为前端工程师，我希望现有内容被正确归类到对应的知识领域中，以便知识库结构清晰且内容不丢失。

#### 验收标准

1. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/notes/java-zero-to-one.md` 移动到 `docs/backend/java/java-zero-to-one.md`
2. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/notes/java-for-frontend.md` 移动到 `docs/backend/spring-boot/java-for-frontend.md`
3. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/tutorials/project-setup.md` 移动到 `docs/frontend/engineering/project-setup.md`
4. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/tutorials/frontend-knowledge.md` 移动到 `docs/frontend/react/frontend-knowledge.md`
5. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/tutorials/frontend-deployment.md` 移动到 `docs/devops/frontend-deploy/frontend-deployment.md`
6. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/tutorials/backend-knowledge.md` 移动到 `docs/backend/spring-boot/backend-knowledge.md`
7. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/tutorials/backend-deployment.md` 移动到 `docs/devops/backend-deploy/backend-deployment.md`
8. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/tutorials/docs-deployment.md` 移动到 `docs/devops/docs-deploy/docs-deployment.md`
9. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/tutorials/openclaw-guide.md` 移动到 `docs/tools/openclaw/openclaw-guide.md`
10. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/tutorials/openclaw-installation-journey.md` 移动到 `docs/tools/openclaw/openclaw-installation-journey.md`
11. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/projects/fetch-mcp-demo.md` 保留在 `docs/projects/fetch-mcp-demo.md`
12. WHEN Content_Migrator 执行迁移时，THE Content_Migrator SHALL 将 `docs/blog/why-java.md` 保留在 `docs/blog/why-java.md`
13. THE Content_Migrator SHALL 保留所有内容文件的原始内容不做修改

### 需求 3：导航系统配置

**用户故事：** 作为知识库访问者，我希望通过清晰的导航栏和侧边栏浏览知识库，以便快速找到感兴趣的内容。

#### 验收标准

1. THE Nav_System SHALL 在顶部导航栏包含以下项目：首页、前端、后端、DevOps、工具、项目、博客
2. THE Nav_System SHALL 为每个 Knowledge_Domain 配置独立的侧边栏，显示该领域下的所有子分类和文章
3. WHEN 用户点击顶部导航栏的某个 Knowledge_Domain 时，THE Nav_System SHALL 导航到该领域的 Index_Page
4. THE Nav_System SHALL 在 `/frontend/` 侧边栏中按子分类分组显示文章：React 开发、TypeScript、工程化实践
5. THE Nav_System SHALL 在 `/backend/` 侧边栏中按子分类分组显示文章：Java 语言、Spring Boot 框架
6. THE Nav_System SHALL 在 `/devops/` 侧边栏中按子分类分组显示文章：前端部署、后端部署、文档站部署
7. THE Nav_System SHALL 在 `/tools/` 侧边栏中按子分类分组显示文章：OpenClaw

### 需求 4：首页与领域首页更新

**用户故事：** 作为知识库访问者，我希望首页和各领域首页能清晰展示知识库的整体结构和各领域内容概览，以便我快速了解知识库全貌。

#### 验收标准

1. THE Knowledge_Base SHALL 更新首页（`docs/index.md`）的 hero 区域，将 tagline 更新为体现知识库定位的描述
2. THE Knowledge_Base SHALL 更新首页的 features 区域，展示各 Knowledge_Domain 的概览卡片
3. THE Knowledge_Base SHALL 更新首页的 actions 按钮，链接到最核心的知识领域
4. WHEN 一个 Knowledge_Domain 的 Index_Page 被访问时，THE Index_Page SHALL 展示该领域下所有子分类及其包含的文章列表
5. WHEN 一个 Knowledge_Domain 的 Index_Page 被访问时，THE Index_Page SHALL 包含该领域的简要介绍说明

### 需求 5：VitePress 配置更新

**用户故事：** 作为知识库维护者，我希望 VitePress 配置文件正确反映新的目录结构，以便站点能正常构建和运行。

#### 验收标准

1. THE Config_Generator SHALL 更新 `docs/.vitepress/config.mts` 中的 `nav` 配置，匹配新的 Knowledge_Domain 结构
2. THE Config_Generator SHALL 更新 `docs/.vitepress/config.mts` 中的 `sidebar` 配置，为每个 Knowledge_Domain 路径生成对应的侧边栏
3. THE Config_Generator SHALL 保留现有的站点基础配置：`lang: 'zh-CN'`、`base: '/'`、本地搜索、GitHub 编辑链接、行号显示、忽略死链
4. THE Config_Generator SHALL 更新 `description` 字段为体现知识库定位的描述
5. IF 迁移后存在旧路径的内部链接，THEN THE Config_Generator SHALL 通过 VitePress 的 `rewrites` 配置或手动更新确保旧链接可访问

### 需求 6：旧目录清理

**用户故事：** 作为知识库维护者，我希望迁移完成后旧的空目录被清理，以便项目结构整洁。

#### 验收标准

1. WHEN 所有内容文件迁移完成后，THE Content_Migrator SHALL 删除已清空的 `docs/notes/` 目录
2. WHEN 所有内容文件迁移完成后，THE Content_Migrator SHALL 删除已清空的 `docs/tutorials/` 目录（保留 `__tests__/` 目录中的测试文件需迁移或保留）
3. IF `docs/tutorials/__tests__/` 目录中存在测试文件，THEN THE Content_Migrator SHALL 将测试文件保留在合适的位置
