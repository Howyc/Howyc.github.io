---
outline: deep
---

# 第 3 章：后端知识点详解

> 本章面向零 Java 基础的前端开发者，用 TypeScript/React 的视角讲解 Spring Boot 后端开发的核心概念。所有代码来自项目真实源码（`java-backend/src/`），每段 Java 代码都配有 TypeScript 等价代码做对比。
>
> 前置阅读：建议先阅读 [Java 入门笔记](/notes/java-zero-to-one) 了解 Java 基础语法，再阅读本章效果更佳。
> 项目详情：参考 [fetch-mcp-demo 项目详解](/projects/fetch-mcp-demo) 了解完整项目架构。

## 3.1 Spring Boot 三层架构

### 什么是三层架构？

Spring Boot 后端项目通常采用 **Controller → Service → Repository** 三层架构，每层各司其职：

| 层级 | 职责 | 前端类比 |
|------|------|----------|
| **Controller** 控制器层 | 接收 HTTP 请求，返回响应 | React 组件中的事件处理函数 |
| **Service** 业务逻辑层 | 处理业务规则和数据转换 | 自定义 Hooks（如 `useAuth`） |
| **Repository** 数据访问层 | 直接操作数据库（CRUD） | `api.ts` 中的请求函数 |

### 数据流向

```
前端请求 → Controller（接收请求）→ Service（处理逻辑）→ Repository（操作数据库）
                                                              ↓
前端响应 ← Controller（返回 JSON）← Service（组装结果）← Repository（返回数据）
```

### 与前端架构的类比

前端 React 项目也有类似的分层思想：

| Java 后端 | React 前端 | 说明 |
|-----------|-----------|------|
| `PostController.java` | `PostPage.tsx` 组件 | 处理用户交互 / HTTP 请求 |
| `PostService.java` | `usePostData()` Hook | 封装业务逻辑 |
| `PostRepository.java` | `api.ts` 中的 `fetchDatabasePosts()` | 数据获取 |
| `Post.java` (Entity) | `interface Post` (TypeScript) | 数据模型定义 |
| `ApiResponse.java` | `interface ApiResponse<T>` | 统一响应格式 |

### 目录结构对比

来自 `java-backend/src/main/java/com/example/fetchdemo/` 目录结构：

```
fetchdemo/
├── controller/     ← Controller 层（接收请求）
│   ├── PostController.java
│   └── AuthController.java
├── service/        ← Service 层（业务逻辑）
│   ├── PostService.java
│   └── AuthService.java
├── repository/     ← Repository 层（数据库操作）
│   ├── PostRepository.java
│   └── AppUserRepository.java
├── entity/         ← 实体类（数据模型）
│   ├── Post.java
│   └── AppUser.java
├── common/         ← 公共类
│   └── ApiResponse.java
├── config/         ← 配置类
│   └── CorsConfig.java
├── filter/         ← 过滤器（中间件）
│   └── JwtFilter.java
└── util/           ← 工具类
    └── JwtUtil.java
```

对比前端项目结构：

```
fetch-mcp-demo/src/
├── pages/          ← 页面组件（类似 Controller）
├── contexts/       ← 全局状态（类似 Service）
├── services/       ← API 请求（类似 Repository）
│   └── api.ts
├── types/          ← 类型定义（类似 Entity）
│   └── index.ts
└── components/     ← 通用组件（类似 Common）
```

---

## 3.2 Entity 实体类

### 什么是 Entity？

Entity（实体类）是 Java 对象和数据库表之间的"桥梁"。你在实体类中定义的每个字段，都会自动变成数据库表的一列。

> **前端类比**：TypeScript 的 `interface` 只是类型定义，而 Java 的 `@Entity` 会**真正在数据库里创建一张表**！类似 Prisma 的 `model` 定义。

### Post 实体类

下面是帖子实体类的完整代码，展示了 JPA 注解如何将 Java 类映射到数据库表。

来自 `java-backend/src/main/java/com/example/fetchdemo/entity/Post.java`：

```java
package com.example.fetchdemo.entity; // 包声明，类似 TypeScript 的模块路径

import jakarta.persistence.Column; // 导入列注解
import jakarta.persistence.Entity; // 导入实体注解
import jakarta.persistence.Id;     // 导入主键注解
import jakarta.persistence.Table;  // 导入表名注解

@Entity                  // 标记为 JPA 实体，Hibernate 会为它创建数据库表
@Table(name = "posts")   // 指定数据库表名为 "posts"（不写则默认用类名）
public class Post {

    @Id                  // 标记为主键字段（PRIMARY KEY）
    private Long id;     // 帖子 ID，Long 类似 TypeScript 的 number

    private Long userId; // 发帖用户 ID，关联到 User 表

    private String title; // 帖子标题，String 类似 TypeScript 的 string

    @Column(length = 2000) // 指定数据库列最大长度为 2000（默认 255）
    private String body;   // 帖子正文，内容较长所以加大长度限制

    public Post() {}     // 无参构造函数，JPA 规范要求必须有

    // 全参构造函数，方便快速创建对象
    public Post(Long id, Long userId, String title, String body) {
        this.id = id;         // this 指当前对象，类似 JS 的 this
        this.userId = userId; // 赋值用户 ID
        this.title = title;   // 赋值标题
        this.body = body;     // 赋值正文
    }

    // Getter/Setter 方法：Java 的封装原则要求通过方法访问私有字段
    public Long getId() { return id; }           // 读取 id
    public void setId(Long id) { this.id = id; } // 设置 id

    public Long getUserId() { return userId; }               // 读取 userId
    public void setUserId(Long userId) { this.userId = userId; } // 设置 userId

    public String getTitle() { return title; }                 // 读取 title
    public void setTitle(String title) { this.title = title; } // 设置 title

    public String getBody() { return body; }                 // 读取 body
    public void setBody(String body) { this.body = body; }   // 设置 body
}
```

TypeScript 等价代码对比：

```typescript
// 来自 fetch-mcp-demo/src/types/index.ts
// TypeScript 只定义类型，不会创建数据库表
interface Post {
  id: number;     // 对应 Java 的 @Id Long id
  userId: number; // 对应 Java 的 Long userId
  title: string;  // 对应 Java 的 String title
  body: string;   // 对应 Java 的 @Column(length=2000) String body
}

// Java 需要 Getter/Setter，TypeScript 直接访问属性
const post: Post = { id: 1, userId: 2, title: "标题", body: "内容" };
console.log(post.id);    // Java 中是 post.getId()
post.title = "新标题";    // Java 中是 post.setTitle("新标题")
```

### JPA 核心注解速查

| Java 注解 | 作用 | TypeScript 类比 |
|-----------|------|----------------|
| `@Entity` | 标记为数据库实体 | Prisma 的 `model` |
| `@Table(name="posts")` | 指定表名 | Prisma 的 `@@map("posts")` |
| `@Id` | 标记主键 | 无直接等价，约定 `id` 字段 |
| `@Column(length=2000)` | 指定列属性 | Prisma 的 `@db.VarChar(2000)` |
| `@GeneratedValue` | 主键自增 | 数据库自增 ID |

### User 实体类（带生命周期回调）

User 实体类展示了更多 JPA 特性：`@PrePersist` 和 `@PreUpdate` 生命周期回调，以及 `@Column` 的更多用法。

来自 `java-backend/src/main/java/com/example/fetchdemo/entity/User.java`（核心部分）：

```java
@Entity                  // 标记为 JPA 实体
@Table(name = "users")   // 对应数据库 users 表
public class User {

    @Id                  // 主键
    private Long id;     // 用户 ID

    @Column(length = 100) // 限制最大长度为 100 个字符
    private String name;  // 用户姓名

    @Column(length = 50)  // 限制最大长度为 50
    private String username; // 用户名

    @Column(length = 100) // 限制最大长度为 100
    private String email;  // 邮箱地址

    @Column(name = "created_at") // 指定数据库列名为 created_at（Java 用驼峰，数据库用下划线）
    private LocalDateTime createdAt; // 创建时间，LocalDateTime 类似 JS 的 Date

    @Column(name = "updated_at") // 指定数据库列名
    private LocalDateTime updatedAt; // 更新时间

    // JPA 生命周期回调：在数据插入前自动执行
    @PrePersist          // 类似 React 的 useEffect(() => {}, [])，组件挂载时执行
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(); // 自动设置创建时间
        this.updatedAt = LocalDateTime.now(); // 同时设置更新时间
    }

    // JPA 生命周期回调：在数据更新前自动执行
    @PreUpdate           // 类似 React 的 useEffect 依赖变化时执行
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now(); // 自动更新"更新时间"
    }

    // ... Getter/Setter 省略
}
```

TypeScript 等价代码对比：

```typescript
// TypeScript 版本的 User 类型
interface User {
  id: number;          // 对应 @Id Long id
  name: string;        // 对应 @Column(length=100) String name
  username: string;    // 对应 @Column(length=50) String username
  email: string;       // 对应 @Column(length=100) String email
  phone: string;       // 对应 String phone
  website: string;     // 对应 String website
  city?: string;       // 对应 String city（可选）
  company?: string;    // 对应 String company（可选）
}

// TypeScript 没有 @PrePersist，需要手动处理时间戳
// 通常在 API 调用时添加：
const newUser = {
  ...userData,
  createdAt: new Date().toISOString(), // 手动设置创建时间
  updatedAt: new Date().toISOString(), // 手动设置更新时间
};
```

### AppUser 实体类（自增主键）

AppUser 用于认证系统，展示了 `@GeneratedValue` 自增主键的用法。

来自 `java-backend/src/main/java/com/example/fetchdemo/entity/AppUser.java`：

```java
@Entity                       // 标记为 JPA 实体
@Table(name = "app_users")    // 对应数据库 app_users 表
public class AppUser {

    @Id                       // 标记为主键
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 主键自增，数据库自动分配 ID
    private Long id;          // 用户 ID（插入时不需要手动指定）

    @Column(unique = true, nullable = false) // unique=不允许重复，nullable=不允许为空
    private String username;  // 用户名（唯一且必填）

    @Column(name = "password_hash", nullable = false) // 存储加密后的密码
    private String passwordHash; // 密码哈希值（不存明文密码！）

    @Column(name = "created_at") // 创建时间列
    private LocalDateTime createdAt; // 注册时间

    @PrePersist              // 插入前自动执行
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(); // 自动记录注册时间
    }

    // ... Getter/Setter 省略
}
```

TypeScript 等价代码对比：

```typescript
// TypeScript 中没有数据库约束，只有类型定义
interface AppUser {
  id: number;          // 对应 @GeneratedValue 自增 ID
  username: string;    // 对应 @Column(unique=true) 唯一用户名
  passwordHash: string; // 对应加密后的密码
  createdAt: string;   // 对应 @PrePersist 自动设置的时间
}

// Java 的 @Column(unique=true) 在数据库层面保证唯一性
// TypeScript 需要在业务逻辑中手动检查：
// if (users.some(u => u.username === newUsername)) throw new Error("用户名已存在")
```

> **新概念解释**：
> - `@GeneratedValue(strategy = GenerationType.IDENTITY)`：让数据库自动生成递增的 ID（1, 2, 3...），你插入数据时不需要指定 ID
> - `@Column(unique = true)`：数据库层面的唯一约束，如果插入重复值会报错
> - `@PrePersist`：JPA 生命周期钩子，在数据保存到数据库**之前**自动执行，类似 React 的 `useEffect` 在组件挂载时执行

---

## 3.3 Repository 数据访问层

### 什么是 Repository？

Repository 是"数据访问层"，专门负责和数据库打交道。你可以把它理解为：**数据库操作的工具箱**。

> **前端类比**：Repository 就像 `api.ts` 里的函数，但操作的是数据库而不是 HTTP 请求。

### Spring Data JPA 的"魔法"

最神奇的地方：**你只需要定义接口（interface），不需要写任何实现代码！** Spring 会在程序启动时自动生成实现类。

来自 `java-backend/src/main/java/com/example/fetchdemo/repository/PostRepository.java`：

```java
package com.example.fetchdemo.repository; // 包声明

import java.util.List; // 导入 List 类型

import org.springframework.data.jpa.repository.JpaRepository; // 导入 JPA 仓库接口
import org.springframework.stereotype.Repository; // 导入 Repository 注解

import com.example.fetchdemo.entity.Post; // 导入 Post 实体

@Repository // 标记为数据访问组件，Spring 会自动管理
public interface PostRepository extends JpaRepository<Post, Long> {
    // JpaRepository<Post, Long> 的含义：
    // - Post：操作的实体类型
    // - Long：主键（ID）的类型

    // 继承 JpaRepository 后，自动获得这些方法（无需自己写）：
    // save(post)      → 保存或更新
    // findById(id)    → 按 ID 查询，返回 Optional<Post>
    // findAll()       → 查询所有
    // deleteById(id)  → 按 ID 删除
    // count()         → 统计总数
    // existsById(id)  → 判断是否存在

    List<Post> findByUserId(Long userId); // 按用户 ID 查询帖子（Spring 根据方法名自动生成 SQL）

    List<Post> findByTitleContainingIgnoreCase(String title); // 按标题模糊搜索（不区分大小写）
}
```

TypeScript 等价代码对比：

```typescript
// 来自 fetch-mcp-demo/src/services/api.ts
// 前端通过 HTTP 请求实现类似功能

// Java: postRepository.findAll()
// TypeScript 等价：
export async function fetchDatabasePosts(): Promise<Post[]> {
  return unwrap<Post[]>(await authFetch(`${API_BASE}/db/posts`)); // 发送 GET 请求获取所有帖子
}

// Java: postRepository.findById(id)
// TypeScript 等价：
export async function getPostById(id: number): Promise<Post> {
  return unwrap<Post>(await authFetch(`${API_BASE}/db/posts/detail?id=${id}`)); // 按 ID 查询
}

// Java: postRepository.save(post)
// TypeScript 等价：
export async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
  return unwrap<Post>(await authFetch(`${API_BASE}/db/posts`, {
    method: 'POST', // 发送 POST 请求创建帖子
    headers: { 'Content-Type': 'application/json' }, // 设置请求头
    body: JSON.stringify(post), // 将对象序列化为 JSON
  }));
}

// Java: postRepository.deleteById(id)
// TypeScript 等价：
export async function deletePost(id: number): Promise<void> {
  await unwrap<void>(await authFetch(`${API_BASE}/db/posts/delete?id=${id}`, {
    method: 'DELETE', // 发送 DELETE 请求
  }));
}
```

### 自定义查询方法命名规则

Spring Data JPA 最强大的特性之一：**根据方法名自动生成 SQL**。你只需要按照命名规则定义方法，Spring 就会自动实现。

| 方法名 | 自动生成的 SQL | 前端类比 |
|--------|---------------|----------|
| `findByUserId(userId)` | `WHERE user_id = ?` | `posts.filter(p => p.userId === userId)` |
| `findByTitleContainingIgnoreCase(title)` | `WHERE LOWER(title) LIKE LOWER('%title%')` | `posts.filter(p => p.title.toLowerCase().includes(title.toLowerCase()))` |
| `findByCity(city)` | `WHERE city = ?` | `users.filter(u => u.city === city)` |
| `findByEmailContaining(email)` | `WHERE email LIKE '%email%'` | `users.filter(u => u.email.includes(email))` |

命名规则速查：

| 关键词 | 含义 | SQL 等价 |
|--------|------|---------|
| `findBy` | 查询 | `SELECT * FROM ... WHERE` |
| `And` | 且 | `AND` |
| `Or` | 或 | `OR` |
| `Containing` | 包含（模糊匹配） | `LIKE '%...%'` |
| `IgnoreCase` | 不区分大小写 | `LOWER(...)` |
| `OrderBy...Desc` | 降序排列 | `ORDER BY ... DESC` |

### 使用 @Query 自定义 SQL

当方法名无法表达复杂查询时，可以用 `@Query` 注解直接写 JPQL（类似 SQL）。

来自 `java-backend/src/main/java/com/example/fetchdemo/repository/UserRepository.java`（部分）：

```java
@Repository // 标记为数据访问组件
public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByCity(String city); // 按城市查询（自动生成 SQL）

    List<User> findByEmailContaining(String keyword); // 按邮箱模糊查询

    // 使用 @Query 自定义 JPQL 查询
    @Query("SELECT DISTINCT u.city FROM User u WHERE u.city IS NOT NULL") // JPQL：查询所有不同的城市
    List<String> findAllCities(); // 返回去重后的城市列表

    @Query("SELECT MAX(u.id) FROM User u") // JPQL：查询最大 ID
    Long findMaxId(); // 比 findAll() 再遍历高效得多，只执行一条 SQL
}
```

TypeScript 等价代码对比：

```typescript
// Java: userRepository.findByCity("北京")
// TypeScript 等价：
export async function getUsersByCity(city: string): Promise<User[]> {
  return unwrap<User[]>(
    await authFetch(`${API_BASE}/db/users/by-city?city=${encodeURIComponent(city)}`) // 按城市查询
  );
}

// Java: userRepository.findAllCities()
// TypeScript 等价：
export async function getAllCities(): Promise<string[]> {
  return unwrap<string[]>(await authFetch(`${API_BASE}/db/cities`)); // 获取所有城市
}

// Java 的 @Query 类似于前端直接写 SQL 查询
// 区别：Java 用 JPQL（面向对象的查询语言），前端通常不直接写 SQL
```

### AppUserRepository（返回 Optional）

来自 `java-backend/src/main/java/com/example/fetchdemo/repository/AppUserRepository.java`：

```java
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username); // 按用户名查询，返回 Optional（可能为空）
}
// Optional 是 Java 处理"可能不存在"的方式
// 类似 TypeScript 的 User | undefined
// 强制调用方处理"找不到"的情况，避免空指针异常
```

TypeScript 等价代码对比：

```typescript
// Java 的 Optional<AppUser> 类似 TypeScript 的可选类型
// Java: appUserRepository.findByUsername("admin") → Optional<AppUser>
// TypeScript 等价：
async function findByUsername(username: string): Promise<AppUser | undefined> {
  const users = await fetchUsers(); // 获取用户列表
  return users.find(u => u.username === username); // 可能返回 undefined
}

// Java 用 Optional 的链式调用处理：
// optional.orElseThrow(() -> new Error("未找到"))
// TypeScript 等价：
// const user = result ?? throw new Error("未找到")
```

> **新概念解释**：
> - `Optional<T>`：Java 8 引入的容器类型，表示"值可能存在也可能不存在"。类似 TypeScript 的 `T | null | undefined`，但提供了 `.map()`、`.orElse()`、`.orElseThrow()` 等链式方法，强制你处理空值情况
> - `JpaRepository<Entity, IdType>`：Spring Data JPA 提供的接口，继承它就自动获得完整的 CRUD 方法，无需写任何实现代码
> - `@Repository`：Spring 的组件注解，标记这是数据访问层组件，Spring 会自动创建实例并管理其生命周期

---

## 3.4 Service 业务逻辑层

### 什么是 Service？

Service 层是三层架构的"中间层"，负责处理业务逻辑。它从 Controller 接收请求数据，调用 Repository 操作数据库，然后将结果返回给 Controller。

> **前端类比**：Service 类似 React 的自定义 Hook（如 `useAuth`），封装了业务逻辑，让 Controller（组件）保持简洁。

### PostService 完整代码

来自 `java-backend/src/main/java/com/example/fetchdemo/service/PostService.java`：

```java
package com.example.fetchdemo.service; // 包声明

import java.util.ArrayList; // 导入可变列表
import java.util.HashMap;   // 导入哈希映射（类似 JS 的 Object/Map）
import java.util.List;      // 导入列表接口
import java.util.Map;       // 导入映射接口
import java.util.Optional;  // 导入 Optional 容器
import java.util.Set;       // 导入集合（不重复元素）
import java.util.stream.Collectors; // 导入流收集器

import org.slf4j.Logger;          // 导入日志接口
import org.slf4j.LoggerFactory;   // 导入日志工厂
import org.springframework.beans.factory.annotation.Autowired; // 导入自动注入注解
import org.springframework.stereotype.Service;                  // 导入 Service 注解
import org.springframework.transaction.annotation.Transactional; // 导入事务注解

import com.example.fetchdemo.entity.Post;             // 导入 Post 实体
import com.example.fetchdemo.repository.PostRepository; // 导入 Post 仓库

@Service // 标记为业务逻辑组件，Spring 自动管理（单例模式，全局只有一个实例）
public class PostService {

    // 日志记录器，用于输出调试信息（类似前端的 console.log）
    private static final Logger log = LoggerFactory.getLogger(PostService.class);

    // 声明依赖：PostRepository（final 表示赋值后不可修改）
    private final PostRepository postRepository;

    @Autowired // 依赖注入：Spring 启动时自动传入 PostRepository 实例
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository; // 保存注入的 Repository 实例
    }

    // 获取所有帖子
    public List<Post> findAll() {
        return postRepository.findAll(); // 调用 Repository 查询所有数据
    }

    // 按 ID 查询帖子，返回 Optional（可能为空）
    public Optional<Post> findById(Long id) {
        return postRepository.findById(id); // 调用 Repository 按 ID 查询
    }

    // 保存（新增或更新）帖子
    public Post save(Post post) {
        return postRepository.save(post); // ID 不存在则 INSERT，已存在则 UPDATE
    }

    // 按 ID 删除帖子
    public void deleteById(Long id) {
        postRepository.deleteById(id); // 调用 Repository 删除
    }

    @Transactional // 事务注解：方法内所有数据库操作要么全部成功，要么全部回滚
    public Map<String, Object> batchSave(List<Map<String, Object>> postsData) {
        if (postsData == null || postsData.isEmpty()) { // 空数据检查
            Map<String, Object> result = new HashMap<>(); // 创建结果 Map
            result.put("success", false);     // 标记失败
            result.put("savedCount", 0);      // 新增数量为 0
            result.put("updatedCount", 0);    // 更新数量为 0
            result.put("failedCount", 0);     // 失败数量为 0
            result.put("message", "没有数据需要保存"); // 提示信息
            return result; // 直接返回
        }

        log.info("批量保存帖子，数量: {}", postsData.size()); // 记录日志

        List<Post> toSave = new ArrayList<>(); // 待保存的帖子列表
        int failedCount = 0; // 失败计数器

        // 步骤 1：一次性查出所有已存在的 ID（用于区分新增和更新）
        List<Long> incomingIds = postsData.stream() // 将列表转为流（类似 JS 的 .map()）
                .map(d -> toLong(d.get("id")))       // 提取每条数据的 id
                .filter(id -> id != null)             // 过滤掉 null（类似 JS 的 .filter()）
                .collect(Collectors.toList());         // 收集为列表

        Set<Long> existingIds = postRepository.findAllById(incomingIds) // 批量查询已存在的记录
                .stream()                              // 转为流
                .map(Post::getId)                      // 提取 ID（方法引用，类似 JS 的 p => p.id）
                .collect(Collectors.toSet());           // 收集为 Set（去重）

        // 步骤 2：将 Map 数据转换为 Post 实体
        for (Map<String, Object> data : postsData) { // 遍历每条数据
            try {
                Long id = toLong(data.get("id")); // 转换 ID
                if (id == null) { failedCount++; continue; } // ID 缺失则跳过

                Post post = new Post();           // 创建新的 Post 对象
                post.setId(id);                   // 设置 ID
                post.setUserId(toLong(data.get("userId"))); // 设置用户 ID
                post.setTitle(data.get("title") != null ? data.get("title").toString() : ""); // 设置标题（防空指针）
                post.setBody(data.get("body") != null ? data.get("body").toString() : "");   // 设置正文（防空指针）
                toSave.add(post);                 // 添加到待保存列表
            } catch (Exception e) {               // 捕获转换异常
                log.warn("转换帖子数据失败: {}", e.getMessage()); // 记录警告日志
                failedCount++;                    // 失败计数 +1
            }
        }

        // 步骤 3：批量保存（一次数据库操作，比逐条保存高效得多）
        List<Post> saved = postRepository.saveAll(toSave); // 批量保存

        // 统计新增 vs 更新
        int updatedCount = (int) saved.stream()
                .filter(p -> existingIds.contains(p.getId())) // 如果 ID 已存在，则为更新
                .count(); // 统计更新数量
        int savedCount = saved.size() - updatedCount; // 总数 - 更新数 = 新增数

        log.info("批量保存完成: 新增={}, 更新={}, 失败={}", savedCount, updatedCount, failedCount); // 记录结果

        Map<String, Object> result = new HashMap<>(); // 构建返回结果
        result.put("success", failedCount == 0);      // 无失败则成功
        result.put("savedCount", savedCount);          // 新增数量
        result.put("updatedCount", updatedCount);      // 更新数量
        result.put("failedCount", failedCount);        // 失败数量
        result.put("message", String.format("新增 %d 条，更新 %d 条", savedCount, updatedCount)); // 格式化消息
        return result; // 返回结果
    }

    // 私有辅助方法：将任意类型转换为 Long
    private Long toLong(Object obj) {
        if (obj instanceof Number n) return n.longValue();   // 如果是数字类型，直接转换
        if (obj instanceof String s) {                        // 如果是字符串
            try { return Long.parseLong(s); }                 // 尝试解析为数字
            catch (NumberFormatException ignored) {}           // 解析失败则忽略
        }
        return null; // 无法转换返回 null
    }
}
```

TypeScript 等价代码对比：

```typescript
// TypeScript 版本的 PostService
// 前端没有 @Service 注解，通常用普通模块或自定义 Hook 封装

// Java: @Autowired PostRepository → 依赖注入
// TypeScript: 直接 import 模块
import { authFetch, unwrap } from './api'; // 导入请求工具

const API_BASE = 'http://localhost:8080/api'; // API 基础地址

// Java: postService.findAll() → postRepository.findAll()
// TypeScript 等价：
export async function findAll(): Promise<Post[]> {
  return unwrap<Post[]>(await authFetch(`${API_BASE}/db/posts`)); // 获取所有帖子
}

// Java: postService.findById(id) → Optional<Post>
// TypeScript 等价：
export async function findById(id: number): Promise<Post | null> {
  try {
    return await unwrap<Post>(await authFetch(`${API_BASE}/db/posts/detail?id=${id}`)); // 按 ID 查询
  } catch {
    return null; // 类似 Java 的 Optional.empty()
  }
}

// Java: @Transactional batchSave(...)
// TypeScript 没有事务概念，通常依赖后端保证原子性
export async function batchSave(posts: Post[]): Promise<SaveResult> {
  return unwrap<SaveResult>(await authFetch(`${API_BASE}/posts/batch`, {
    method: 'POST', // 发送批量保存请求
    body: JSON.stringify(posts), // 序列化数据
  }));
}
```

### Service 层核心概念

| Java 概念 | 说明 | TypeScript 类比 |
|-----------|------|----------------|
| `@Service` | 标记为业务逻辑组件，Spring 自动管理生命周期 | `export function`（模块导出） |
| `@Autowired` | 依赖注入，Spring 自动传入所需的对象 | `import { xxx } from './module'` |
| `@Transactional` | 事务管理，方法内操作要么全成功要么全回滚 | 无直接等价，依赖后端 |
| `Optional<T>` | 表示值可能不存在，强制处理空值 | `T \| null \| undefined` |
| `Logger` | 日志记录器，输出调试信息 | `console.log / console.warn` |

> **新概念解释**：
> - `@Autowired`（依赖注入）：你不需要手动 `new PostRepository()`，Spring 会自动创建实例并传入。类似前端的 `import`，但更强大——Spring 管理所有对象的创建和生命周期
> - `@Transactional`（事务）：保证一组数据库操作的原子性。比如批量保存 100 条数据，如果第 50 条失败，前面 49 条也会回滚（撤销）。前端没有这个概念，因为前端不直接操作数据库
> - `Logger`：Java 的日志系统比 `console.log` 更强大，支持日志级别（DEBUG/INFO/WARN/ERROR）、输出到文件、格式化等

---

## 3.5 Controller 控制器层

### 什么是 Controller？

Controller 是三层架构的"入口层"，负责接收 HTTP 请求、调用 Service 处理业务逻辑、返回 HTTP 响应。

> **前端类比**：Controller 类似 React 组件中的事件处理函数，或者 Express.js 的路由处理器。

### PostController 完整代码

来自 `java-backend/src/main/java/com/example/fetchdemo/controller/PostController.java`：

```java
package com.example.fetchdemo.controller; // 包声明

import java.util.List; // 导入列表类型
import java.util.Map;  // 导入映射类型

import org.springframework.beans.factory.annotation.Autowired; // 导入自动注入
import org.springframework.http.HttpStatus;       // 导入 HTTP 状态码枚举
import org.springframework.http.ResponseEntity;   // 导入响应实体（包装 HTTP 响应）
import org.springframework.web.bind.annotation.DeleteMapping; // 导入 DELETE 映射
import org.springframework.web.bind.annotation.GetMapping;    // 导入 GET 映射
import org.springframework.web.bind.annotation.PostMapping;   // 导入 POST 映射
import org.springframework.web.bind.annotation.PutMapping;    // 导入 PUT 映射
import org.springframework.web.bind.annotation.RequestBody;   // 导入请求体注解
import org.springframework.web.bind.annotation.RequestMapping; // 导入路由前缀
import org.springframework.web.bind.annotation.RequestParam;  // 导入查询参数注解
import org.springframework.web.bind.annotation.RestController; // 导入 REST 控制器注解

import com.example.fetchdemo.common.ApiResponse; // 导入统一响应类
import com.example.fetchdemo.entity.Post;        // 导入 Post 实体
import com.example.fetchdemo.service.PostService; // 导入 Post 服务

@RestController          // 标记为 REST 控制器（自动将返回值序列化为 JSON）
@RequestMapping("/api")  // 路由前缀：所有接口以 /api 开头
public class PostController {

    private final PostService postService; // 声明 Service 依赖

    @Autowired // 依赖注入：Spring 自动传入 PostService 实例
    public PostController(PostService postService) {
        this.postService = postService; // 保存注入的 Service
    }

    // GET /api/db/posts → 获取所有帖子
    @GetMapping("/db/posts") // 映射 GET 请求到 /api/db/posts
    public ResponseEntity<ApiResponse<List<Post>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(postService.findAll())); // 200 OK + 数据
    }

    // GET /api/db/posts/detail?id=1 → 按 ID 查询
    @GetMapping("/db/posts/detail") // 映射 GET 请求
    public ResponseEntity<ApiResponse<Post>> getById(@RequestParam Long id) { // @RequestParam 从 URL 参数取值
        return postService.findById(id) // 调用 Service 查询
                .map(post -> ResponseEntity.ok(ApiResponse.ok(post))) // 找到 → 200 OK
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)   // 没找到 → 404
                        .body(ApiResponse.fail("帖子不存在，ID: " + id))); // 返回错误信息
    }

    // POST /api/db/posts → 新增帖子
    @PostMapping("/db/posts") // 映射 POST 请求
    public ResponseEntity<ApiResponse<Post>> create(@RequestBody Post post) { // @RequestBody 从请求体解析 JSON
        return ResponseEntity.status(HttpStatus.CREATED) // 201 Created
                .body(ApiResponse.ok(postService.save(post), "创建成功")); // 保存并返回
    }

    // PUT /api/db/posts/update?id=1 → 更新帖子
    @PutMapping("/db/posts/update") // 映射 PUT 请求
    public ResponseEntity<ApiResponse<Post>> update(
            @RequestParam Long id,    // 从 URL 参数取 ID
            @RequestBody Post post) { // 从请求体取更新数据
        if (postService.findById(id).isEmpty()) { // 检查帖子是否存在
            return ResponseEntity.status(HttpStatus.NOT_FOUND) // 不存在 → 404
                    .body(ApiResponse.fail("帖子不存在，ID: " + id)); // 错误信息
        }
        post.setId(id); // 确保 ID 来自 URL 参数（防止请求体篡改 ID）
        return ResponseEntity.ok(ApiResponse.ok(postService.save(post), "更新成功")); // 保存并返回
    }

    // DELETE /api/db/posts/delete?id=1 → 删除帖子
    @DeleteMapping("/db/posts/delete") // 映射 DELETE 请求
    public ResponseEntity<ApiResponse<Void>> delete(@RequestParam Long id) { // Void 表示无返回数据
        if (postService.findById(id).isEmpty()) { // 检查帖子是否存在
            return ResponseEntity.status(HttpStatus.NOT_FOUND) // 不存在 → 404
                    .body(ApiResponse.fail("帖子不存在，ID: " + id)); // 错误信息
        }
        postService.deleteById(id); // 执行删除
        return ResponseEntity.ok(ApiResponse.ok(null, "删除成功")); // 200 OK，data 为 null
    }

    // POST /api/posts/batch → 批量保存帖子
    @PostMapping("/posts/batch") // 映射 POST 请求
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchSave(
            @RequestBody List<Map<String, Object>> posts) { // 接收 JSON 数组
        if (posts == null || posts.isEmpty()) { // 空数据检查
            return ResponseEntity.badRequest().body(ApiResponse.fail("请求数据为空")); // 400 Bad Request
        }
        Map<String, Object> result = postService.batchSave(posts); // 调用 Service 批量保存
        return ResponseEntity.ok(ApiResponse.ok(result, result.get("message").toString())); // 返回结果
    }
}
```

TypeScript 等价代码对比（Express.js 风格）：

```typescript
// TypeScript (Express.js) 等价的路由定义
// Java 的 @RestController + @RequestMapping 类似 Express 的 Router

import express from 'express'; // 导入 Express
const router = express.Router(); // 创建路由器（类似 @RequestMapping("/api")）

// Java: @GetMapping("/db/posts") → GET /api/db/posts
router.get('/db/posts', async (req, res) => {
  const posts = await postService.findAll(); // 调用 Service
  res.json({ success: true, data: posts, message: "操作成功" }); // 返回 JSON
});

// Java: @GetMapping("/db/posts/detail") + @RequestParam
router.get('/db/posts/detail', async (req, res) => {
  const id = Number(req.query.id); // @RequestParam 类似 req.query
  const post = await postService.findById(id); // 查询
  if (!post) return res.status(404).json({ success: false, data: null, message: "帖子不存在" }); // 404
  res.json({ success: true, data: post, message: "操作成功" }); // 200
});

// Java: @PostMapping("/db/posts") + @RequestBody
router.post('/db/posts', async (req, res) => {
  const post = req.body; // @RequestBody 类似 req.body
  const saved = await postService.save(post); // 保存
  res.status(201).json({ success: true, data: saved, message: "创建成功" }); // 201 Created
});

// Java: @DeleteMapping("/db/posts/delete") + @RequestParam
router.delete('/db/posts/delete', async (req, res) => {
  const id = Number(req.query.id); // 从查询参数取 ID
  await postService.deleteById(id); // 删除
  res.json({ success: true, data: null, message: "删除成功" }); // 200
});
```

### Controller 层核心注解

| Java 注解 | 作用 | Express.js 类比 |
|-----------|------|-----------------|
| `@RestController` | 标记为 REST 控制器，自动序列化 JSON | `express.Router()` |
| `@RequestMapping("/api")` | 路由前缀 | `app.use('/api', router)` |
| `@GetMapping("/path")` | 映射 GET 请求 | `router.get('/path', handler)` |
| `@PostMapping("/path")` | 映射 POST 请求 | `router.post('/path', handler)` |
| `@PutMapping("/path")` | 映射 PUT 请求 | `router.put('/path', handler)` |
| `@DeleteMapping("/path")` | 映射 DELETE 请求 | `router.delete('/path', handler)` |
| `@RequestParam Long id` | 从 URL 查询参数取值 | `req.query.id` |
| `@RequestBody Post post` | 从请求体解析 JSON | `req.body` |
| `ResponseEntity<T>` | 包装 HTTP 响应（状态码 + 响应体） | `res.status(200).json(data)` |

> **新概念解释**：
> - `@RestController`：是 `@Controller` + `@ResponseBody` 的组合。`@Controller` 标记为控制器，`@ResponseBody` 表示返回值直接作为 HTTP 响应体（自动转 JSON），而不是视图模板名
> - `ResponseEntity<T>`：Spring 的 HTTP 响应包装类，可以设置状态码、响应头和响应体。`ResponseEntity.ok(data)` 等价于 `res.status(200).json(data)`
> - `@RequestParam`：从 URL 的查询参数中取值，如 `/api/posts?id=1` 中的 `id=1`
> - `@RequestBody`：从 HTTP 请求体中解析 JSON 并自动转换为 Java 对象

---

## 3.6 JWT 认证完整实现

### 什么是 JWT？

JWT（JSON Web Token）是一种无状态的认证方案。用户登录后，服务器生成一个加密的 Token 返回给前端，前端后续请求都携带这个 Token，服务器验证 Token 来确认用户身份。

> **前端类比**：JWT 认证的前端部分在 `AuthContext.tsx` 中实现，后端部分在 `JwtUtil.java`、`JwtFilter.java`、`AuthService.java` 中实现。两端配合完成完整的认证流程。

### 认证流程

```
1. 用户注册：前端 → POST /auth/register → AuthController → AuthService → 密码加密 → 存入数据库
2. 用户登录：前端 → POST /auth/login → AuthController → AuthService → 验证密码 → JwtUtil 生成 Token → 返回 Token
3. 携带 Token：前端 authFetch 自动在请求头添加 Authorization: Bearer <token>
4. 验证 Token：JwtFilter 拦截请求 → 提取 Token → JwtUtil 验证 → 通过则放行，否则返回 401
```

### JwtUtil 工具类

JwtUtil 负责 Token 的生成和解析，是 JWT 认证的核心。

来自 `java-backend/src/main/java/com/example/fetchdemo/util/JwtUtil.java`：

```java
package com.example.fetchdemo.util; // 包声明

import io.jsonwebtoken.Jwts;           // 导入 JWT 构建器
import io.jsonwebtoken.io.Decoders;    // 导入 Base64 解码器
import io.jsonwebtoken.security.Keys;  // 导入密钥工具
import org.springframework.beans.factory.annotation.Value; // 导入配置值注解
import org.springframework.stereotype.Component;           // 导入组件注解

import javax.crypto.SecretKey; // 导入密钥类型
import java.util.Date;        // 导入日期类型

@Component // 标记为 Spring 组件，可以被其他类通过 @Autowired 注入
public class JwtUtil {

    @Value("${jwt.secret}") // 从 application.properties 读取 jwt.secret 配置值
    private String secret;  // JWT 签名密钥（Base64 编码的字符串）

    // 将 Base64 字符串转换为 HMAC 密钥对象
    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret); // Base64 解码为字节数组
        return Keys.hmacShaKeyFor(keyBytes);               // 生成 HMAC-SHA 密钥
    }

    // 生成 JWT Token
    public String generateToken(String username) {
        return Jwts.builder()                    // 创建 JWT 构建器
                .subject(username)                // 设置主题（存储用户名）
                .issuedAt(new Date())             // 设置签发时间（当前时间）
                .expiration(new Date(System.currentTimeMillis() + 86400_000L)) // 设置过期时间（24 小时后）
                .signWith(getKey())               // 使用密钥签名
                .compact();                       // 生成最终的 Token 字符串
    }

    // 从 Token 中提取用户名（同时验证 Token 是否有效）
    public String extractUsername(String token) {
        return Jwts.parser()                     // 创建 JWT 解析器
                .verifyWith(getKey())             // 设置验证密钥
                .build()                          // 构建解析器
                .parseSignedClaims(token)         // 解析并验证 Token（无效会抛异常）
                .getPayload()                     // 获取载荷（Payload）
                .getSubject();                    // 提取主题（用户名）
    }
}
```

TypeScript 等价代码对比：

```typescript
// TypeScript 版本的 JWT 工具（使用 jsonwebtoken 库）
import jwt from 'jsonwebtoken'; // 导入 JWT 库

const SECRET = process.env.JWT_SECRET || 'default-secret'; // 从环境变量读取密钥

// Java: jwtUtil.generateToken(username)
// TypeScript 等价：
function generateToken(username: string): string {
  return jwt.sign(                // 生成 Token
    { sub: username },            // 载荷（subject 存储用户名）
    SECRET,                       // 签名密钥
    { expiresIn: '24h' }         // 过期时间 24 小时
  );
}

// Java: jwtUtil.extractUsername(token)
// TypeScript 等价：
function extractUsername(token: string): string {
  const payload = jwt.verify(token, SECRET) as { sub: string }; // 验证并解析 Token
  return payload.sub; // 提取用户名
}
```

### JwtFilter 过滤器

JwtFilter 拦截所有 HTTP 请求，检查是否携带有效的 JWT Token。白名单中的路径（如登录、注册）不需要 Token。

来自 `java-backend/src/main/java/com/example/fetchdemo/filter/JwtFilter.java`：

```java
package com.example.fetchdemo.filter; // 包声明

import com.example.fetchdemo.util.JwtUtil;     // 导入 JWT 工具
import io.jsonwebtoken.ExpiredJwtException;     // 导入 Token 过期异常
import io.jsonwebtoken.JwtException;            // 导入 JWT 通用异常
import jakarta.servlet.*;                        // 导入 Servlet 相关类
import jakarta.servlet.http.HttpServletRequest;  // 导入 HTTP 请求
import jakarta.servlet.http.HttpServletResponse; // 导入 HTTP 响应
import org.springframework.stereotype.Component; // 导入组件注解

import java.io.IOException; // 导入 IO 异常
import java.util.List;      // 导入列表

@Component // 标记为 Spring 组件
public class JwtFilter implements Filter { // 实现 Filter 接口（类似 Express 中间件）

    private final JwtUtil jwtUtil; // JWT 工具依赖

    // 白名单：这些路径不需要 Token 验证
    private static final List<String> WHITELIST = List.of(
            "/auth/register",    // 注册接口
            "/auth/login",       // 登录接口
            "/api/posts/",       // 帖子批量接口
            "/api/users/batch"   // 用户批量接口
    );

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil; // 注入 JWT 工具
    }

    @Override // 重写 Filter 的 doFilter 方法
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;   // 转换为 HTTP 请求
        HttpServletResponse httpResponse = (HttpServletResponse) response; // 转换为 HTTP 响应
        String path = httpRequest.getRequestURI(); // 获取请求路径

        if (isWhitelisted(path)) {       // 检查是否在白名单中
            chain.doFilter(request, response); // 在白名单中，直接放行
            return; // 结束处理
        }

        String authHeader = httpRequest.getHeader("Authorization"); // 获取 Authorization 请求头
        if (authHeader == null || !authHeader.startsWith("Bearer ")) { // 检查是否携带 Bearer Token
            sendJsonError(httpResponse, 401, "缺少认证 token"); // 没有 Token → 401
            return; // 结束处理
        }

        String token = authHeader.substring(7); // 提取 Token（去掉 "Bearer " 前缀）
        try {
            jwtUtil.extractUsername(token); // 验证 Token（无效会抛异常）
            chain.doFilter(request, response); // Token 有效，放行请求
        } catch (ExpiredJwtException e) {      // Token 已过期
            sendJsonError(httpResponse, 401, "token 已过期"); // 返回 401
        } catch (JwtException e) {             // Token 无效（签名错误等）
            sendJsonError(httpResponse, 401, "token 无效"); // 返回 401
        }
    }

    // 检查路径是否在白名单中
    private boolean isWhitelisted(String path) {
        return WHITELIST.stream().anyMatch(w -> path.equals(w) || path.startsWith(w)); // 精确匹配或前缀匹配
    }

    // 返回 JSON 格式的错误响应
    private void sendJsonError(HttpServletResponse response, int status, String message)
            throws IOException {
        response.setStatus(status);                              // 设置 HTTP 状态码
        response.setContentType("application/json;charset=UTF-8"); // 设置响应类型为 JSON
        response.getWriter().write(                              // 写入响应体
                String.format("{\"success\":false,\"data\":null,\"message\":\"%s\"}", message) // JSON 格式
        );
    }
}
```

TypeScript 等价代码对比（前端 authFetch）：

```typescript
// 来自 fetch-mcp-demo/src/services/api.ts
// 前端的 authFetch 自动携带 Token，与后端 JwtFilter 配合

const TOKEN_KEY = 'jwt_token'; // Token 存储的 key

// 自动携带 Token 的 fetch 封装（对应后端 JwtFilter 的验证逻辑）
function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem(TOKEN_KEY); // 从 localStorage 读取 Token
  const isAuthRoute = url.includes('/auth/');     // 判断是否是认证路由（类似后端白名单）
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',           // 设置请求头
    ...(options.headers as Record<string, string>), // 合并自定义请求头
  };
  if (token && !isAuthRoute) {                    // 有 Token 且不是认证路由
    headers['Authorization'] = `Bearer ${token}`; // 添加 Authorization 头（后端 JwtFilter 会读取这个）
  }
  return fetch(url, { ...options, headers });     // 发送请求
}

// 响应解包（处理 401 自动登出，对应后端 JwtFilter 返回的 401）
async function unwrap<T>(response: Response): Promise<T> {
  if (response.status === 401) {                  // 后端 JwtFilter 返回 401
    window.dispatchEvent(new Event('auth:logout')); // 触发登出事件
    throw new Error('认证已过期，请重新登录');       // 抛出错误
  }
  // ... 其他处理
}
```

### AuthService 认证服务

AuthService 处理用户注册和登录的业务逻辑，使用 BCrypt 加密密码。

来自 `java-backend/src/main/java/com/example/fetchdemo/service/AuthService.java`：

```java
@Service // 标记为业务逻辑组件
public class AuthService {

    private final AppUserRepository appUserRepository; // 用户数据访问
    private final JwtUtil jwtUtil;                     // JWT 工具
    // BCrypt 密码加密器，强度为 10（数字越大越安全但越慢）
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    // 构造函数注入依赖
    public AuthService(AppUserRepository appUserRepository, JwtUtil jwtUtil) {
        this.appUserRepository = appUserRepository; // 注入用户仓库
        this.jwtUtil = jwtUtil;                     // 注入 JWT 工具
    }

    // 用户注册
    public void register(String username, String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) { // 输入校验
            throw new IllegalArgumentException("用户名和密码不能为空"); // 抛出参数异常
        }
        if (appUserRepository.findByUsername(username).isPresent()) { // 检查用户名是否已存在
            throw new UsernameExistsException("用户名已存在"); // 抛出自定义异常
        }
        AppUser user = new AppUser();                    // 创建新用户对象
        user.setUsername(username);                       // 设置用户名
        user.setPasswordHash(passwordEncoder.encode(password)); // BCrypt 加密密码后存储
        appUserRepository.save(user);                    // 保存到数据库
    }

    // 用户登录
    public String login(String username, String password) {
        AppUser user = appUserRepository.findByUsername(username) // 按用户名查询
                .orElseThrow(() -> new BadCredentialsException("该账号未注册，请先注册")); // 不存在则抛异常
        if (!passwordEncoder.matches(password, user.getPasswordHash())) { // 验证密码
            throw new BadCredentialsException("密码错误，请重试"); // 密码不匹配
        }
        return jwtUtil.generateToken(username); // 密码正确，生成并返回 JWT Token
    }

    // 自定义异常类
    public static class UsernameExistsException extends RuntimeException { // 用户名已存在异常
        public UsernameExistsException(String message) { super(message); } // 调用父类构造函数
    }

    public static class BadCredentialsException extends RuntimeException { // 凭证错误异常
        public BadCredentialsException(String message) { super(message); } // 调用父类构造函数
    }
}
```

TypeScript 等价代码对比：

```typescript
// TypeScript 版本的认证逻辑（前端调用后端 API）
// 来自 fetch-mcp-demo/src/contexts/AuthContext.tsx 的简化版

const TOKEN_KEY = 'jwt_token'; // Token 存储 key
const AUTH_BASE = 'http://localhost:8080/auth'; // 认证 API 地址

// Java: authService.register(username, password)
// TypeScript 前端等价（调用后端注册接口）：
async function register(username: string, password: string): Promise<void> {
  const res = await fetch(`${AUTH_BASE}/register`, { // 发送注册请求
    method: 'POST', // POST 方法
    headers: { 'Content-Type': 'application/json' }, // JSON 格式
    body: JSON.stringify({ username, password }), // 发送用户名和密码
  });
  if (!res.ok) throw new Error('注册失败'); // 处理错误
}

// Java: authService.login(username, password) → 返回 Token
// TypeScript 前端等价（调用后端登录接口）：
async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${AUTH_BASE}/login`, { // 发送登录请求
    method: 'POST', // POST 方法
    headers: { 'Content-Type': 'application/json' }, // JSON 格式
    body: JSON.stringify({ username, password }), // 发送用户名和密码
  });
  const data = await res.json(); // 解析响应
  localStorage.setItem(TOKEN_KEY, data.data.token); // 存储 Token 到 localStorage
}

// Java: BCryptPasswordEncoder.encode(password)
// 前端不做密码加密，密码加密是后端的职责
// 前端只负责将明文密码通过 HTTPS 安全传输给后端
```

### AuthController 认证控制器

来自 `java-backend/src/main/java/com/example/fetchdemo/controller/AuthController.java`：

```java
@RestController          // REST 控制器
@RequestMapping("/auth") // 路由前缀 /auth
public class AuthController {

    private final AuthService authService; // 认证服务
    private final JwtUtil jwtUtil;         // JWT 工具

    // 构造函数注入
    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService; // 注入认证服务
        this.jwtUtil = jwtUtil;         // 注入 JWT 工具
    }

    // POST /auth/register → 用户注册
    @PostMapping("/register") // 映射 POST 请求
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody Map<String, String> body) {
        String username = body.get("username"); // 从请求体取用户名
        String password = body.get("password"); // 从请求体取密码

        // 输入校验（后端也要校验，不能只依赖前端）
        if (username == null || username.isBlank()) // 用户名为空检查
            return ResponseEntity.badRequest().body(ApiResponse.fail("用户名不能为空")); // 400
        if (username.trim().length() < 3) // 用户名长度检查
            return ResponseEntity.badRequest().body(ApiResponse.fail("用户名至少 3 个字符")); // 400
        if (password == null || password.isBlank()) // 密码为空检查
            return ResponseEntity.badRequest().body(ApiResponse.fail("密码不能为空")); // 400
        if (password.length() < 6) // 密码长度检查
            return ResponseEntity.badRequest().body(ApiResponse.fail("密码至少 6 个字符")); // 400

        try {
            authService.register(username.trim(), password); // 调用 Service 注册
            return ResponseEntity.status(HttpStatus.CREATED) // 201 Created
                    .body(ApiResponse.ok(null, "注册成功")); // 注册成功
        } catch (AuthService.UsernameExistsException e) { // 用户名已存在
            return ResponseEntity.status(HttpStatus.CONFLICT) // 409 Conflict
                    .body(ApiResponse.fail(e.getMessage())); // 返回错误信息
        }
    }

    // POST /auth/login → 用户登录
    @PostMapping("/login") // 映射 POST 请求
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username"); // 取用户名
        String password = body.get("password"); // 取密码

        if (username == null || username.isBlank() || password == null || password.isBlank()) // 空值检查
            return ResponseEntity.badRequest().body(ApiResponse.fail("用户名和密码不能为空")); // 400

        try {
            String token = authService.login(username.trim(), password); // 调用 Service 登录，获取 Token
            return ResponseEntity.ok(ApiResponse.ok(Map.of("token", token), "登录成功")); // 返回 Token
        } catch (AuthService.BadCredentialsException e) { // 凭证错误
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // 401 Unauthorized
                    .body(ApiResponse.fail(e.getMessage())); // 返回错误信息
        }
    }

    // GET /auth/me → 获取当前登录用户信息
    @GetMapping("/me") // 映射 GET 请求
    public ResponseEntity<ApiResponse<Map<String, String>>> me(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization"); // 获取 Authorization 头
        if (authHeader == null || !authHeader.startsWith("Bearer ")) // 检查 Token 格式
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // 401
                    .body(ApiResponse.fail("缺少认证 token")); // 错误信息
        try {
            String username = jwtUtil.extractUsername(authHeader.substring(7)); // 从 Token 提取用户名
            return ResponseEntity.ok(ApiResponse.ok(Map.of("username", username), "ok")); // 返回用户信息
        } catch (Exception e) { // Token 无效
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // 401
                    .body(ApiResponse.fail("token 无效")); // 错误信息
        }
    }
}
```

TypeScript 等价代码对比：

```typescript
// Express.js 等价的认证路由
import express from 'express'; // 导入 Express
import bcrypt from 'bcrypt';   // 导入 BCrypt（类似 Java 的 BCryptPasswordEncoder）
import jwt from 'jsonwebtoken'; // 导入 JWT

const router = express.Router(); // 创建路由器

// Java: @PostMapping("/register")
router.post('/register', async (req, res) => {
  const { username, password } = req.body; // 从请求体取值（类似 @RequestBody）
  if (!username || username.length < 3) // 输入校验
    return res.status(400).json({ success: false, message: "用户名至少 3 个字符" }); // 400
  const hash = await bcrypt.hash(password, 10); // BCrypt 加密密码（强度 10）
  await db.save({ username, passwordHash: hash }); // 保存到数据库
  res.status(201).json({ success: true, message: "注册成功" }); // 201
});

// Java: @PostMapping("/login")
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // 取用户名和密码
  const user = await db.findByUsername(username); // 查询用户
  if (!user) return res.status(401).json({ success: false, message: "未注册" }); // 401
  const match = await bcrypt.compare(password, user.passwordHash); // 验证密码
  if (!match) return res.status(401).json({ success: false, message: "密码错误" }); // 401
  const token = jwt.sign({ sub: username }, SECRET, { expiresIn: '24h' }); // 生成 Token
  res.json({ success: true, data: { token }, message: "登录成功" }); // 返回 Token
});
```

> **新概念解释**：
> - `BCryptPasswordEncoder`：密码加密工具，将明文密码转换为不可逆的哈希值。即使数据库泄露，攻击者也无法还原密码。`encode()` 加密，`matches()` 验证
> - `Filter`（过滤器）：Java Web 的中间件概念，每个 HTTP 请求在到达 Controller 之前都会经过 Filter。类似 Express 的 `app.use(middleware)` 或 axios 的请求拦截器
> - `@Value("${jwt.secret}")`：从配置文件（application.properties）读取值并注入到字段中。类似前端的 `process.env.JWT_SECRET`

---

## 3.7 ApiResponse 统一响应格式

### 为什么需要统一响应格式？

没有统一格式时，每个接口返回的结构都不一样，前端处理起来很麻烦。有了统一格式，前端只需要一个 `unwrap` 函数就能处理所有接口的响应。

来自 `java-backend/src/main/java/com/example/fetchdemo/common/ApiResponse.java`：

```java
package com.example.fetchdemo.common; // 包声明

// 统一 API 响应结构（泛型类）
// <T> 是类型参数，类似 TypeScript 的泛型
public class ApiResponse<T> {

    private final boolean success; // 是否成功（final 表示不可修改）
    private final T data;          // 返回的数据（泛型，可以是任意类型）
    private final String message;  // 提示信息

    // 私有构造函数：强制使用静态工厂方法创建实例
    private ApiResponse(boolean success, T data, String message) {
        this.success = success; // 设置成功标志
        this.data = data;       // 设置数据
        this.message = message; // 设置消息
    }

    // 静态工厂方法：创建成功响应（默认消息）
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, "操作成功"); // success=true
    }

    // 静态工厂方法：创建成功响应（自定义消息）
    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message); // success=true + 自定义消息
    }

    // 静态工厂方法：创建失败响应
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, null, message); // success=false, data=null
    }

    // Getter 方法（没有 Setter，因为字段是 final 的——不可变对象）
    public boolean isSuccess() { return success; } // 读取成功标志
    public T getData() { return data; }             // 读取数据
    public String getMessage() { return message; }  // 读取消息
}
```

TypeScript 等价代码对比（前端的 unwrap 函数）：

```typescript
// 来自 fetch-mcp-demo/src/services/api.ts
// 前端定义了与后端 ApiResponse 完全对应的类型

// Java: ApiResponse<T> 类
// TypeScript 等价：
interface ApiResponse<T> {
  success: boolean; // 对应 Java 的 boolean success
  data: T;          // 对应 Java 的 T data（泛型）
  message: string;  // 对应 Java 的 String message
}

// Java: ApiResponse.ok(data) / ApiResponse.fail(message)
// TypeScript 前端用 unwrap 函数解包后端响应：
async function unwrap<T>(response: Response): Promise<T> {
  if (response.status === 401) {                    // 401 未认证
    window.dispatchEvent(new Event('auth:logout')); // 触发登出
    throw new Error('认证已过期，请重新登录');        // 抛出错误
  }
  if (!response.ok) {                               // HTTP 错误
    const err: ApiResponse<null> = await response.json() // 解析错误响应
      .catch(() => ({ message: response.statusText }));  // 解析失败用状态文本
    throw new Error(err.message || `HTTP ${response.status}`); // 抛出错误
  }
  const body: ApiResponse<T> = await response.json(); // 解析成功响应
  return body.data;                                    // 只返回 data 字段
}
```

### 前后端配合示意

```
后端返回：{ "success": true, "data": { "id": 1, "title": "..." }, "message": "操作成功" }
         ↓
前端 unwrap() 解包
         ↓
前端拿到：{ "id": 1, "title": "..." }  ← 只有 data 部分
```

> **新概念解释**：
> - **泛型 `<T>`**：类型参数，让一个类可以处理多种数据类型。`ApiResponse<Post>` 的 data 是 Post 类型，`ApiResponse<List<Post>>` 的 data 是列表类型。TypeScript 也有完全相同的泛型语法
> - **静态工厂方法**：用 `ApiResponse.ok(data)` 代替 `new ApiResponse(true, data, "操作成功")`，语义更清晰。类似 TypeScript 中用工厂函数代替直接构造对象
> - **不可变对象**：所有字段都是 `final` 的，创建后不能修改。这是一种安全的设计模式，避免对象被意外修改

---

## 3.8 CORS 跨域配置

### 什么是 CORS？

CORS（Cross-Origin Resource Sharing，跨域资源共享）是浏览器的安全策略。默认情况下，网页只能请求和自己"同源"（协议 + 域名 + 端口相同）的服务器。

我们的项目中：
- 前端：`http://localhost:5173`（Vite 开发服务器）
- 后端：`http://localhost:8080`（Spring Boot）

端口不同（5173 ≠ 8080），浏览器会拦截前端对后端的请求。解决方案：后端在响应头里添加 CORS 相关头信息。

来自 `java-backend/src/main/java/com/example/fetchdemo/config/CorsConfig.java`：

```java
package com.example.fetchdemo.config; // 包声明

import java.io.IOException; // 导入 IO 异常

import org.springframework.core.Ordered;           // 导入排序接口
import org.springframework.core.annotation.Order;  // 导入排序注解
import org.springframework.stereotype.Component;    // 导入组件注解

import jakarta.servlet.Filter;        // 导入过滤器接口
import jakarta.servlet.FilterChain;   // 导入过滤器链
import jakarta.servlet.ServletException; // 导入 Servlet 异常
import jakarta.servlet.ServletRequest;   // 导入请求接口
import jakarta.servlet.ServletResponse;  // 导入响应接口
import jakarta.servlet.http.HttpServletRequest;  // 导入 HTTP 请求
import jakarta.servlet.http.HttpServletResponse; // 导入 HTTP 响应

@Component // 注册为 Spring 组件
@Order(Ordered.HIGHEST_PRECEDENCE) // 设置最高优先级，确保在所有 Filter 之前执行
public class CorsConfig implements Filter { // 实现 Filter 接口

    @Override // 重写过滤方法
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse response = (HttpServletResponse) res; // 转换为 HTTP 响应
        HttpServletRequest request = (HttpServletRequest) req;    // 转换为 HTTP 请求

        String origin = request.getHeader("Origin"); // 获取请求来源（如 http://localhost:5173）

        // 动态设置允许的来源（不用 "*" 是因为 allowCredentials=true 时不允许通配符）
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin); // 允许该来源访问
        }

        // 允许的 HTTP 方法
        response.setHeader("Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS, PATCH"); // 允许常用的 HTTP 方法

        // 允许的请求头
        response.setHeader("Access-Control-Allow-Headers",
                "Content-Type, Authorization, X-Requested-With, Accept, Origin"); // 允许前端发送这些头

        // 允许携带 Cookie 和认证信息（如 JWT Token）
        response.setHeader("Access-Control-Allow-Credentials", "true"); // 允许携带凭证

        // 预检请求缓存时间（3600 秒 = 1 小时内不再发送预检请求）
        response.setHeader("Access-Control-Max-Age", "3600"); // 缓存预检结果

        // 处理 OPTIONS 预检请求
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) { // 如果是 OPTIONS 请求
            response.setStatus(HttpServletResponse.SC_OK); // 直接返回 200
            return; // 不继续传递给 Controller
        }

        chain.doFilter(req, res); // 继续传递请求给下一个 Filter 或 Controller
    }
}
```

TypeScript 等价代码对比（Express.js CORS 中间件）：

```typescript
// Express.js 等价的 CORS 配置
import cors from 'cors'; // 导入 cors 中间件

// 方式 1：使用 cors 库（最简单）
app.use(cors({
  origin: true,          // 动态允许所有来源（类似 Java 的 origin != null 判断）
  credentials: true,     // 允许携带凭证（对应 Access-Control-Allow-Credentials）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // 允许的方法
  maxAge: 3600,          // 预检缓存时间（对应 Access-Control-Max-Age）
}));

// 方式 2：手动实现（更接近 Java 版本）
app.use((req, res, next) => {
  const origin = req.headers.origin; // 获取请求来源
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin); // 设置允许来源
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // 允许方法
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 允许请求头
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // 允许凭证
  if (req.method === 'OPTIONS') return res.sendStatus(200); // 预检请求直接返回 200
  next(); // 继续处理（类似 Java 的 chain.doFilter）
});
```

> **新概念解释**：
> - **预检请求（Preflight）**：浏览器在发送"复杂请求"（如带 JSON 的 POST）之前，会先发一个 OPTIONS 请求询问服务器是否允许。服务器回答"允许"后，浏览器才发真正的请求
> - `@Order(Ordered.HIGHEST_PRECEDENCE)`：设置 Filter 的执行优先级。CORS Filter 必须最先执行，否则其他 Filter（如 JwtFilter）可能在 CORS 头设置之前就拒绝了请求

---

## 3.9 Maven pom.xml 项目配置

### 什么是 Maven？

Maven 是 Java 项目的构建工具和包管理器，类似前端的 npm/yarn/pnpm。`pom.xml` 是 Maven 的配置文件，类似前端的 `package.json`。

来自 `java-backend/pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Maven 项目配置文件，类似前端的 package.json -->
<project xmlns="http://maven.apache.org/POM/4.0.0">

    <modelVersion>4.0.0</modelVersion> <!-- Maven 模型版本，固定为 4.0.0 -->

    <!-- 继承 Spring Boot 父项目（自动获得默认配置和依赖版本管理） -->
    <parent>
        <groupId>org.springframework.boot</groupId>       <!-- 父项目组织 ID -->
        <artifactId>spring-boot-starter-parent</artifactId> <!-- 父项目名称 -->
        <version>3.2.0</version>                            <!-- Spring Boot 版本 -->
        <relativePath/>                                     <!-- 从 Maven 仓库获取 -->
    </parent>

    <!-- 项目基本信息 -->
    <groupId>com.example</groupId>           <!-- 组织标识（类似 npm 的 @scope） -->
    <artifactId>fetch-demo</artifactId>       <!-- 项目名称（类似 package.json 的 name） -->
    <version>0.0.1-SNAPSHOT</version>         <!-- 版本号（类似 package.json 的 version） -->
    <name>fetch-demo</name>                   <!-- 项目显示名 -->
    <description>学习 MCP 和 Spring Boot 的演示项目</description> <!-- 项目描述 -->

    <!-- Java 版本配置 -->
    <properties>
        <java.version>17</java.version> <!-- 使用 Java 17（类似 tsconfig 的 target） -->
    </properties>

    <!-- 项目依赖（类似 package.json 的 dependencies） -->
    <dependencies>
        <!-- Spring Boot Web：包含 Spring MVC + 内嵌 Tomcat + Jackson JSON -->
        <dependency>
            <groupId>org.springframework.boot</groupId>     <!-- 组织 ID -->
            <artifactId>spring-boot-starter-web</artifactId> <!-- 依赖名称 -->
        </dependency>
        <!-- 不需要写 version，因为 parent 已经管理了版本 -->

        <!-- Spring Data JPA：数据库操作框架（类似 Prisma） -->
        <dependency>
            <groupId>org.springframework.boot</groupId>          <!-- 组织 ID -->
            <artifactId>spring-boot-starter-data-jpa</artifactId> <!-- JPA 依赖 -->
        </dependency>

        <!-- SQLite 驱动（本地开发用的轻量级文件数据库） -->
        <dependency>
            <groupId>org.xerial</groupId>          <!-- 组织 ID -->
            <artifactId>sqlite-jdbc</artifactId>    <!-- SQLite JDBC 驱动 -->
            <version>3.45.1.0</version>             <!-- 需要手动指定版本（parent 不管理） -->
        </dependency>

        <!-- Hibernate SQLite 方言（让 Hibernate 支持 SQLite 语法） -->
        <dependency>
            <groupId>org.hibernate.orm</groupId>              <!-- 组织 ID -->
            <artifactId>hibernate-community-dialects</artifactId> <!-- 社区方言包 -->
        </dependency>

        <!-- MySQL 驱动（生产环境 TiDB Cloud 用） -->
        <dependency>
            <groupId>com.mysql</groupId>            <!-- 组织 ID -->
            <artifactId>mysql-connector-j</artifactId> <!-- MySQL JDBC 驱动 -->
            <scope>runtime</scope>                  <!-- 只在运行时需要，编译时不需要 -->
        </dependency>

        <!-- JWT 库：jjwt 三件套（API + 实现 + JSON 序列化） -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>  <!-- JWT 库组织 ID -->
            <artifactId>jjwt-api</artifactId>    <!-- JWT API 接口 -->
            <version>0.12.6</version>            <!-- 版本号 -->
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>  <!-- JWT 库组织 ID -->
            <artifactId>jjwt-impl</artifactId>   <!-- JWT 实现（运行时） -->
            <version>0.12.6</version>            <!-- 版本号 -->
            <scope>runtime</scope>               <!-- 只在运行时需要 -->
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>  <!-- JWT 库组织 ID -->
            <artifactId>jjwt-jackson</artifactId> <!-- JWT Jackson 序列化支持 -->
            <version>0.12.6</version>            <!-- 版本号 -->
            <scope>runtime</scope>               <!-- 只在运行时需要 -->
        </dependency>

        <!-- BCrypt 密码加密（只引入 crypto 模块，不引入完整 Spring Security） -->
        <dependency>
            <groupId>org.springframework.security</groupId>  <!-- Spring Security 组织 ID -->
            <artifactId>spring-security-crypto</artifactId>   <!-- 仅加密模块 -->
        </dependency>

        <!-- 测试依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>          <!-- 组织 ID -->
            <artifactId>spring-boot-starter-test</artifactId>     <!-- 测试框架 -->
            <scope>test</scope>                                   <!-- 只在测试时需要 -->
        </dependency>
    </dependencies>

    <!-- 构建配置 -->
    <build>
        <plugins>
            <!-- Spring Boot Maven 插件：打包为可执行 JAR -->
            <plugin>
                <groupId>org.springframework.boot</groupId>       <!-- 组织 ID -->
                <artifactId>spring-boot-maven-plugin</artifactId>  <!-- 打包插件 -->
            </plugin>
        </plugins>
    </build>
</project>
```

TypeScript 等价代码对比（package.json）：

```json
// 来自 fetch-mcp-demo/package.json（前端项目配置）
// pom.xml 和 package.json 的对应关系
{
  "name": "fetch-mcp-demo",        // 对应 <artifactId>
  "version": "0.0.0",              // 对应 <version>
  "description": "前端演示项目",    // 对应 <description>
  "dependencies": {                // 对应 <dependencies>（运行时依赖）
    "react": "^19.0.0",           // 类似 spring-boot-starter-web
    "react-dom": "^19.0.0",       // 类似 spring-boot-starter-web（内嵌服务器）
    "react-router-dom": "^7.1.1", // 类似 spring-boot-starter-web（路由）
    "@arco-design/web-react": "^2.68.0" // UI 组件库（后端没有等价物）
  },
  "devDependencies": {             // 对应 <scope>test</scope> 的依赖
    "vite": "^6.0.5",             // 构建工具（类似 spring-boot-maven-plugin）
    "typescript": "~5.6.2",       // 类似 <java.version>17</java.version>
    "@vitejs/plugin-react": "^4.3.4" // Vite 插件
  }
}
```

### Maven vs npm 概念对照

| Maven 概念 | npm 等价 | 说明 |
|-----------|---------|------|
| `pom.xml` | `package.json` | 项目配置文件 |
| `<parent>` | 无直接等价 | 继承父项目配置（npm 没有这个概念） |
| `<groupId>` | `@scope`（如 `@types/react`） | 组织标识 |
| `<artifactId>` | `name` | 项目/包名称 |
| `<version>` | `version` | 版本号 |
| `<dependencies>` | `dependencies` | 运行时依赖 |
| `<scope>test</scope>` | `devDependencies` | 开发/测试依赖 |
| `<scope>runtime</scope>` | 无直接等价 | 只在运行时需要 |
| `mvn install` | `npm install` | 安装依赖 |
| `mvn package` | `npm run build` | 构建打包 |
| `mvn spring-boot:run` | `npm run dev` | 启动开发服务器 |
| `~/.m2/repository` | `node_modules` | 依赖存储位置 |

> **新概念解释**：
> - `<parent>`（父项目继承）：Spring Boot 提供了一个"父 POM"，继承它就自动获得所有 Spring Boot 依赖的版本管理。这就是为什么很多依赖不需要写 `<version>`——父项目已经定义好了兼容的版本
> - `<scope>`（依赖范围）：`compile`（默认，编译+运行都需要）、`runtime`（只在运行时需要）、`test`（只在测试时需要）。类似 npm 的 `dependencies` vs `devDependencies`
> - **Maven 仓库**：类似 npm registry，Maven 从中央仓库（Maven Central）下载依赖包

---

## 3.10 application.properties 配置详解

### 什么是 application.properties？

`application.properties` 是 Spring Boot 的配置文件，类似前端的 `.env` 文件。Spring Boot 启动时会自动读取这个文件中的配置。

### 开发环境配置

来自 `java-backend/src/main/resources/application.properties`：

```properties
# ============================================
# 服务器配置
# ============================================
server.port=8080                    # 服务器端口（类似 Vite 的 --port 5173）
spring.application.name=fetch-demo  # 应用名称

# ============================================
# SQLite 数据库配置（本地开发用）
# ============================================
# 数据库连接 URL（类似 Prisma 的 DATABASE_URL）
spring.datasource.url=jdbc:sqlite:./data/app.db  # SQLite 文件路径
# JDBC 驱动类名（告诉 Spring 用哪个驱动连接数据库）
spring.datasource.driver-class-name=org.sqlite.JDBC  # SQLite 驱动

# ============================================
# JPA/Hibernate 配置
# ============================================
# 数据库方言（告诉 Hibernate 生成什么语法的 SQL）
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect  # SQLite 方言
# DDL 自动更新策略（update = 自动创建/更新表结构）
spring.jpa.hibernate.ddl-auto=update  # 开发用 update，生产用 validate
# 在控制台显示 SQL 语句（学习时开启，生产关闭）
spring.jpa.show-sql=true  # 开启 SQL 日志
# 格式化 SQL 输出（让 SQL 更易读）
spring.jpa.properties.hibernate.format_sql=true  # 格式化 SQL

# ============================================
# 日志配置
# ============================================
# 日志级别：TRACE < DEBUG < INFO < WARN < ERROR
logging.level.root=INFO              # 全局日志级别
logging.level.com.example=DEBUG      # 项目代码用 DEBUG 级别（更详细）
logging.level.org.hibernate.SQL=DEBUG # 显示 Hibernate SQL
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE  # 显示 SQL 参数值
spring.output.ansi.enabled=ALWAYS    # 控制台彩色日志

# ============================================
# JWT 配置
# ============================================
# ${JWT_SECRET:默认值} 语法：优先读环境变量，没有则用默认值
jwt.secret=${JWT_SECRET:dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBkZXZlbG9wbWVudA==}  # JWT 密钥
```

### 生产环境配置（Spring Profiles）

Spring Boot 支持多环境配置：`application.properties`（默认）和 `application-prod.properties`（生产环境）。通过设置 `SPRING_PROFILES_ACTIVE=prod` 环境变量来切换。

来自 `java-backend/src/main/resources/application-prod.properties`：

```properties
# 生产环境配置（Render 部署 + TiDB Cloud）
server.port=8080  # 服务器端口

# TiDB Cloud (MySQL 兼容) 数据库配置
# ${DB_HOST:默认值} 语法：从环境变量读取，没有则用默认值
spring.datasource.url=jdbc:mysql://${DB_HOST:gateway01.us-east-1.prod.aws.tidbcloud.com}:${DB_PORT:4000}/${DB_NAME:test}?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3  # MySQL 连接 URL（含 SSL 配置）
spring.datasource.username=${DB_USERNAME}  # 数据库用户名（从环境变量读取）
spring.datasource.password=${DB_PASSWORD}  # 数据库密码（从环境变量读取）
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver  # MySQL 驱动

spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect  # MySQL 方言
spring.jpa.hibernate.ddl-auto=update  # 自动更新表结构
spring.jpa.show-sql=false  # 生产环境关闭 SQL 日志（提升性能）

logging.level.root=WARN          # 生产环境只记录警告和错误
logging.level.com.example=INFO   # 项目代码记录 INFO 级别
```

TypeScript 等价代码对比（前端环境变量）：

```typescript
// 前端环境变量配置
// .env.local（本地开发）
// VITE_API_BASE_URL=http://localhost:8080  ← 对应 spring.datasource.url

// .env.production（生产环境）
// VITE_API_BASE_URL=https://your-api.onrender.com  ← 对应 application-prod.properties

// 前端读取环境变量：
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'; // 读取环境变量
// 对应 Java 的 @Value("${jwt.secret}") 或 ${DB_HOST:默认值} 语法

// 前端环境切换：Vite 根据 npm run dev / npm run build 自动选择 .env 文件
// 后端环境切换：通过 SPRING_PROFILES_ACTIVE=prod 环境变量选择配置文件
```

### 配置对照表

| Java 配置 | 前端等价 | 说明 |
|-----------|---------|------|
| `application.properties` | `.env.local` | 本地开发配置 |
| `application-prod.properties` | `.env.production` | 生产环境配置 |
| `SPRING_PROFILES_ACTIVE=prod` | `npm run build`（自动切换） | 环境切换方式 |
| `@Value("${key}")` | `import.meta.env.VITE_KEY` | 读取配置值 |
| `${KEY:default}` | `import.meta.env.VITE_KEY \|\| 'default'` | 带默认值的配置 |
| `server.port=8080` | `vite --port 5173` | 服务器端口 |
| `spring.datasource.url` | `VITE_API_BASE_URL` | 数据源/API 地址 |
| `spring.jpa.show-sql=true` | 浏览器 DevTools Network | 调试工具 |

> **新概念解释**：
> - **Spring Profiles**：Spring Boot 的多环境配置机制。`application.properties` 是默认配置，`application-{profile}.properties` 是特定环境配置。激活方式：设置环境变量 `SPRING_PROFILES_ACTIVE=prod`，生产配置会**覆盖**默认配置中的同名项
> - **`${ENV_VAR:default}`**：Spring 的属性占位符语法，优先读取环境变量 `ENV_VAR`，如果不存在则使用冒号后的默认值。类似 JavaScript 的 `process.env.ENV_VAR || 'default'`
> - **`ddl-auto`**：控制 Hibernate 如何处理数据库表结构。`update` 会自动创建新表和新列（不删除旧列），适合开发；`validate` 只验证不修改，适合生产

---

## 小结

本章从前端开发者的视角，详细讲解了 Spring Boot 后端开发的 10 个核心知识点：

1. **三层架构**：Controller → Service → Repository，与前端的组件 → Hook → API 类比
2. **Entity 实体类**：JPA 注解将 Java 类映射到数据库表，类似 Prisma 的 model
3. **Repository 数据访问层**：继承 JpaRepository 自动获得 CRUD，方法命名自动生成 SQL
4. **Service 业务逻辑层**：`@Service` + `@Autowired` 依赖注入 + `@Transactional` 事务管理
5. **Controller 控制器层**：`@RestController` 处理 HTTP 请求，各种 Mapping 注解映射路由
6. **JWT 认证**：JwtUtil 生成/验证 Token，JwtFilter 拦截请求，AuthService 处理登录注册
7. **ApiResponse 统一响应**：泛型封装 + 静态工厂方法，前端用 unwrap 解包
8. **CORS 跨域配置**：Filter 实现，设置响应头允许跨域访问
9. **Maven pom.xml**：项目配置和依赖管理，类似 package.json
10. **application.properties**：应用配置和多环境切换（Spring Profiles）

每个概念都有 TypeScript/React 的类比，帮助你建立前后端知识的桥梁。更多 Java 基础知识请参考 [Java 入门笔记](/notes/java-zero-to-one)，完整项目架构请参考 [fetch-mcp-demo 项目详解](/projects/fetch-mcp-demo)。

→ 下一章：[部署流程](./deployment.md)，学习如何将前后端项目部署到 Vercel、Render 和 TiDB Cloud。