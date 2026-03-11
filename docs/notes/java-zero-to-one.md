# Java 零基础入门：写给前端开发者

## 引言

这份文档是为**零 Java 基础、熟悉 TypeScript/React 的前端开发者**准备的。

如果你能看懂这段 TypeScript：

```typescript
class Post {
  private id: number;
  private title: string;

  constructor(id: number, title: string) {
    this.id = id;
    this.title = title;
  }

  getId(): number {
    return this.id;
  }
}
```

那你已经具备了读懂本项目 Java 代码的基础。Java 和 TypeScript 在很多概念上高度相似——类、构造函数、访问修饰符、泛型——只是语法和一些细节不同。

**本文档的策略**：每个 Java 概念都配一个 TypeScript 等价物，让你用已有知识快速建立映射，而不是从零学起。

**阅读方式**：
- 所有代码示例均来自本项目现有的 Java 源文件，你可以直接打开对应文件验证
- 遇到不理解的地方，先找 TypeScript 类比，再看代码示例
- 不需要记住所有细节，能读懂项目代码即可

> 本文档专注于**读懂代码**，不涉及如何从零搭建 Java 项目。如需了解项目整体架构（Controller / Service / Repository 三层结构），请参阅 [`JAVA_LEARNING.md`](./JAVA_LEARNING.md)。

---

## 目录

1. [类结构总览](#1-类结构总览)
2. [访问修饰符（public / private / protected）](#2-访问修饰符public--private--protected)
3. [数据类型](#3-数据类型)
4. [注解（Annotation）](#4-注解annotation)
5. [构造函数](#5-构造函数)
6. [Getter 和 Setter](#6-getter-和-setter)
7. [常用关键字](#7-常用关键字)
8. [Lambda 表达式](#8-lambda-表达式)
9. [ResponseEntity：HTTP 响应封装](#9-responseentityhttp-响应封装)
10. [异常处理](#10-异常处理)
11. [@Override 注解](#11-override-注解)
12. [附录：项目文件索引](#附录项目文件索引)

---

## 1. 类结构总览

在深入各个细节之前，先从整体上看一个 Java 类长什么样。

### 1.1 先看 TypeScript 版本

如果你在 TypeScript 里写一个 `Post` 类，大概是这样：

```typescript
// TypeScript 版本
import { Entity } from 'some-orm';

class Post {
  private id: number;
  private userId: number;
  private title: string;
  private body: string;

  constructor() {}

  constructor(id: number, userId: number, title: string, body: string) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.body = body;
  }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }

  getTitle(): string { return this.title; }
  setTitle(title: string): void { this.title = title; }
}
```

### 1.2 Java 版本：`entity/Post.java` 完整解剖

下面是项目中真实的 `Post.java`，每个部分都加了标注说明：

```java
// ① package 声明 ─────────────────────────────────────────
// 告诉 Java 这个文件属于哪个"命名空间"
// 类比 TypeScript：就像文件的模块路径 src/entity/Post.ts
package com.example.fetchdemo.entity;

// ② import 语句 ───────────────────────────────────────────
// 引入外部类，和 TypeScript 的 import 一样
// 这里引入的是 JPA（数据库映射框架）提供的注解
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// ③ 类声明 ────────────────────────────────────────────────
// public  → 访问修饰符，表示这个类对外公开（任何地方都能用）
// class   → 关键字，声明这是一个类
// Post    → 类名，首字母大写（Java 命名规范）
// @Entity → 注解，告诉框架这个类对应数据库的一张表
// @Table  → 注解，指定表名为 "posts"
@Entity
@Table(name = "posts")
public class Post {

    // ④ 字段（Fields）────────────────────────────────────
    // 类比 TypeScript 的 class properties（类属性）
    // private → 只有类内部能访问，外部必须通过 getter/setter
    // Long    → 数据类型（相当于 TypeScript 的 number，但可以为 null）
    // id      → 字段名
    // @Id     → 注解，标记这是数据库主键

    @Id
    private Long id;          // 帖子 ID（主键）

    private Long userId;      // 发帖用户的 ID

    private String title;     // 帖子标题

    @Column(length = 2000)
    private String body;      // 帖子正文（@Column 指定数据库列最大长度）

    // ⑤ 构造函数 ──────────────────────────────────────────
    // 和 TypeScript 的 constructor 一样，用于创建对象实例
    // Java 允许同一个类有多个构造函数（参数不同即可）

    // 无参构造函数：JPA 规范要求必须有，Hibernate 从数据库读数据时会用到
    public Post() {}

    // 全参构造函数：方便手动创建对象
    // 用法：Post post = new Post(1L, 2L, "标题", "内容");
    public Post(Long id, Long userId, String title, String body) {
        this.id = id;           // this.id 指当前对象的字段，id 是参数
        this.userId = userId;
        this.title = title;
        this.body = body;
    }

    // ⑥ 方法（Getter / Setter）────────────────────────────
    // 因为字段是 private，外部无法直接读写
    // 所以提供 public 方法来读取（getter）和修改（setter）
    // 类比 TypeScript：get id() { return this.id; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
```

> 来源：`entity/Post.java`

---

### 1.3 逐元素说明

#### ① `package` 声明

```java
package com.example.fetchdemo.entity;
```

**是什么**：`package` 声明这个类所属的命名空间，相当于给类加了一个"地址"。

**类比 TypeScript**：就像文件的目录路径。`com.example.fetchdemo.entity` 对应的就是 `src/main/java/com/example/fetchdemo/entity/` 这个目录。

**为什么需要它**：Java 项目里可能有很多叫 `Post` 的类（比如你引入了某个第三方库，它也有个 `Post` 类）。`package` 就像 npm 包名，确保 `com.example.fetchdemo.entity.Post` 和 `com.other.library.Post` 不会冲突。

**规律**：`package` 声明的路径和文件在磁盘上的目录结构是一一对应的，这是 Java 的强制规范。

---

#### ② `import` 语句

```java
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
```

**是什么**：引入其他包里的类，和 TypeScript 的 `import` 完全一样。

**类比 TypeScript**：
```typescript
// TypeScript
import { Column, Entity, Id, Table } from 'jakarta-persistence';

// Java
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
```

**区别**：Java 的 `import` 每行只能引入一个类（没有 `{ }` 批量引入的语法）。如果想引入某个包下的所有类，可以用 `import jakarta.persistence.*;`，但一般不推荐。

---

#### ③ 类声明

```java
@Entity
@Table(name = "posts")
public class Post {
```

| 部分 | 含义 | TypeScript 类比 |
|------|------|----------------|
| `@Entity` | 注解，标记这是数据库实体类 | 类似装饰器 `@Entity()` |
| `@Table(name = "posts")` | 注解，指定对应的数据库表名 | 类似装饰器 `@Table({ name: 'posts' })` |
| `public` | 访问修饰符，这个类对外公开 | TypeScript 类默认就是 public |
| `class Post` | 声明一个名为 Post 的类 | `class Post` |

---

#### ④ 字段（Fields）

```java
@Id
private Long id;

private Long userId;
private String title;

@Column(length = 2000)
private String body;
```

**是什么**：类的成员变量，存储对象的数据。

**类比 TypeScript**：
```typescript
// TypeScript
class Post {
  private id: number;
  private userId: number;
  private title: string;
  private body: string;
}
```

**关键区别**：
- Java 字段声明格式是 `修饰符 类型 字段名`，TypeScript 是 `修饰符 字段名: 类型`
- Java 的 `Long`（大写）是包装类，可以为 `null`；`long`（小写）是基本类型，不能为 `null`
- JPA 主键用 `Long` 而非 `long`，因为新对象还没保存到数据库时，id 是 `null`

---

#### ⑤ 构造函数

```java
// 无参构造函数
public Post() {}

// 全参构造函数
public Post(Long id, Long userId, String title, String body) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.body = body;
}
```

**是什么**：和 TypeScript 的 `constructor` 完全对应，用于创建对象实例。

**类比 TypeScript**：
```typescript
class Post {
  constructor() {}

  constructor(id: number, userId: number, title: string, body: string) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.body = body;
  }
}
```

**Java 特点**：同一个类可以有多个构造函数，只要参数列表不同（这叫"方法重载"）。TypeScript 虽然也支持重载签名，但实现方式不同。

**为什么需要无参构造函数**：JPA（Hibernate）从数据库读取数据时，会先调用无参构造函数创建一个空对象，再通过 setter 逐个填充字段值。如果没有无参构造函数，程序启动时会报错。

---

#### ⑥ 方法（Getter / Setter）

```java
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public String getTitle() { return title; }
public void setTitle(String title) { this.title = title; }
```

**是什么**：读取和修改私有字段的公开方法。

**类比 TypeScript**：
```typescript
class Post {
  private _id: number;

  get id(): number { return this._id; }
  set id(value: number) { this._id = value; }
}
```

**命名规范**：Java 的 getter/setter 有固定命名规则：
- getter：`get` + 字段名首字母大写，如 `id` → `getId()`
- setter：`set` + 字段名首字母大写，如 `title` → `setTitle()`

**为什么重要**：Spring 在把 Java 对象序列化成 JSON 时，是通过调用 getter 方法读取值的。如果没有 getter，JSON 响应里就不会有对应字段。

---

## 2. 访问修饰符（public / private / protected）

访问修饰符用来控制**谁能访问**这个类、方法或字段——是任何人都能用，还是只有类内部能用，还是只有子类能用。

---

### 2.1 `public` — 任何地方都能访问

**是什么**：加了 `public` 的类、方法或字段，在任何地方都可以直接访问，没有限制。

**TypeScript 类比**：TypeScript 的 class 成员默认就是 public，不加修饰符就等于 public。

```typescript
// TypeScript：不写修饰符，默认就是 public
class Post {
  id: number;         // 等同于 public id: number
  getId(): number {   // 等同于 public getId()
    return this.id;
  }
}
```

**项目代码示例**（来自 `entity/Post.java`）：

```java
// public 方法：任何地方都能调用
public Long getId() { return id; }
```

这里的 `getId()` 是 `public` 的，所以 Controller、Service 等任何地方都可以调用 `post.getId()`。

---

### 2.2 `private` — 只有类内部能访问

**是什么**：加了 `private` 的字段或方法，只有**这个类自己**能访问，外部代码无法直接读写。

**TypeScript 类比**：和 TypeScript 的 `private` 关键字完全一样。

```typescript
// TypeScript
class Post {
  private id: number;  // 外部不能直接访问 post.id
}
```

**项目代码示例**（来自 `entity/Post.java`）：

```java
// private 字段：外部不能直接读写
private Long id;
private String title;
```

**为什么字段要用 `private`？**

这是 Java 的"封装"原则。字段设为 `private`，然后提供 `public` 的 getter/setter 方法来读写，好处是：

1. **防止外部随意修改**：外部代码不能直接 `post.id = -1`，必须通过 `post.setId(-1)`
2. **可以在 setter 里加验证逻辑**：比如 id 不能为负数，可以在 setter 里检查

```java
// 可以在 setter 里加验证
public void setId(Long id) {
    if (id != null && id < 0) {
        throw new IllegalArgumentException("ID 不能为负数");
    }
    this.id = id;
}
```

类比 TypeScript：就像用 `set` 访问器代替直接赋值，可以在里面加逻辑。

```typescript
// TypeScript 等价写法
class Post {
  private _id: number;

  set id(value: number) {
    if (value < 0) throw new Error('ID 不能为负数');
    this._id = value;
  }
}
```

---

### 2.3 `protected` — 类内部和子类能访问

**是什么**：加了 `protected` 的方法或字段，**类内部**和**继承这个类的子类**都能访问，但外部代码不能直接访问。

**TypeScript 类比**：和 TypeScript 的 `protected` 关键字完全一样。

```typescript
// TypeScript
class BaseEntity {
  protected onCreate(): void {  // 子类可以访问，外部不行
    console.log('创建时间已设置');
  }
}
```

**项目代码示例**（来自 `entity/User.java`）：

```java
// @PrePersist：JPA 生命周期注解，在数据插入数据库前自动调用
@PrePersist
protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
}
```

**为什么这里用 `protected` 而不是 `private`？**

`onCreate()` 是 JPA 的生命周期回调方法，由 Hibernate 框架在内部调用。JPA 规范要求这类方法不能是 `private`（框架需要能访问到它），但也不需要对外公开，所以用 `protected` 是最合适的选择。

在本项目中，`protected` 主要就用在这类 JPA 生命周期回调方法上（`@PrePersist`、`@PreUpdate`）。

---

### 2.4 对比总结

| 修饰符 | 类内部 | 子类 | 外部 | TypeScript 等价 |
|--------|--------|------|------|----------------|
| `public` | ✅ | ✅ | ✅ | 默认（无修饰符）|
| `protected` | ✅ | ✅ | ❌ | `protected` |
| `private` | ✅ | ❌ | ❌ | `private` |

**实际项目中的规律**：
- 字段（Fields）几乎全部用 `private`，通过 getter/setter 访问
- 普通方法（getter/setter、业务方法）用 `public`
- JPA 生命周期回调方法（`@PrePersist`、`@PreUpdate`）用 `protected`

---

## 3. 数据类型

Java 有**两套**类型系统，这是和 TypeScript 最大的不同之一。

---

### 3.1 基本类型 vs 包装类型

**TypeScript 只有一套**：`number` 就是数字，加个 `| null` 就能表示"可能为空"。

```typescript
// TypeScript：一套搞定
let count: number = 42;
let maybeCount: number | null = null;
```

**Java 有两套**：
- **基本类型**（小写）：`int`、`long`、`boolean`、`double`……直接存值，**不能为 null**
- **包装类型**（大写）：`Integer`、`Long`、`Boolean`、`Double`……是对象，**可以为 null**

```java
// Java：两套类型
int count = 42;          // 基本类型，不能为 null
Integer maybeCount = null; // 包装类型，可以为 null

long id = 1L;            // 基本类型，不能为 null
Long userId = null;      // 包装类型，可以为 null
```

**记忆口诀**：小写 = 不能 null，大写 = 能 null。

---

### 3.2 Java → TypeScript 类型映射表

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

---

### 3.3 为什么 JPA 主键用 `Long` 而不用 `long`？

这是初学者最常见的疑问。答案很简单：**新对象还没保存到数据库时，id 是 null**。

想象一下这个流程：

```java
// 第一步：创建一个新帖子对象（还没存到数据库）
Post post = new Post();
post.setTitle("我的第一篇帖子");
// 此时 post.getId() 是 null —— 因为还没有 ID！

// 第二步：保存到数据库，数据库自动分配 ID
postRepository.save(post);
// 此时 post.getId() 才有值，比如 42L
```

如果用 `long`（基本类型），它不能为 null，Java 会给它一个默认值 `0`。这就会造成混乱：你不知道 id 是 `0` 因为"还没分配"，还是真的有一条 id 为 0 的记录。

用 `Long`（包装类），null 就明确表示"还没有 ID"，语义清晰。

**项目代码示例**（来自 `entity/Post.java`）：

```java
@Id
private Long id;   // ✅ 用 Long，新对象 id 可以是 null
// private long id; // ❌ 不能用 long，因为 long 不能为 null
```

---

### 3.4 项目中常见类型示例

**来自 `entity/Post.java`**：

```java
@Id
private Long id;        // 主键，包装类，可为 null（新对象未保存时）

private Long userId;    // 外键，包装类

private String title;   // 字符串，引用类型，可为 null

@Column(length = 2000)
private String body;    // 字符串，指定数据库列最大长度 2000
```

**来自 `entity/User.java`**：

```java
@Column(name = "created_at")
private LocalDateTime createdAt;   // 日期时间类型，对应 TypeScript 的 Date

@Column(name = "updated_at")
private LocalDateTime updatedAt;   // 最后更新时间
```

`LocalDateTime` 是 Java 8 引入的日期时间类，比老的 `Date` 类更好用。在 JSON 序列化后，通常会变成类似 `"2024-01-15T10:30:00"` 这样的字符串，前端用 `new Date("2024-01-15T10:30:00")` 就能解析。

---

---

## 4. 注解（Annotation）

注解是写在代码上面的**"标签"**（以 `@` 开头），告诉框架如何处理这段代码。你不需要自己调用它，框架会在运行时读取这些标签并自动执行对应逻辑。

**TypeScript 类比**：类似 TypeScript/Angular 的装饰器（`@Component()`、`@Injectable()`），或者 NestJS 的 `@Get()`、`@Post()`。

```java
// 语法：@注解名 或 @注解名(参数)
@Entity                    // 无参注解
@Table(name = "posts")     // 带参数的注解
public class Post { ... }
```

---

### 4.1 JPA 实体注解（数据库相关）

这组注解告诉 Hibernate（数据库框架）如何把 Java 类映射到数据库表。

**来自 `entity/Post.java`**：

```java
@Entity                        // ← 告诉 Hibernate：这个类对应数据库的一张表
@Table(name = "posts")         // ← 指定表名为 "posts"（不写则默认用类名小写）
public class Post {

    @Id                        // ← 标记这是主键字段（PRIMARY KEY）
    private Long id;

    // @GeneratedValue 示例（本项目未用，因为 ID 来自外部 API）：
    // @Id
    // @GeneratedValue(strategy = GenerationType.IDENTITY)
    // private Long id;        // ← 如果加这个，数据库会自动 +1 分配 ID

    @Column(length = 2000)     // ← 配置数据库列属性：最大长度 2000 字符
    private String body;       //    默认长度是 255，帖子内容更长所以要指定

    // @Column 还有其他参数：
    // @Column(name = "created_at")   → 指定列名（字段名和列名不同时用）
    // @Column(nullable = false)      → 不允许为 null
    // @Column(unique = true)         → 值必须唯一
}
```

| 注解 | 作用 | 类比 |
|------|------|------|
| `@Entity` | 标记类对应数据库表 | Prisma `model Post {}` |
| `@Table(name="posts")` | 指定表名 | Prisma `@@map("posts")` |
| `@Id` | 标记主键 | Prisma `@id` |
| `@GeneratedValue` | 主键自动递增 | Prisma `@default(autoincrement())` |
| `@Column(...)` | 配置列属性 | Prisma `@db.VarChar(2000)` |

---

### 4.2 Spring 组件注解（依赖注入相关）

这组注解告诉 Spring 如何管理这些类——自动创建实例、自动注入依赖。

**`@Service`**（来自 `service/PostService.java`）：

```java
@Service                       // ← 告诉 Spring：这是业务逻辑类，帮我创建并管理它的实例
public class PostService {
    // Spring 会在启动时自动创建 PostService 的单例实例
    // 其他类需要用 PostService 时，Spring 会自动注入这个实例
}
```

**`@Repository`**（来自 `repository/PostRepository.java`）：

```java
@Repository                    // ← 告诉 Spring：这是数据访问类
public interface PostRepository extends JpaRepository<Post, Long> {
    // @Repository 是 @Component 的特化版本，专门用于数据访问层
}
```

**`@Autowired`**（来自 `service/PostService.java`）：

```java
@Service
public class PostService {

    private final PostRepository postRepository;

    @Autowired                 // ← 告诉 Spring：请把 PostRepository 的实例注入进来
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
        // Spring 会自动找到 PostRepository 的实例并传入
        // 你不需要手动 new PostRepository()
    }
}
```

**TypeScript 类比**（以 NestJS 为例）：

```typescript
// NestJS（TypeScript）
@Injectable()                  // ← 等同于 Java 的 @Service
export class PostService {
    constructor(
        private postRepository: PostRepository  // ← 等同于 @Autowired
    ) {}
}
```

| 注解 | 作用 | TypeScript/NestJS 类比 |
|------|------|----------------------|
| `@Service` | 业务逻辑类 | `@Injectable()` |
| `@Repository` | 数据访问类 | `@Injectable()` + Repository pattern |
| `@Component` | 通用组件（@Service/@Repository 的父类） | `@Injectable()` |
| `@SpringBootApplication` | 应用入口（含自动配置） | `NestFactory.create()` |
| `@Autowired` | 自动注入依赖 | 构造函数参数自动注入 |

---

### 4.3 Spring MVC 注解（HTTP 接口相关）

这组注解用于定义 HTTP 接口，和前端框架的路由定义非常相似。

**来自 `controller/PostController.java`**：

```java
@RestController                // ← 标记这是 REST API 控制器
                               //    = @Controller（处理请求）+ @ResponseBody（返回 JSON）
@RequestMapping("/api")        // ← 设置基础路径，所有接口都以 /api 开头
public class PostController {

    // GET /api/db/posts → 获取所有帖子
    @GetMapping("/db/posts")
    public ResponseEntity<...> getAll() { ... }

    // GET /api/db/posts/detail?id=1 → 按 ID 查询
    @GetMapping("/db/posts/detail")
    public ResponseEntity<...> getById(
        @RequestParam Long id   // ← 从 URL 查询参数 ?id=1 获取值
    ) { ... }

    // POST /api/db/posts → 新增帖子
    @PostMapping("/db/posts")
    public ResponseEntity<...> create(
        @RequestBody Post post  // ← 从请求体 JSON 自动反序列化为 Post 对象
    ) { ... }
}
```

**TypeScript/Express 类比**：

```typescript
// Express（TypeScript）
app.get('/api/db/posts', (req, res) => { ... });           // @GetMapping
app.post('/api/db/posts', (req, res) => {                  // @PostMapping
    const post = req.body;                                  // @RequestBody
    const id = req.query.id;                               // @RequestParam
});
```

| 注解 | 作用 | Express 类比 |
|------|------|-------------|
| `@RestController` | REST 控制器 | `express.Router()` |
| `@RequestMapping("/api")` | 基础路径前缀 | `router.use('/api', ...)` |
| `@GetMapping("/path")` | 处理 GET 请求 | `app.get('/path', ...)` |
| `@PostMapping("/path")` | 处理 POST 请求 | `app.post('/path', ...)` |
| `@RequestParam Long id` | URL 查询参数 `?id=1` | `req.query.id` |
| `@RequestBody Post post` | 请求体 JSON | `req.body` |

---

### 4.4 JPA 生命周期注解

这组注解让你在数据库操作的特定时机自动执行代码，不需要手动调用。

**来自 `entity/User.java`**：

```java
@PrePersist                    // ← 在数据第一次插入数据库之前自动调用
protected void onCreate() {
    this.createdAt = LocalDateTime.now();   // 自动设置创建时间
    this.updatedAt = LocalDateTime.now();
}

@PreUpdate                     // ← 在数据更新之前自动调用
protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();   // 自动更新"最后修改时间"
}
```

**TypeScript 类比**：类似 TypeORM 的 `@BeforeInsert()` 和 `@BeforeUpdate()` 装饰器。

```typescript
// TypeORM（TypeScript）
@BeforeInsert()                // ← 等同于 @PrePersist
onCreate() {
    this.createdAt = new Date();
}
```

好处：你不需要在每次保存时手动设置时间，框架自动处理。

---

### 4.5 事务注解

**`@Transactional`**（来自 `service/PostService.java`）：

```java
@Transactional                 // ← 标记这个方法是一个事务
public Map<String, Object> batchSave(List<Map<String, Object>> postsData) {
    // 这个方法里的所有数据库操作，要么全部成功，要么全部回滚
    // 如果中途抛出异常，之前的所有操作都会撤销
    postRepository.saveAll(toSave);
    // ...
}
```

**TypeScript 类比**：类似手动管理数据库事务：

```typescript
// 手动事务（TypeScript/TypeORM）
await queryRunner.startTransaction();
try {
    await queryRunner.manager.save(posts);
    await queryRunner.commitTransaction();
} catch (err) {
    await queryRunner.rollbackTransaction();  // 失败时回滚
}

// Java 的 @Transactional 把上面这些全部自动化了
```

**什么时候用**：批量操作、多步骤操作（需要保证"要么全成功，要么全失败"）时使用。

---

## 5. 构造函数

构造函数（Constructor）是创建对象时自动调用的特殊方法，和 TypeScript 的 `constructor` 完全对应。

---

### 5.1 基本概念

```java
// Java
Post post = new Post();                          // 调用无参构造函数
Post post2 = new Post(1L, 2L, "标题", "内容");  // 调用全参构造函数
```

```typescript
// TypeScript 等价
const post = new Post();
const post2 = new Post(1, 2, '标题', '内容');
```

**和普通方法的区别**：
- 构造函数名必须和类名完全一样（`Post` 类的构造函数就叫 `Post`）
- 没有返回类型（不写 `void`，也不写其他类型）
- 只在 `new` 的时候调用，不能手动调用

---

### 5.2 无参构造函数（JPA 必须有）

**来自 `entity/Post.java`**：

```java
// 无参构造函数：没有任何参数，方法体为空
public Post() {}
```

**为什么 JPA 要求必须有无参构造函数？**

Hibernate（JPA 实现）从数据库读取数据时，流程是这样的：

```
数据库返回一行数据
    ↓
Hibernate 调用 new Post()  ← 必须有无参构造函数！
    ↓
Hibernate 调用 post.setId(1L)
Hibernate 调用 post.setTitle("标题")
...（逐个填充字段）
    ↓
返回填充好的 Post 对象
```

如果没有无参构造函数，第二步就会失败，程序启动时报错。

**TypeScript 类比**：就像某些 ORM 库要求你的 class 有默认构造函数一样。

---

### 5.3 全参构造函数（方便手动创建对象）

**来自 `entity/Post.java`**：

```java
public Post(Long id, Long userId, String title, String body) {
    this.id = id;         // this.id = 当前对象的字段，id = 传入的参数
    this.userId = userId;
    this.title = title;
    this.body = body;
}
```

**使用方式**：

```java
// 创建一个新帖子对象
Post post = new Post(1L, 2L, "我的第一篇帖子", "帖子内容...");
//                   ↑    ↑   ↑                ↑
//                   id  userId  title          body

// 注意：1L 表示 Long 类型的数字 1（不加 L 默认是 int 类型）
// 类比 TypeScript：1 就是 number，Java 需要区分 int 和 long
```

**TypeScript 类比**：

```typescript
class Post {
  constructor(
    private id: number,
    private userId: number,
    private title: string,
    private body: string
  ) {}
}

const post = new Post(1, 2, '标题', '内容');
```

---

### 5.4 方法重载（同一个类有多个构造函数）

Java 允许同一个类有多个构造函数，只要参数列表不同（参数数量或类型不同）：

```java
public class Post {
    public Post() {}                                          // 无参
    public Post(Long id, Long userId, String title, String body) { ... }  // 全参
    // 还可以有其他组合，比如只传 title 的构造函数
}
```

这叫**方法重载（Overloading）**。Java 根据你传入的参数自动选择调用哪个构造函数。

**TypeScript 类比**：TypeScript 也支持重载签名，但实现方式不同（需要写多个签名 + 一个实现）。Java 直接写多个完整的构造函数，更直观。

---

## 6. Getter 和 Setter

因为字段是 `private` 的，外部代码无法直接读写，所以需要提供 `public` 的方法来访问。这就是 getter（读取）和 setter（修改）。

---

### 6.1 为什么需要 Getter / Setter？

**封装原则**：把数据藏起来（`private`），只暴露操作数据的方法（`public`）。

```java
// 来自 entity/Post.java

// ❌ 外部不能直接访问（private 字段）
// post.id = 1;       → 编译错误
// post.title = "x";  → 编译错误

// ✅ 必须通过 getter/setter
post.getId();          // 读取 id
post.setTitle("新标题"); // 修改 title
```

**TypeScript 对比**：

```typescript
// TypeScript：可以直接访问（除非用 private）
const post = new Post();
post.id;               // 直接读取
post.title = '新标题'; // 直接修改

// Java 等价写法：
post.getId();
post.setTitle('新标题');
```

---

### 6.2 命名规范

Java 的 getter/setter 有固定命名规则，Spring 和 JPA 都依赖这个规范：

| 字段名 | getter | setter |
|--------|--------|--------|
| `id` | `getId()` | `setId(value)` |
| `title` | `getTitle()` | `setTitle(value)` |
| `userId` | `getUserId()` | `setUserId(value)` |
| `createdAt` | `getCreatedAt()` | `setCreatedAt(value)` |

规律：`get`/`set` + 字段名首字母大写。

**来自 `entity/Post.java`**：

```java
// getter：读取字段值，返回类型和字段类型一致
public Long getId() { return id; }
public String getTitle() { return title; }

// setter：修改字段值，参数类型和字段类型一致，返回 void
public void setId(Long id) { this.id = id; }
public void setTitle(String title) { this.title = title; }
//                                   ↑ this.title = 字段，title = 参数
```

---

### 6.3 Spring 序列化依赖 Getter

Spring 把 Java 对象转成 JSON 时，是通过调用 getter 方法读取值的：

```java
// 如果 Post 有 getId() 和 getTitle()，Spring 会生成：
{
  "id": 1,
  "title": "帖子标题",
  "userId": 2,
  "body": "内容..."
}

// 如果删掉 getTitle()，JSON 里就不会有 title 字段！
```

这就是为什么实体类必须有完整的 getter 方法。

---

### 6.4 Lombok：消除 Getter/Setter 样板代码

写这么多 getter/setter 很烦，Java 生态有个叫 **Lombok** 的库可以用注解自动生成：

```java
// 不用 Lombok（现在项目的写法）：需要手写所有 getter/setter
public class Post {
    private Long id;
    private String title;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    // ...还有很多
}

// 用 Lombok（简化后）：一个注解搞定
import lombok.Data;

@Data                          // ← 自动生成所有 getter、setter、toString、equals、hashCode
public class Post {
    private Long id;
    private String title;
    // 就这些，其他全部自动生成
}
```

本项目没有使用 Lombok（为了让代码更透明、易于学习），但实际项目中 Lombok 非常常见。

---

## 7. 常用关键字

### 7.1 核心关键字速查

| 关键字 | TypeScript 等价 | 一句话说明 |
|--------|----------------|-----------|
| `class` | `class` | 声明一个类 |
| `interface` | `interface` | 声明一个接口（只有方法签名，没有实现） |
| `extends` | `extends` | 继承（类继承类，或接口继承接口） |
| `implements` | `implements` | 实现接口 |
| `final` | `const`（变量）/ `readonly`（字段） | 不可修改 |
| `static` | `static` | 属于类本身，不属于实例 |
| `void` | `void` | 方法没有返回值 |
| `return` | `return` | 返回值（完全一样） |
| `this` | `this` | 指向当前对象（完全一样） |
| `new` | `new` | 创建对象实例（完全一样） |
| `null` | `null` | 空值（完全一样） |
| `instanceof` | `instanceof` | 判断对象是否是某个类的实例 |

---

### 7.2 逐个详解

**`class` 和 `interface`**

```java
// class：有字段和方法实现
public class Post { ... }

// interface：只有方法签名，没有实现（来自 repository/PostRepository.java）
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);  // 只声明，不实现
    // Spring Data JPA 会自动生成实现
}
```

```typescript
// TypeScript 完全一样
class Post { ... }
interface PostRepository {
    findByUserId(userId: number): Post[];
}
```

---

**`extends` 和 `implements`**

```java
// extends：继承（来自 repository/PostRepository.java）
// PostRepository 继承 JpaRepository，自动获得 findAll、save 等方法
public interface PostRepository extends JpaRepository<Post, Long> { ... }

// implements：实现接口（来自 config/CorsConfig.java）
// CorsConfig 实现 Filter 接口，必须实现 doFilter 方法
public class CorsConfig implements Filter {
    @Override
    public void doFilter(...) { ... }  // 必须实现这个方法
}
```

```typescript
// TypeScript 等价
interface PostRepository extends JpaRepository<Post, number> { ... }
class CorsConfig implements Filter {
    doFilter(...) { ... }
}
```

---

**`final` 和 `static`**

```java
// 来自 common/ApiResponse.java

// final 字段：赋值后不能修改（类似 TypeScript 的 readonly）
private final boolean success;
private final T data;
private final String message;

// static 方法：属于类本身，不需要创建实例就能调用
// 类比 TypeScript：static ok(data: T): ApiResponse<T>
public static <T> ApiResponse<T> ok(T data) {
    return new ApiResponse<>(true, data, "操作成功");
}

// 调用方式：类名.方法名（不需要 new）
ApiResponse.ok(user);    // ✅ 直接用类名调用
ApiResponse.fail("错误"); // ✅
```

```typescript
// TypeScript 等价
class ApiResponse<T> {
    readonly success: boolean;  // final → readonly
    readonly data: T;

    static ok<T>(data: T): ApiResponse<T> {  // static 完全一样
        return new ApiResponse(true, data, '操作成功');
    }
}
ApiResponse.ok(user);  // 调用方式也一样
```

---

**`void` 和 `return`**

```java
// void：方法没有返回值（和 TypeScript 完全一样）
public void setId(Long id) {
    this.id = id;
    // 不需要 return（或者写 return; 也行）
}

// 有返回值的方法必须声明返回类型
public Long getId() {
    return id;  // return 用法和 TypeScript 完全一样
}
```

---

**`this`**

```java
// this 指向当前对象（和 TypeScript 完全一样）
// 来自 entity/Post.java setter 方法
public void setId(Long id) {
    this.id = id;  // this.id = 当前对象的字段，id = 方法参数
}
// 如果不写 this.id，Java 会认为你在给参数 id 赋值给自己（没意义）
// 所以当字段名和参数名相同时，必须用 this 区分
```

---

**`new`**

```java
// new：创建对象实例（和 TypeScript 完全一样）
Post post = new Post();
Post post2 = new Post(1L, 2L, "标题", "内容");

// 注意：Java 需要声明变量类型
// Post post = new Post();   ← Java
// const post = new Post();  ← TypeScript
```

---

**`null` 和 `instanceof`**

```java
// null：空值（和 TypeScript 完全一样）
Long id = null;  // 包装类可以为 null
// long id = null; // ❌ 基本类型不能为 null

// instanceof：判断对象类型（来自 service/PostService.java）
private Long toLong(Object obj) {
    if (obj instanceof Number n) return n.longValue();  // Java 16+ 模式匹配
    if (obj instanceof String s) {
        try { return Long.parseLong(s); } catch (NumberFormatException ignored) {}
    }
    return null;
}
```

```typescript
// TypeScript 等价
function toLong(obj: unknown): number | null {
    if (typeof obj === 'number') return obj;
    if (typeof obj === 'string') {
        const n = parseInt(obj);
        return isNaN(n) ? null : n;
    }
    return null;
}
```

---

### 7.3 泛型类型：`Optional<T>`、`List<T>`、`Map<K, V>`

**`Optional<T>`**（来自 `service/PostService.java`）：

```java
// Optional 是一个"容器"，明确表示"这个值可能存在，也可能不存在"
// 类比 TypeScript：T | null，但 Optional 提供了更安全的操作方式

public Optional<Post> findById(Long id) {
    return postRepository.findById(id);  // 找到返回 Optional.of(post)，找不到返回 Optional.empty()
}

// 使用 Optional（来自 controller/PostController.java）
postService.findById(id)
    .map(post -> ResponseEntity.ok(ApiResponse.ok(post)))      // 找到了：返回 200
    .orElse(ResponseEntity.status(404).body(ApiResponse.fail("不存在")));  // 没找到：返回 404
```

```typescript
// TypeScript 等价（手动处理 null）
const post = await postService.findById(id);
if (post !== null) {
    return { status: 200, body: post };
} else {
    return { status: 404, body: '不存在' };
}
```

**`List<T>`**（来自 `service/PostService.java`）：

```java
// List<Post>：Post 对象的有序列表，类比 TypeScript 的 Post[]
public List<Post> findAll() {
    return postRepository.findAll();  // 返回所有帖子的列表
}

// 创建 List
List<Post> posts = new ArrayList<>();  // 空列表
posts.add(post);                       // 添加元素
posts.size();                          // 获取长度（类比 .length）
```

**`Map<K, V>`**（来自 `service/PostService.java`）：

```java
// Map<String, Object>：键为 String、值为任意类型的键值对
// 类比 TypeScript：Record<string, unknown> 或 { [key: string]: unknown }
Map<String, Object> result = new HashMap<>();
result.put("success", true);           // 类比 result['success'] = true
result.put("savedCount", 10);
result.get("success");                 // 类比 result['success']
```

---

## 8. Lambda 表达式

Lambda 是 Java 8 引入的语法，让你可以把"一段代码"当作参数传递。你在文档里已经见过它了——`post -> ResponseEntity.ok(...)`——但没有专门解释。

---

### 8.1 基本语法

```java
// Java Lambda 语法：参数 -> 表达式
post -> ResponseEntity.ok(post)

// 多个参数：
(a, b) -> a + b

// 多行代码（需要花括号和 return）：
post -> {
    System.out.println(post.getTitle());
    return ResponseEntity.ok(post);
}
```

**TypeScript 类比**：Lambda 就是 Java 的箭头函数，语法几乎一样：

```typescript
// TypeScript 箭头函数
post => ResponseEntity.ok(post)
(a, b) => a + b
post => {
    console.log(post.title);
    return ResponseEntity.ok(post);
}
```

---

### 8.2 项目中的 Lambda 示例

**`Optional.map()` 中的 Lambda**（来自 `controller/PostController.java`）：

```java
// 找到帖子 → 返回 200，找不到 → 返回 404
return postService.findById(id)
        .map(post -> ResponseEntity.ok(ApiResponse.ok(post)))       // ← Lambda
        .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.fail("帖子不存在，ID: " + id)));
```

```typescript
// TypeScript 等价
const post = await postService.findById(id);
if (post) {
    return ResponseEntity.ok(ApiResponse.ok(post));
} else {
    return ResponseEntity.status(404).body(ApiResponse.fail(`帖子不存在，ID: ${id}`));
}
```

**`stream()` 中的 Lambda**（来自 `service/PostService.java`）：

```java
// 从帖子列表中提取所有 ID
List<Long> incomingIds = postsData.stream()
        .map(d -> toLong(d.get("id")))    // ← Lambda：每个 Map 取出 id 字段
        .filter(id -> id != null)          // ← Lambda：过滤掉 null
        .collect(Collectors.toList());     // 收集成 List
```

```typescript
// TypeScript 等价
const incomingIds = postsData
    .map(d => toLong(d['id']))
    .filter(id => id !== null);
```

**方法引用（Lambda 的简写）**（来自 `service/PostService.java`）：

```java
// 完整 Lambda 写法：
.map(post -> post.getId())

// 方法引用简写（等价）：
.map(Post::getId)   // ← 类名::方法名，相当于 post => post.getId()
```

```typescript
// TypeScript 等价
.map(post => post.getId())
// TypeScript 没有方法引用语法，只能写完整箭头函数
```

---

### 8.3 Stream API 速查

`stream()` 是 Java 处理集合的方式，类比 TypeScript 的数组方法：

| Java Stream | TypeScript 数组方法 | 说明 |
|-------------|-------------------|------|
| `.map(x -> ...)` | `.map(x => ...)` | 转换每个元素 |
| `.filter(x -> ...)` | `.filter(x => ...)` | 过滤元素 |
| `.collect(Collectors.toList())` | （直接返回数组） | 收集结果为 List |
| `.count()` | `.length` | 计数 |
| `.forEach(x -> ...)` | `.forEach(x => ...)` | 遍历 |

---

## 9. ResponseEntity：HTTP 响应封装

`ResponseEntity<T>` 是 Spring 用来表示完整 HTTP 响应的类，包含状态码 + 响应头 + 响应体。项目里每个 Controller 方法都返回它。

---

### 9.1 为什么需要 ResponseEntity？

如果直接返回数据，Spring 默认返回 200 状态码，但有时需要返回 201（创建成功）、404（未找到）等：

```java
// ❌ 只能返回 200
public Post getById(Long id) {
    return postRepository.findById(id).get();
}

// ✅ 可以控制状态码
public ResponseEntity<Post> getById(Long id) {
    return ResponseEntity.status(404).body(null);  // 返回 404
}
```

**TypeScript 类比**：类似 Express 的 `res.status(404).json(data)`：

```typescript
// Express（TypeScript）
res.status(200).json(data);   // ← 等同于 ResponseEntity.ok(data)
res.status(404).json(error);  // ← 等同于 ResponseEntity.status(404).body(error)
res.status(201).json(data);   // ← 等同于 ResponseEntity.status(HttpStatus.CREATED).body(data)
```

---

### 9.2 常用写法

**来自 `controller/PostController.java`**：

```java
// 200 OK（最常用）
ResponseEntity.ok(ApiResponse.ok(post))

// 201 Created（资源创建成功）
ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(post, "创建成功"))

// 404 Not Found
ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.fail("帖子不存在，ID: " + id))

// 400 Bad Request
ResponseEntity.badRequest().body(ApiResponse.fail("请求数据为空"))
```

---

### 9.3 理解嵌套泛型 `ResponseEntity<ApiResponse<List<Post>>>`

项目里最复杂的返回类型长这样：

```java
public ResponseEntity<ApiResponse<List<Post>>> getAll() { ... }
```

从外到内拆解：

```
ResponseEntity<                  ← HTTP 响应容器（包含状态码）
    ApiResponse<                 ← 统一业务响应格式（包含 success/message）
        List<Post>               ← 实际数据：Post 对象的列表
    >
>
```

对应的 JSON 响应：

```json
{
  "success": true,
  "message": "操作成功",
  "data": [
    { "id": 1, "title": "帖子标题", "userId": 1, "body": "..." },
    { "id": 2, "title": "另一篇帖子", "userId": 1, "body": "..." }
  ]
}
```

**TypeScript 类比**：

```typescript
// TypeScript 等价类型
type Response = {
    success: boolean;
    message: string;
    data: Post[];   // List<Post> → Post[]
}
```

---

### 9.4 常用 HTTP 状态码

| Java 写法 | 状态码 | 含义 |
|-----------|--------|------|
| `ResponseEntity.ok(...)` | 200 | 成功 |
| `ResponseEntity.status(HttpStatus.CREATED)` | 201 | 资源创建成功 |
| `ResponseEntity.badRequest()` | 400 | 请求参数错误 |
| `ResponseEntity.status(HttpStatus.NOT_FOUND)` | 404 | 资源不存在 |
| `ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)` | 500 | 服务器内部错误 |

---

## 10. 异常处理

Java 的异常处理语法和 TypeScript 基本一样，但有一个重要区别：**受检异常（Checked Exception）**。

---

### 10.1 基本语法（和 TypeScript 一样）

```java
// Java try/catch/finally
try {
    Long id = Long.parseLong("abc");  // 可能抛出异常
} catch (NumberFormatException e) {
    System.out.println("转换失败: " + e.getMessage());
} finally {
    System.out.println("无论如何都会执行");
}
```

```typescript
// TypeScript 完全一样
try {
    const id = parseInt('abc');
} catch (e) {
    console.log('转换失败: ' + (e as Error).message);
} finally {
    console.log('无论如何都会执行');
}
```

**项目代码示例**（来自 `service/PostService.java`）：

```java
// 尝试把字符串转成 Long，失败时忽略异常
if (obj instanceof String s) {
    try {
        return Long.parseLong(s);
    } catch (NumberFormatException ignored) {
        // "abc" 这种无法转换的字符串，直接忽略，返回 null
    }
}
```

---

### 10.2 throw 抛出异常

```java
// Java
throw new IllegalArgumentException("ID 不能为负数");
throw new RuntimeException("发生了未知错误");
```

```typescript
// TypeScript 等价
throw new Error('ID 不能为负数');
```

---

### 10.3 受检异常（Java 特有，TypeScript 没有）

这是 Java 和 TypeScript 最大的区别之一。

Java 把异常分两类：

- **非受检异常（Unchecked）**：`RuntimeException` 及其子类，不强制处理，可以随时抛出
- **受检异常（Checked）**：其他异常（如 `IOException`、`SQLException`），**编译器强制你处理**

```java
// 受检异常：编译器强制你 try/catch 或者声明 throws
// 来自 config/CorsConfig.java
@Override
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
        throws IOException, ServletException {   // ← 声明"我可能抛出这些异常"
    chain.doFilter(req, res);                    // ← 这行可能抛出 IOException
}
```

`throws IOException, ServletException` 的意思是：这个方法可能抛出这两种异常，调用方需要处理。

**TypeScript 类比**：TypeScript 没有受检异常，所有异常都是非受检的。Java 的受检异常就像 TypeScript 里函数签名明确写出 `Promise<T>` 可能 reject 的情况——只是 Java 在编译阶段就强制检查。

---

### 10.4 批量操作中的异常处理

**来自 `service/PostService.java`**：

```java
for (Map<String, Object> data : postsData) {
    try {
        // 转换单条数据，如果某条数据格式有问题
        Post post = new Post();
        post.setId(toLong(data.get("id")));
        // ...
        toSave.add(post);
    } catch (Exception e) {
        // 单条失败不影响其他数据，记录日志后继续
        log.warn("转换帖子数据失败: {}", e.getMessage());
        failedCount++;
    }
}
```

这是一个常见模式：批量处理时，单条失败不中断整体，而是记录失败数量，最后汇报结果。

---

## 11. @Override 注解

`@Override` 是一个特殊注解，告诉编译器："这个方法是从父类或接口继承来的，我在重写它。"

---

### 11.1 基本用法

**来自 `config/CorsConfig.java`**：

```java
public class CorsConfig implements Filter {

    @Override                          // ← 告诉编译器：doFilter 是 Filter 接口要求实现的方法
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        // 具体实现...
    }
}
```

---

### 11.2 为什么要加 @Override？

不加也能运行，但加了有两个好处：

**1. 编译器帮你检查拼写错误**

```java
// 假设你不小心把方法名拼错了
@Override
public void dofilter(...) { ... }  // ← 编译器报错：Filter 接口没有 dofilter 方法！
// 没有 @Override 的话，这会被当成一个新方法，不会报错，但接口没有被实现
```

**2. 代码可读性**：一眼就知道这个方法是在实现接口或重写父类，不是新定义的方法。

**TypeScript 类比**：TypeScript 没有 `@Override` 注解（TS 4.3 加了 `override` 关键字，但不强制）。Java 的 `@Override` 就像 TypeScript 里实现接口时，IDE 自动提示你"这个方法来自接口"。

---

### 11.3 项目中出现 @Override 的地方

| 文件 | 重写的方法 | 来自哪个接口/父类 |
|------|-----------|----------------|
| `config/CorsConfig.java` | `doFilter()` | `jakarta.servlet.Filter` 接口 |

---

## 附录：项目文件索引

### 项目文件 → 本文档章节对照表

| 文件路径 | 主要涉及章节 | 包含的关键概念 |
|---------|------------|--------------|
| `entity/Post.java` | 1, 2, 3, 5, 6 | 类结构、访问修饰符、数据类型、构造函数、getter/setter |
| `entity/User.java` | 3, 4.4 | `LocalDateTime`、`@PrePersist`、`@PreUpdate` |
| `service/PostService.java` | 4.2, 4.5, 7.3, 8, 10 | `@Service`、`@Transactional`、`Optional`、Lambda、Stream、异常处理 |
| `controller/PostController.java` | 4.3, 8.2, 9 | `@RestController`、`@GetMapping`、`ResponseEntity`、Lambda |
| `repository/PostRepository.java` | 4.2, 7.2 | `@Repository`、`interface`、`extends` |
| `common/ApiResponse.java` | 7.2, 9.3 | `final`、`static`、泛型 `<T>`、嵌套泛型 |
| `config/CorsConfig.java` | 7.2, 10.3, 11 | `implements`、`@Override`、受检异常 `throws` |

---

### 本文档与 `JAVA_LEARNING.md` 的分工

| 内容 | 看哪里 |
|------|--------|
| Java 语法是什么意思（`private`、`@Column` 等） | 本文档（`JAVA_ZERO_TO_ONE.md`） |
| 项目三层架构（Controller/Service/Repository） | [`JAVA_LEARNING.md`](./JAVA_LEARNING.md) |
| 练习任务（添加 Comment 实体、分页、验证等） | [`JAVA_LEARNING.md`](./JAVA_LEARNING.md) |
| Spring Boot 注解速查表 | [`JAVA_LEARNING.md`](./JAVA_LEARNING.md) |

两份文档互补，建议先读本文档理解语法，再读 `JAVA_LEARNING.md` 了解架构和做练习。
