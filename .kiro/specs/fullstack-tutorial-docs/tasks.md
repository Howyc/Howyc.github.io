# Implementation Plan: 全栈教程文档系统

## Overview

基于 requirements.md 和 design.md，将教程文档系统的实现拆分为增量式任务。从 VitePress 配置和目录结构开始，逐章创建教程内容，最后进行集成验证。所有教程以 Markdown 文件形式存放在 `docs/tutorials/` 目录下，代码块包含逐行中文注释。

## Tasks

- [x] 1. 搭建教程目录结构与导航配置
  - [x] 1.1 修改 docs/.vitepress/config.mts，在 nav 中添加「教程」入口，在 sidebar 中添加 /tutorials/ 侧边栏配置
    - 在 nav 数组中添加 `{ text: '教程', link: '/tutorials/' }`
    - 在 sidebar 对象中添加 `/tutorials/` 键，包含「教程首页」「前端项目创建」「前端知识点详解」「后端知识点详解」「部署流程」五个条目
    - 确保章节按「项目创建 → 前端知识点 → 后端知识点 → 部署流程」顺序排列
    - _Requirements: 1.2, 1.3, 1.5, 7.4_

  - [x] 1.2 创建 docs/tutorials/index.md 教程首页
    - 添加 frontmatter（outline: deep）
    - 编写项目背景介绍（fetch-mcp-demo 是什么、为什么做这个教程）
    - 编写技术栈总览表格（前端/后端/数据库/部署平台）
    - 编写章节目录及每章摘要，包含各章节链接
    - 编写阅读建议（推荐顺序、前置知识要求）
    - 添加与现有文档的关系说明，包含指向 /projects/fetch-mcp-demo 和 /notes/java-zero-to-one 的链接
    - _Requirements: 1.1, 1.4, 7.1, 7.2_

- [x] 2. Checkpoint - 验证导航配置
  - 确保 VitePress 构建不报错，教程首页可正常访问，侧边栏导航正确显示。如有问题请告知用户。

- [x] 3. 编写前端项目创建教程
  - [x] 3.1 创建 docs/tutorials/project-setup.md，编写前端项目创建教程完整内容
    - 讲解 npm create vite@latest 创建 React + TypeScript 项目的完整步骤，包括模板选择和目录结构说明
    - 讲解 vite.config.ts 的每个配置项（React 插件、React Compiler 配置）
    - 讲解 tsconfig.json、tsconfig.app.json、tsconfig.node.json 的作用和关键配置项
    - 讲解入口文件 main.tsx 的代码（createRoot、CSS 导入、组件挂载）
    - 讲解 package.json 中 dependencies 和 devDependencies 的区别及每个依赖包用途
    - 讲解 Arco Design 组件库的安装和引入方式（全局 CSS 导入、暗色主题配置）
    - 所有代码块使用项目真实源码，每行有效代码提供中文注释
    - 代码块上方提供整体功能说明，标注来源文件路径
    - 适当位置添加指向现有文档的链接（如有重叠内容通过链接引用而非重复）
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.3_


- [x] 4. 编写前端知识点详解教程
  - [x] 4.1 创建 docs/tutorials/frontend-knowledge.md，编写前端知识点详解教程完整内容
    - 讲解 React Hooks 在本项目中的使用（useState、useEffect、useContext），配合项目真实代码示例
    - 讲解 TypeScript 类型定义（interface 定义 User/Post/SaveResult、泛型 ApiResponse<T>、联合类型 DataSource、类型守卫）
    - 讲解 React Router 路由配置（BrowserRouter、Routes、Route）及 ProtectedRoute 路由守卫实现原理
    - 讲解 AuthContext 认证上下文实现（Context 创建、Provider 组件、useAuth Hook、JWT Token 存储和读取）
    - 讲解 api.ts 统一请求封装（authFetch 自动携带 Token、unwrap 统一响应解包、401 自动登出）
    - 讲解环境变量使用（.env.local / .env.production 区别、import.meta.env、VITE_ 前缀）
    - 所有代码块使用项目真实源码（来自 fetch-mcp-demo/src/），每行有效代码提供中文注释
    - 代码块上方提供整体功能说明，标注来源文件路径
    - 新概念额外解释含义和用途
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.3_

- [x] 5. Checkpoint - 验证前端教程内容
  - 确保 project-setup.md 和 frontend-knowledge.md 构建无误，代码块注释完整。如有问题请告知用户。

- [x] 6. 编写后端知识点详解教程
  - [x] 6.1 创建 docs/tutorials/backend-knowledge.md，编写后端知识点详解教程完整内容
    - 讲解 Spring Boot 三层架构（Controller → Service → Repository），每层职责和数据流向，与前端组件化架构做类比
    - 讲解 Entity 实体类定义（JPA 注解 @Entity/@Table/@Id/@Column、字段类型映射），使用 Post.java 和 User.java 真实代码
    - 讲解 Repository 数据访问层（JpaRepository 接口继承、CRUD 方法、自定义查询命名规则），与前端 API 调用做类比
    - 讲解 Service 业务逻辑层（@Service、@Autowired、@Transactional、Optional），使用 PostService.java 真实代码
    - 讲解 Controller 控制器层（@RestController、@RequestMapping、各种 Mapping 注解、@RequestParam、@RequestBody、ResponseEntity），使用 PostController.java 真实代码
    - 讲解 JWT 认证完整实现（JwtUtil、JwtFilter、AuthController、BCrypt），与前端 AuthContext 做对照
    - 讲解 ApiResponse 统一响应格式（泛型封装、静态工厂方法），与前端 unwrap 做对照
    - 讲解 CORS 跨域配置（CorsConfig.java）实现原理
    - 讲解 Maven pom.xml 结构（parent 继承、依赖管理、构建插件），与 package.json 做类比
    - 讲解 application.properties 和 application-prod.properties 配置项（数据库连接、JPA 配置、日志级别、Spring Profiles）
    - 所有 Java 代码块使用项目真实源码（来自 java-backend/src/），每行有效代码提供中文注释
    - 每段 Java 代码配合 TypeScript 等价代码做对比
    - 代码块上方提供整体功能说明，标注来源文件路径
    - 用 TypeScript/React 类比术语解释 Java/Spring Boot 概念，新概念额外解释
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.3_

- [x] 7. Checkpoint - 验证后端教程内容
  - 确保 backend-knowledge.md 构建无误，Java 代码块均有 TypeScript 对比代码，注释完整。如有问题请告知用户。

- [x] 8. 编写部署流程教程
  - [x] 8.1 创建 docs/tutorials/deployment.md，编写部署流程教程完整内容
    - 讲解 TiDB Cloud 数据库注册、创建 Serverless Cluster、获取连接信息的完整步骤，包括截图位置说明和注意事项
    - 讲解 Render 后端部署完整步骤（创建 Web Service、Docker Runtime、Root Directory、环境变量配置）
    - 讲解 Dockerfile 多阶段构建（构建阶段 Maven 打包 + 运行阶段 JRE 运行），每行 Dockerfile 指令提供中文注释
    - 讲解 Vercel 前端部署完整步骤（导入 GitHub 仓库、Root Directory、Framework Preset、VITE_API_BASE_URL 环境变量）
    - 讲解 vercel.json 中 SPA 路由重写配置的作用和原理
    - 讲解 GitHub Pages 文档站部署完整步骤（GitHub Actions 工作流 deploy-docs.yml、权限设置、触发条件、构建和部署步骤）
    - 讲解 GitHub Actions CI/CD 自动部署前端工作流（deploy-frontend.yml、Vercel CLI、project.json、Secrets 配置）
    - 编写部署检查清单，列出所有需要配置的环境变量、Secrets 和注意事项
    - 编写常见部署问题及解决方案（Render 免费版数据丢失、Vercel SPA 路由 404、CORS 跨域、环境变量未生效）
    - 所有配置文件和命令每行提供中文注释
    - 代码块上方提供整体功能说明，标注来源文件路径
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 6.1, 6.3, 6.4, 6.5, 7.1, 7.3_

- [x] 9. Checkpoint - 验证部署教程内容
  - 确保 deployment.md 构建无误，包含部署检查清单和常见问题解答，配置文件注释完整。如有问题请告知用户。

- [x] 10. 集成验证与测试
  - [x] 10.1 创建测试文件验证教程文件完整性和内容质量
    - 创建测试文件（如 docs/tutorials/__tests__/tutorial-docs.test.ts）
    - 验证所有 5 个教程文件存在且非空（Property 1）
    - 验证 config.mts 中 nav 包含「教程」入口，sidebar 包含 /tutorials/ 配置且章节顺序正确
    - 验证教程首页包含项目背景、技术栈、章节链接、阅读建议
    - 验证各章节教程包含对应的关键词和内容覆盖
    - 验证教程文件中包含指向 /projects/fetch-mcp-demo 和 /notes/java-zero-to-one 的链接
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2_

  - [ ]* 10.2 编写 Property 1 的 property-based 测试：教程文件完整性
    - **Property 1: 教程文件完整性**
    - 使用 fast-check 生成预期文件路径列表，验证每个文件存在于 docs/tutorials/ 且内容非空
    - **Validates: Requirements 1.1**

  - [ ]* 10.3 编写 Property 2 的 property-based 测试：代码块中文注释覆盖
    - **Property 2: 代码块中文注释覆盖**
    - 解析所有教程 Markdown 文件，提取代码块，验证每行有效代码包含中文注释
    - **Validates: Requirements 2.7, 3.7, 5.10, 6.1**

  - [ ]* 10.4 编写 Property 3 的 property-based 测试：后端代码块 TypeScript 对比
    - **Property 3: 后端代码块 TypeScript 对比**
    - 解析 backend-knowledge.md，验证每个 Java 代码块附近存在 TypeScript 代码块
    - **Validates: Requirements 4.11**

  - [ ]* 10.5 编写 Property 4 的 property-based 测试：代码块上下文说明
    - **Property 4: 代码块上下文说明**
    - 解析所有教程 Markdown 文件，验证每个代码块前后存在说明文字
    - **Validates: Requirements 6.3**

  - [ ]* 10.6 编写 Property 5 的 property-based 测试：代码块来源标注
    - **Property 5: 代码块来源标注**
    - 解析所有教程 Markdown 文件，验证引用项目源码的代码块附近包含来源路径标注
    - **Validates: Requirements 6.5**

- [x] 11. Final Checkpoint - 最终验证
  - 确保所有测试通过，VitePress 构建成功，所有教程页面可正常访问。如有问题请告知用户。

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 每个任务引用了具体的需求编号，确保需求可追溯
- Checkpoints 确保增量验证，每完成一个阶段即可验证
- Property tests 验证文档质量的通用属性（注释覆盖、来源标注等）
- 所有教程内容使用中文编写，代码注释也使用中文
