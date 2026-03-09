# Implementation Plan: java-zero-basics-doc

## Overview

逐章节编写 `java-backend/JAVA_ZERO_TO_ONE.md`，每个任务对应一个文档章节，所有代码示例均从项目现有 Java 源文件中提取。

## Tasks

- [x] 1. 创建文档骨架：引言 + 目录
  - 在 `java-backend/JAVA_ZERO_TO_ONE.md` 创建文件（若已存在则覆盖）
  - 写入引言段落，说明文档目的和目标读者（零 Java 基础的前端开发者）
  - 写入包含所有章节锚点链接的目录（访问修饰符、数据类型、注解、类结构、构造函数、getter/setter、常用关键字）
  - 写入附录章节占位（与 JAVA_LEARNING.md 的关系）
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. 编写「类结构总览」章节
  - [x] 2.1 从 `entity/Post.java` 提取完整类代码，逐行添加注释标注每个结构元素
    - 标注 `package` 声明、`import` 语句、类声明、字段、构造函数、方法
    - 提供 TypeScript class 对比示例
    - 解释 `package` 关键字的作用（命名空间 / 模块系统）
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 2.2 内容审查：验证 Property 5（类结构解剖完整性）
    - 确认 6 个结构元素（package、import、类声明、字段、构造函数、方法）均有标注
    - **Property 5: 类结构解剖完整性**
    - **Validates: Requirements 5.1, 5.3**

- [x] 3. 编写「访问修饰符」章节
  - [x] 3.1 分别说明 `public`、`private`、`protected`，每个包含：纯文字说明 + TS 类比 + 项目代码示例
    - 从 `entity/Post.java` 提取 `private Long id`、`public Long getId()` 等示例
    - 解释 private 字段 + public getter 的封装模式
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 3.2 内容审查：验证 Property 2（访问修饰符三要素覆盖）
    - 确认 public/private/protected 各自有说明 + TS 类比 + 代码示例
    - **Property 2: 访问修饰符三要素覆盖**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 4. 编写「数据类型」章节
  - [x] 4.1 说明基本类型 vs 包装类型，提供 Java → TypeScript 类型映射表
    - 覆盖：`String`、`Long/Integer`、`long/int`、`boolean/Boolean`、`void`、`List<T>`、`Map<K,V>`、`Optional<T>`、`LocalDateTime`
    - 解释为何 JPA 主键用 `Long` 而非 `long`（可为 null、JPA 兼容性）
    - 从 `entity/Post.java`、`entity/User.java` 提取字段声明示例
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. 编写「注解（Annotation）」章节
  - [x] 5.1 写注解概念说明：plain language 解释 + TypeScript 装饰器 / JSDoc 类比
    - _Requirements: 4.1_
  - [x] 5.2 按 5 个分类逐一说明所有 17 个注解，每类附项目代码示例
    - JPA 实体注解：`@Entity`, `@Table`, `@Id`, `@Column`, `@GeneratedValue` — 示例来自 `entity/Post.java`
    - Spring 组件注解：`@Service`, `@Repository`, `@Component`, `@SpringBootApplication`, `@Autowired` — 示例来自 `service/PostService.java`
    - Spring MVC 注解：`@RestController`, `@GetMapping`, `@PostMapping`, `@RequestParam`, `@RequestBody` — 示例来自 `controller/PostController.java`
    - JPA 生命周期注解：`@PrePersist`, `@PreUpdate` — 示例来自 `entity/User.java`
    - 事务注解：`@Transactional` — 示例来自 `service/PostService.java`
    - _Requirements: 4.2, 4.3, 4.4_
  - [ ]* 5.3 内容审查：验证 Property 3（注解覆盖完整性）和 Property 4（注解分组代码示例覆盖）
    - 逐一确认 17 个注解均有独立说明段落
    - 确认 5 个分类各有代码块示例
    - **Property 3: 注解覆盖完整性**
    - **Property 4: 注解分组代码示例覆盖**
    - **Validates: Requirements 4.2, 4.3, 4.4**

- [x] 6. 编写「构造函数」章节
  - [x] 6.1 说明构造函数概念、无参构造函数（JPA 要求）、全参构造函数
    - 提供 `new Post(1L, 2L, "title", "body")` 使用示例
    - 提供 TypeScript class constructor 对比
    - 从 `entity/Post.java` 提取两个构造函数代码
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. 编写「Getter / Setter」章节
  - [x] 7.1 说明封装原则，对比 `post.getId()` vs `post.id`，说明 Spring JSON 序列化依赖 getter
    - 简介 Lombok `@Getter`/`@Setter`/`@Data` 注解，附简短示例
    - 从 `entity/Post.java` 提取 getter/setter 代码示例
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8. 编写「常用关键字」章节
  - [x] 8.1 逐一说明 12 个关键字，每个含 plain-language 描述 + TS 类比
    - `class`, `interface`, `extends`, `implements`, `final`, `static`, `void`, `return`, `this`, `new`, `null`, `instanceof`
    - `this` 示例使用 setter 中的 `this.id = id`（来自 `entity/Post.java`）
    - `interface`/`extends` 示例来自 `repository/PostRepository.java`
    - `final`/`static` 示例来自 `common/ApiResponse.java`
    - `implements` 示例来自 `config/CorsConfig.java`
    - _Requirements: 8.1, 8.4_
  - [x] 8.2 说明 `Optional<T>`、`List<T>`、`Map<String, Object>` 泛型类型
    - 示例来自 `service/PostService.java`
    - _Requirements: 8.2, 8.3_
  - [ ]* 8.3 内容审查：验证 Property 6（关键字覆盖完整性）
    - 确认 12 个关键字各有说明条目 + TS 类比
    - **Property 6: 关键字覆盖完整性**
    - **Validates: Requirements 8.1**

- [x] 9. 编写附录：项目文件索引 + 与 JAVA_LEARNING.md 的关系
  - 添加项目文件路径 → 对应章节的交叉引用表
  - 说明本文档与 `JAVA_LEARNING.md` 的分工，避免内容重复
  - _Requirements: 9.1, 9.3_

- [x] 10. 最终检查：内容完整性与格式
  - [x] 10.1 验证 Property 1（章节完整性）：确认目录锚点与正文标题双向对应
    - **Property 1: 章节完整性（目录 + 正文双向覆盖）**
    - **Validates: Requirements 1.1, 1.2**
  - [ ]* 10.2 验证 Property 7（代码示例可溯源性）：抽查代码片段，确认来源文件路径标注存在
    - **Property 7: 代码示例可溯源性**
    - **Validates: Requirements 9.1, 9.2**
  - 确认所有代码块有正确语法高亮标注（`java`、`typescript`）
  - 确认文档在 Markdown 预览中渲染正常，无破损格式

## Notes

- 标有 `*` 的子任务为可选审查任务，可跳过以加快进度
- 所有代码示例必须来自项目现有源文件，不得虚构
- 文档章节顺序遵循"从外到内"原则：先类结构全貌，再逐步深入各组成部分
