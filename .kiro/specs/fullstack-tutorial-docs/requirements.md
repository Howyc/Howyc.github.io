# Requirements Document

## Introduction

本需求文档定义了在现有 VitePress 文档站中创建一套完整的全栈项目教程文档的功能。教程面向零基础（零 Java 基础、熟悉 TypeScript/React）的前端开发者，基于真实项目 fetch-mcp-demo，涵盖前端项目创建流程、前后端知识点详解、部署流程三大模块。所有内容以中文编写，集成到现有 docs/ 目录下的 VitePress 站点中。

## Glossary

- **Tutorial_System**: VitePress 文档站中的教程页面集合，包括教程首页、各章节页面及导航配置
- **VitePress_Config**: docs/.vitepress/config.mts 中的站点配置，包含导航栏、侧边栏、路由等
- **Frontend_Tutorial**: 前端项目创建教程页面，讲解 React + TypeScript + Vite 项目从零搭建的完整流程
- **Backend_Tutorial**: 后端知识点教程页面，讲解 Spring Boot 三层架构、JPA、JWT 等后端概念
- **Frontend_Knowledge**: 前端知识点教程页面，讲解 React Hooks、TypeScript 类型、API 封装等前端技术
- **Deploy_Tutorial**: 部署流程教程页面，讲解 Vercel、Render、GitHub Pages、TiDB Cloud 的使用
- **Code_Block**: VitePress Markdown 中的代码块，包含源码和逐行中文注释
- **Reader**: 教程的目标读者，零 Java 基础但熟悉 TypeScript/React 的前端开发者

## Requirements

### Requirement 1: 教程目录结构与导航集成

**User Story:** As a Reader, I want 教程内容组织在清晰的目录结构中并集成到现有文档站导航, so that 我能通过导航栏和侧边栏快速找到并浏览所有教程章节。

#### Acceptance Criteria

1. THE Tutorial_System SHALL 在 docs/tutorials/ 目录下创建教程首页 index.md 和各章节 Markdown 文件
2. THE VitePress_Config SHALL 在顶部导航栏 nav 中添加「教程」入口，链接到 /tutorials/ 路径
3. THE VitePress_Config SHALL 在 sidebar 中为 /tutorials/ 路径配置完整的章节侧边栏导航，按「项目创建 → 前端知识点 → 后端知识点 → 部署流程」顺序排列
4. THE Tutorial_System SHALL 在教程首页 index.md 中提供项目背景介绍、技术栈总览、章节目录链接和阅读建议
5. WHEN Reader 点击侧边栏中的任意章节链接, THE Tutorial_System SHALL 导航到对应的教程页面并高亮当前章节

### Requirement 2: 前端项目创建教程

**User Story:** As a Reader, I want 一份从零创建 React + TypeScript + Vite 前端项目的完整教程, so that 我能理解前端项目的初始化流程并能独立创建类似项目。

#### Acceptance Criteria

1. THE Frontend_Tutorial SHALL 讲解使用 npm create vite@latest 命令创建 React + TypeScript 项目的完整步骤，包括模板选择和目录结构说明
2. THE Frontend_Tutorial SHALL 讲解 Vite 配置文件 vite.config.ts 的每个配置项，包括 React 插件和 React Compiler 的配置
3. THE Frontend_Tutorial SHALL 讲解 TypeScript 配置文件 tsconfig.json、tsconfig.app.json、tsconfig.node.json 的作用和关键配置项
4. THE Frontend_Tutorial SHALL 讲解项目入口文件 main.tsx 的代码，包括 createRoot、CSS 导入和组件挂载
5. THE Frontend_Tutorial SHALL 讲解 package.json 中的 dependencies 和 devDependencies 的区别，以及每个依赖包的用途
6. THE Frontend_Tutorial SHALL 讲解 Arco Design 组件库的安装和引入方式，包括全局 CSS 导入和暗色主题配置
7. WHEN 教程中出现代码块, THE Frontend_Tutorial SHALL 为每行代码提供中文注释，解释该行代码的作用和原理

### Requirement 3: 前端知识点详解教程

**User Story:** As a Reader, I want 一份详解前端核心知识点的教程, so that 我能理解本项目中使用的 React Hooks、TypeScript 类型系统、路由守卫、API 封装等技术。

#### Acceptance Criteria

1. THE Frontend_Knowledge SHALL 讲解 React Hooks 在本项目中的使用，包括 useState 管理组件状态、useEffect 处理副作用、useContext 实现全局状态共享，每个 Hook 配合项目真实代码示例
2. THE Frontend_Knowledge SHALL 讲解 TypeScript 类型定义在本项目中的应用，包括 interface 定义数据模型（User、Post、SaveResult）、泛型类型（ApiResponse<T>）、联合类型（DataSource）和类型守卫
3. THE Frontend_Knowledge SHALL 讲解 React Router 路由配置，包括 BrowserRouter、Routes、Route 的使用，以及 ProtectedRoute 路由守卫组件的实现原理
4. THE Frontend_Knowledge SHALL 讲解 AuthContext 认证上下文的实现，包括 Context 创建、Provider 组件、useAuth Hook、JWT Token 的存储和读取
5. THE Frontend_Knowledge SHALL 讲解 api.ts 中的统一请求封装，包括 authFetch 自动携带 Token、unwrap 统一响应解包、401 状态码自动登出处理
6. THE Frontend_Knowledge SHALL 讲解环境变量的使用，包括 .env.local 和 .env.production 的区别、import.meta.env 的访问方式、VITE_ 前缀的作用
7. WHEN 教程中出现代码块, THE Frontend_Knowledge SHALL 使用项目真实源码（来自 fetch-mcp-demo/src/）并为每行代码提供中文注释

### Requirement 4: 后端知识点详解教程

**User Story:** As a Reader, I want 一份面向前端开发者的后端知识点详解教程, so that 我能理解 Spring Boot 三层架构、JPA 数据库操作、JWT 认证等后端概念，并能将其与前端知识做类比。

#### Acceptance Criteria

1. THE Backend_Tutorial SHALL 讲解 Spring Boot 三层架构（Controller → Service → Repository），每层的职责和数据流向，并与前端的组件化架构做类比
2. THE Backend_Tutorial SHALL 讲解 Entity 实体类的定义，包括 JPA 注解（@Entity、@Table、@Id、@Column）、字段类型映射、构造函数和 Getter/Setter，使用项目中 Post.java 和 User.java 的真实代码
3. THE Backend_Tutorial SHALL 讲解 Repository 数据访问层，包括 JpaRepository 接口继承、自动生成的 CRUD 方法、自定义查询方法命名规则（findByUserId、findByTitleContainingIgnoreCase），并与前端的 API 调用做类比
4. THE Backend_Tutorial SHALL 讲解 Service 业务逻辑层，包括 @Service 注解、@Autowired 依赖注入、@Transactional 事务管理、Optional 类型处理，使用项目中 PostService.java 的真实代码
5. THE Backend_Tutorial SHALL 讲解 Controller 控制器层，包括 @RestController、@RequestMapping、@GetMapping/@PostMapping/@PutMapping/@DeleteMapping、@RequestParam、@RequestBody、ResponseEntity 响应封装，使用项目中 PostController.java 的真实代码
6. THE Backend_Tutorial SHALL 讲解 JWT 认证的完整实现，包括 JwtUtil 工具类（Token 生成和验证）、JwtFilter 过滤器（请求拦截和 Token 校验）、AuthController（登录注册接口）、BCrypt 密码加密，并与前端的 AuthContext 做对照
7. THE Backend_Tutorial SHALL 讲解 ApiResponse 统一响应格式的设计，包括泛型封装、静态工厂方法（ok/fail），并与前端的 unwrap 解包函数做对照
8. THE Backend_Tutorial SHALL 讲解 CORS 跨域配置（CorsConfig.java）的实现原理和配置方式
9. THE Backend_Tutorial SHALL 讲解 Maven 项目配置文件 pom.xml 的结构，包括 parent 继承、依赖管理、构建插件，并与前端的 package.json 做类比
10. THE Backend_Tutorial SHALL 讲解 application.properties 和 application-prod.properties 的配置项，包括数据库连接、JPA 配置、日志级别、环境切换机制（Spring Profiles）
11. WHEN 教程中出现代码块, THE Backend_Tutorial SHALL 使用项目真实源码（来自 java-backend/src/）并为每行代码提供中文注释，同时提供 TypeScript 等价代码做对比

### Requirement 5: 部署流程教程

**User Story:** As a Reader, I want 一份完整的前后端部署流程教程, so that 我能将自己的全栈项目部署到 Vercel、Render、GitHub Pages 和 TiDB Cloud 上。

#### Acceptance Criteria

1. THE Deploy_Tutorial SHALL 讲解 TiDB Cloud 数据库的注册、创建 Serverless Cluster、获取连接信息（Host、Port、Username、Password）的完整步骤，包括截图位置说明和注意事项
2. THE Deploy_Tutorial SHALL 讲解 Render 后端部署的完整步骤，包括创建 Web Service、选择 Docker Runtime、配置 Root Directory、设置环境变量（SPRING_PROFILES_ACTIVE、DB_HOST、DB_PORT、DB_NAME、DB_USERNAME、DB_PASSWORD、JWT_SECRET）
3. THE Deploy_Tutorial SHALL 讲解 Dockerfile 的多阶段构建，包括构建阶段（Maven 打包）和运行阶段（JRE 运行），为每行 Dockerfile 指令提供中文注释
4. THE Deploy_Tutorial SHALL 讲解 Vercel 前端部署的完整步骤，包括导入 GitHub 仓库、配置 Root Directory 和 Framework Preset、设置 VITE_API_BASE_URL 环境变量
5. THE Deploy_Tutorial SHALL 讲解 vercel.json 中 SPA 路由重写配置的作用和原理
6. THE Deploy_Tutorial SHALL 讲解 GitHub Pages 文档站部署的完整步骤，包括 GitHub Actions 工作流配置（deploy-docs.yml）、权限设置、触发条件、构建和部署步骤
7. THE Deploy_Tutorial SHALL 讲解 GitHub Actions CI/CD 自动部署前端的工作流配置（deploy-frontend.yml），包括 Vercel CLI 的使用、project.json 的生成、Secrets 的配置
8. THE Deploy_Tutorial SHALL 提供一份部署检查清单，列出所有需要配置的环境变量、Secrets 和注意事项
9. THE Deploy_Tutorial SHALL 讲解常见部署问题及解决方案，包括 Render 免费版数据丢失、Vercel SPA 路由 404、CORS 跨域、环境变量未生效等问题
10. WHEN 教程中出现配置文件或命令, THE Deploy_Tutorial SHALL 为每行配置或命令提供中文注释

### Requirement 6: 代码注释质量标准

**User Story:** As a Reader, I want 所有教程中的代码都有详细的中文注释, so that 我能逐行理解每段代码的含义，不需要额外查阅文档。

#### Acceptance Criteria

1. THE Tutorial_System SHALL 为所有 Code_Block 中的每行有效代码（非空行、非纯括号行）提供中文注释，注释说明该行代码的作用
2. THE Tutorial_System SHALL 在注释中使用 Reader 熟悉的前端术语做类比，将 Java/Spring Boot 概念映射到 TypeScript/React 等价概念
3. THE Tutorial_System SHALL 在代码块上方或下方提供该代码段的整体说明，解释代码的功能和在项目中的位置
4. IF Code_Block 中包含 Reader 未接触过的新概念, THEN THE Tutorial_System SHALL 在代码注释中额外解释该概念的含义和用途
5. THE Tutorial_System SHALL 标注每段代码的来源文件路径（如「来自 java-backend/src/.../PostController.java」），方便 Reader 在项目中查找原始代码

### Requirement 7: 与现有文档的整合

**User Story:** As a Reader, I want 教程与现有的项目文档和学习笔记相互关联, so that 我能在不同文档之间自由跳转，形成完整的知识体系。

#### Acceptance Criteria

1. THE Tutorial_System SHALL 在教程页面中适当位置添加指向现有文档的链接，包括 /projects/fetch-mcp-demo（项目详解）和 /notes/java-zero-to-one（Java 入门笔记）
2. THE Tutorial_System SHALL 在教程首页说明教程与现有文档的关系和阅读顺序建议
3. WHEN 教程内容与现有文档有重叠, THE Tutorial_System SHALL 通过链接引用现有文档而非重复内容，保持内容的单一来源
4. THE VitePress_Config SHALL 确保新增的教程页面与现有页面的导航风格和页面结构保持一致
