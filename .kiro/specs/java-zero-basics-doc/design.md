# Design Document: java-zero-basics-doc

## Overview

本设计文档描述 `java-backend/JAVA_ZERO_TO_ONE.md` 的内容结构与实现方案。

目标读者：零 Java 基础、熟悉 TypeScript/React 的前端开发者。
目标文件：`java-backend/JAVA_ZERO_TO_ONE.md`

文档的核心策略是"类比驱动"——每个 Java 概念都配一个 TypeScript/JavaScript 等价物，让读者能用已有知识快速建立映射，而不是从零学起。所有代码示例均来自项目现有文件，确保读者可以立即在真实代码中找到对应内容。

---

## Architecture

文档本身是一个静态 Markdown 文件，无运行时依赖。其"架构"体现在内容的组织逻辑上：

```
JAVA_ZERO_TO_ONE.md
├── 引言（目的 + 阅读方式）
├── 目录（锚点链接）
├── 1. 类结构总览（先给全局视图）
├── 2. 访问修饰符
├── 3. 数据类型
├── 4. 注解（Annotation）
├── 5. 构造函数
├── 6. Getter / Setter
├── 7. 常用关键字
└── 附录：与 JAVA_LEARNING.md 的关系
```

内容顺序遵循"从外到内"原则：先看懂一个类的整体骨架（类结构），再逐步深入每个组成部分。这与前端开发者阅读一个新组件的习惯一致。

---

## Components and Interfaces

文档由以下内容模块组成，每个模块对应一个需求：

| 模块 | 对应需求 | 核心内容 |
|------|---------|---------|
| 引言 + 目录 | Req 1 | 目的说明、章节锚点 |
| 类结构总览 | Req 5 | `Post.java` 完整解剖图 |
| 访问修饰符 | Req 2 | `public/private/protected` + 封装原则 |
| 数据类型 | Req 3 | 基本类型 vs 包装类型，TS 类型映射表 |
| 注解 | Req 4 | 5 大分类，每类含真实代码示例 |
| 构造函数 | Req 6 | 无参 + 全参，JPA 要求说明 |
| Getter/Setter | Req 7 | 封装原则，Lombok 简介 |
| 常用关键字 | Req 8 | 12 个关键字 + Optional/List/Map |
| 项目文件索引 | Req 9 | 文件路径 → 对应章节的交叉引用表 |

### 代码示例来源映射

每个章节的代码示例均来自以下项目文件：

- `entity/Post.java` — 类结构、访问修饰符、数据类型、构造函数、getter/setter
- `entity/User.java` — `@PrePersist`/`@PreUpdate`、`LocalDateTime`、`@Column` 属性
- `service/PostService.java` — `@Service`、`@Autowired`、`@Transactional`、`Optional`、`List`、`Map`
- `controller/PostController.java` — `@RestController`、`@GetMapping`、`@PostMapping`、`@RequestParam`、`@RequestBody`
- `repository/PostRepository.java` — `@Repository`、`interface`、`extends`、泛型
- `common/ApiResponse.java` — 泛型类、`final`、`static`、工厂方法模式
- `config/CorsConfig.java` — `implements`、`@Component`、`@Order`
- `FetchDemoApplication.java` — `@SpringBootApplication`、`static void main`

---

## Data Models

文档本身不涉及运行时数据模型。但文档中会呈现以下 Java 数据结构的说明：

### Java 类型 → TypeScript 类型 映射表

| Java 类型 | TypeScript 等价 | 说明 |
|-----------|----------------|------|
| `String` | `string` | 引用类型，可为 null |
| `Long` / `Integer` | `number` | 包装类，可为 null |
| `long` / `int` | `number` | 基本类型，不可为 null |
| `boolean` | `boolean` | 基本类型 |
| `Boolean` | `boolean \| null` | 包装类，可为 null |
| `void` | `void` | 无返回值 |
| `List<T>` | `T[]` | 有序集合 |
| `Map<K, V>` | `Record<K, V>` | 键值对 |
| `Optional<T>` | `T \| null`（但更安全） | 显式表达"可能为空" |
| `LocalDateTime` | `Date` / `string` | 日期时间 |

### 注解分类模型

```
注解（Annotation）
├── JPA 实体注解
│   ├── @Entity, @Table
│   ├── @Id, @GeneratedValue
│   └── @Column
├── Spring 组件注解
│   ├── @Service, @Repository
│   ├── @Component
│   └── @SpringBootApplication
├── Spring MVC 注解
│   ├── @RestController, @RequestMapping
│   ├── @GetMapping, @PostMapping, @PutMapping, @DeleteMapping
│   ├── @RequestParam, @RequestBody
│   └── @PathVariable
├── JPA 生命周期注解
│   ├── @PrePersist
│   └── @PreUpdate
└── 事务注解
    └── @Transactional
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

本文档是一个静态 Markdown 文件，其"正确性"体现在内容的完整性和准确性上。以下属性描述文档内容应满足的不变量。

### Property 1: 章节完整性（目录 + 正文双向覆盖）

*For any* 需求 1.2 中列出的必要章节（访问修饰符、数据类型、注解、类结构、构造函数、getter/setter、常用关键字），该章节标题必须同时出现在：(a) 文档目录的锚点链接中，(b) 文档正文的 Markdown 标题中。

**Validates: Requirements 1.1, 1.2**

### Property 2: 访问修饰符三要素覆盖

*For any* 访问修饰符 `{public, private, protected}` 中的每一个，文档必须包含：(a) 该修饰符的纯文字说明，(b) 对应的 TypeScript/JavaScript 类比，(c) 来自项目源文件的代码示例。

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: 注解覆盖完整性

*For any* 需求 4.2 中列出的 17 个注解（`@Entity`, `@Table`, `@Id`, `@Column`, `@GeneratedValue`, `@Service`, `@Repository`, `@RestController`, `@Autowired`, `@GetMapping`, `@PostMapping`, `@RequestParam`, `@RequestBody`, `@PrePersist`, `@PreUpdate`, `@Transactional`），文档中必须存在对该注解的独立说明段落。

**Validates: Requirements 4.2**

### Property 4: 注解分组代码示例覆盖

*For any* 需求 4.3 中列出的 5 个注解分类（JPA 实体注解、Spring 组件注解、Spring MVC 注解、JPA 生命周期注解、事务注解），该分类下必须包含至少一个来自项目源文件的代码块示例。

**Validates: Requirements 4.3, 4.4**

### Property 5: 类结构解剖完整性

*For any* Java 类的组成元素 `{package 声明, import 语句, 类声明, 字段, 构造函数, 方法}`，文档中必须存在对该元素的说明，且以 `Post.java` 为具体示例进行标注。

**Validates: Requirements 5.1, 5.3**

### Property 6: 关键字覆盖完整性

*For any* 需求 8.1 中列出的 12 个关键字（`class`, `interface`, `extends`, `implements`, `final`, `static`, `void`, `return`, `this`, `new`, `null`, `instanceof`），文档中必须存在对该关键字的说明条目，并包含 TypeScript/JavaScript 类比。

**Validates: Requirements 8.1**

### Property 7: 代码示例可溯源性

*For any* 文档中出现的代码片段，必须满足：(a) 附近标注了来源文件路径（如 `entity/Post.java`），(b) 该代码片段能在对应项目源文件中找到逐字或近似匹配的原始代码。

**Validates: Requirements 9.1, 9.2**

---

## Error Handling

文档内容层面的"错误处理"策略：

1. **代码示例准确性**：所有代码片段在写入文档前，需与项目源文件逐字核对，避免引入不存在的 API 或错误语法。

2. **交叉引用一致性**：凡是 `JAVA_LEARNING.md` 已覆盖的内容（如三层架构、练习任务），文档应引用而非重复，避免两份文档内容冲突。

3. **类型说明准确性**：Java 基本类型与包装类型的区别是常见误解来源，文档需明确区分并给出具体场景（如 JPA 主键必须用 `Long` 而非 `long`）。

4. **注解说明边界**：注解说明只覆盖项目中实际出现的注解，不扩展到项目未使用的注解，避免信息过载。

---

## Testing Strategy

本文档是静态内容文件，不涉及运行时代码，因此测试策略以"内容审查"为主，辅以可自动化的结构检查。

### 单元级检查（手动审查）

对应 Correctness Properties 的逐项核对：

- **Property 1**：逐一检查目录中的 7 个章节，确认正文中存在对应标题
- **Property 2**：检查 `public`、`private`、`protected` 三个修饰符，各自是否有说明 + TS 类比 + 代码示例
- **Property 3**：逐一检查 17 个注解，确认每个都有独立说明段落
- **Property 4**：检查 5 个注解分类，确认每类都有代码块
- **Property 5**：检查 `Post.java` 解剖示例，确认 6 个结构元素均有标注
- **Property 6**：逐一检查 12 个关键字，确认每个都有说明 + TS 类比
- **Property 7**：抽查代码片段，确认来源文件路径标注存在，且代码可在源文件中找到

### 集成级检查（手动）

- 文档在 GitHub / VS Code Markdown 预览中渲染正常，无破损格式
- 代码块语法高亮标注正确（`java`、`typescript` 等）
- 与 `JAVA_LEARNING.md` 无内容重复，交叉引用链接指向正确

### 可自动化检查（可选）

若需要自动化验证，可使用以下工具：
- `markdownlint`：检查 Markdown 格式规范
- 自定义脚本：解析 Markdown AST，验证 Property 1（目录锚点）、Property 3（注解关键词出现次数）、Property 6（关键字出现次数）

### 双重测试说明

由于产出物是 Markdown 文档而非可执行代码，Correctness Properties 通过人工审查验证，而非属性测试库（如 QuickCheck）。上述 Properties 的价值在于提供明确的验收标准，使审查过程可重复、可追溯。
