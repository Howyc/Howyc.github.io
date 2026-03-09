# Requirements Document

## Introduction

为完全没有 Java 基础的前端开发者（熟悉 TypeScript/React）新建一份零基础 Java 语法说明文档 `JAVA_ZERO_TO_ONE.md`，放在 `java-backend/` 目录下。该文档专注于解释项目中实际出现的 Java 语法，包括访问修饰符、注解、数据类型、类结构、构造函数、getter/setter 等，并通过前端类比帮助读者快速理解。

## Glossary

- **Doc**：指目标文档文件 `java-backend/JAVA_ZERO_TO_ONE.md`
- **Reader**：指阅读该文档的用户，即零 Java 基础的前端开发者
- **前端类比**：将 Java 概念与 TypeScript/JavaScript/React 中对应概念进行对比说明
- **代码示例**：从项目现有 Java 文件（如 `Post.java`、`User.java`、`PostService.java` 等）中提取的真实代码片段

## Requirements

### Requirement 1：文档基本结构

**User Story:** As a Reader, I want a clearly structured document, so that I can navigate to the topic I need without reading everything.

#### Acceptance Criteria

1. THE Doc SHALL contain a table of contents listing all major sections with anchor links.
2. THE Doc SHALL organize content into sections covering: 访问修饰符、数据类型、注解、类结构、构造函数、getter/setter、常用关键字。
3. THE Doc SHALL include an introduction section explaining the document's purpose and target audience.

---

### Requirement 2：访问修饰符说明

**User Story:** As a Reader, I want to understand what `public`, `private`, and `protected` mean, so that I can read class definitions without confusion.

#### Acceptance Criteria

1. THE Doc SHALL explain `public`, `private`, and `protected` with a plain-language description of each.
2. THE Doc SHALL provide a 前端类比 for each access modifier using TypeScript or JavaScript equivalents.
3. THE Doc SHALL include a 代码示例 from the project showing each modifier in context (e.g., `private Long id` from `Post.java`).
4. WHEN a Reader encounters `private` fields with `public` getters, THE Doc SHALL explain why this pattern exists (encapsulation).

---

### Requirement 3：Java 数据类型说明

**User Story:** As a Reader, I want to understand Java's basic data types, so that I can understand field declarations like `private Long id` or `private String title`.

#### Acceptance Criteria

1. THE Doc SHALL explain the difference between primitive types (`int`, `long`, `boolean`) and wrapper/object types (`Integer`, `Long`, `Boolean`, `String`).
2. THE Doc SHALL provide a 前端类比 mapping Java types to TypeScript types (e.g., `String` → `string`, `Long` → `number`, `boolean` → `boolean`).
3. THE Doc SHALL explain why `Long` is used instead of `long` for entity IDs (nullable, JPA compatibility).
4. THE Doc SHALL include a 代码示例 from the project showing type declarations in context.

---

### Requirement 4：注解（Annotation）说明

**User Story:** As a Reader, I want to understand what annotations like `@Entity`, `@Id`, `@Column`, `@Service`, `@Autowired` mean, so that I can read the project code without confusion.

#### Acceptance Criteria

1. THE Doc SHALL explain what an annotation is in plain language, with a 前端类比 (e.g., TypeScript decorators or JSDoc).
2. THE Doc SHALL cover the following annotations with individual explanations: `@Entity`, `@Table`, `@Id`, `@Column`, `@GeneratedValue`, `@Service`, `@Repository`, `@RestController`, `@Autowired`, `@GetMapping`, `@PostMapping`, `@RequestParam`, `@RequestBody`, `@PrePersist`, `@PreUpdate`, `@Transactional`.
3. THE Doc SHALL group annotations by category: JPA 实体注解、Spring 组件注解、Spring MVC 注解、JPA 生命周期注解、事务注解。
4. THE Doc SHALL include a 代码示例 for each annotation group showing real usage from the project.

---

### Requirement 5：类结构说明

**User Story:** As a Reader, I want to understand the structure of a Java class, so that I can read and write class definitions.

#### Acceptance Criteria

1. THE Doc SHALL explain the anatomy of a Java class: `package` declaration, `import` statements, class declaration, fields, constructors, methods.
2. THE Doc SHALL provide a 前端类比 comparing a Java class to a TypeScript class or interface.
3. THE Doc SHALL use `Post.java` from the project as a concrete annotated example, labeling each part.
4. THE Doc SHALL explain the `package` keyword and why it exists (namespace / module system).

---

### Requirement 6：构造函数说明

**User Story:** As a Reader, I want to understand what constructors are and why there are two of them (no-arg and full-arg), so that I can understand object creation in Java.

#### Acceptance Criteria

1. THE Doc SHALL explain what a constructor is and how it differs from a regular method.
2. THE Doc SHALL explain why JPA requires a no-arg constructor.
3. THE Doc SHALL explain the purpose of the full-arg constructor and show a usage example (`new Post(1L, 2L, "title", "body")`).
4. THE Doc SHALL provide a 前端类比 comparing Java constructors to TypeScript class constructors.

---

### Requirement 7：Getter 和 Setter 说明

**User Story:** As a Reader, I want to understand why Java uses getter and setter methods instead of direct field access, so that I can understand the boilerplate code in entity classes.

#### Acceptance Criteria

1. THE Doc SHALL explain the encapsulation principle in plain language without jargon.
2. THE Doc SHALL show the contrast: `post.getId()` in Java vs `post.id` in TypeScript.
3. THE Doc SHALL explain how Spring uses getters to serialize objects to JSON.
4. THE Doc SHALL mention Lombok as a way to eliminate getter/setter boilerplate, with a brief example.

---

### Requirement 8：常用关键字说明

**User Story:** As a Reader, I want to understand common Java keywords that appear in the project, so that I can read the code fluently.

#### Acceptance Criteria

1. THE Doc SHALL explain the following keywords with plain-language descriptions and 前端类比: `class`, `interface`, `extends`, `implements`, `final`, `static`, `void`, `return`, `this`, `new`, `null`, `instanceof`.
2. THE Doc SHALL explain `Optional<T>` and why it is used instead of returning `null` directly.
3. THE Doc SHALL explain `List<T>` and `Map<String, Object>` as commonly used generic types in the project.
4. WHEN explaining `this`, THE Doc SHALL show a 代码示例 from a setter method (e.g., `this.id = id`).

---

### Requirement 9：文档与项目代码的关联性

**User Story:** As a Reader, I want the document to reference actual files in the project, so that I can immediately apply what I read.

#### Acceptance Criteria

1. THE Doc SHALL reference specific project files by path (e.g., `entity/Post.java`, `service/PostService.java`) when providing examples.
2. THE Doc SHALL use only code snippets that exist verbatim or near-verbatim in the current project source files.
3. IF a concept is already explained in `JAVA_LEARNING.md`, THEN THE Doc SHALL cross-reference that file rather than duplicate the content.
