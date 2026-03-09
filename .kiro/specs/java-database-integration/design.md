# Design Document: Java 数据库集成与 MCP 学习

## Overview

本设计实现一个完整的全栈数据流学习项目：

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  fetch-mcp-demo │────▶│   java-backend  │────▶│  SQLite 数据库   │
│    (前端 React)  │     │  (Spring Boot)  │     │   (app.db)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│   Fetch MCP     │                           │   SQLite MCP    │
│ (获取网页数据)   │                           │ (AI 查询数据库)  │
└─────────────────┘                           └─────────────────┘
```

**学习目标：**
1. 理解 Spring Boot + JPA 数据库操作
2. 理解前后端数据交互
3. 掌握 MCP 配置和使用

## Architecture

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React + TypeScript | 已有 fetch-mcp-demo |
| 后端 | Spring Boot 3.2 | 已有 java-backend |
| 数据库 | SQLite | 轻量级文件数据库 |
| ORM | Spring Data JPA | 数据库操作框架 |
| MCP | sqlite-mcp | AI 数据库查询 |

### 项目结构

```
java-backend/
├── pom.xml                          # Maven 依赖配置
├── data/
│   └── app.db                       # SQLite 数据库文件
└── src/main/
    ├── java/com/example/fetchdemo/
    │   ├── FetchDemoApplication.java
    │   ├── controller/
    │   │   ├── FetchController.java  # 已有
    │   │   └── DatabaseController.java # 新增：数据库操作接口
    │   ├── entity/
    │   │   └── User.java             # 新增：用户实体类
    │   ├── repository/
    │   │   └── UserRepository.java   # 新增：数据访问接口
    │   └── service/
    │       └── UserService.java      # 新增：业务逻辑层
    └── resources/
        └── application.properties    # 数据库配置
```

## Components and Interfaces

### 1. User 实体类 (Entity)

```java
/**
 * 用户实体类 - 映射到数据库表
 * 
 * @Entity: 标记这是一个 JPA 实体，会自动创建对应的数据库表
 * @Table: 指定表名
 */
@Entity
@Table(name = "users")
public class User {
    @Id
    private Long id;           // 用户 ID（来自 JSONPlaceholder）
    private String name;       // 姓名
    private String username;   // 用户名
    private String email;      // 邮箱
    private String phone;      // 电话
    private String website;    // 网站
    private String city;       // 城市（从 address 中提取）
    private String company;    // 公司名（从 company 中提取）
    
    // Getters and Setters
}
```

### 2. UserRepository 接口 (Repository)

```java
/**
 * 用户数据访问接口
 * 
 * 继承 JpaRepository 后自动获得：
 * - save(): 保存/更新
 * - findById(): 按 ID 查询
 * - findAll(): 查询所有
 * - delete(): 删除
 */
public interface UserRepository extends JpaRepository<User, Long> {
    // 自定义查询方法（Spring Data JPA 会自动实现）
    List<User> findByCity(String city);
    List<User> findByEmailContaining(String keyword);
}
```

### 3. UserService 服务类 (Service)

```java
/**
 * 用户业务逻辑层
 * 
 * @Service: 标记为服务组件
 */
@Service
public class UserService {
    // 从外部 API 获取并保存用户
    public List<User> fetchAndSaveUsers();
    
    // 获取所有已保存的用户
    public List<User> getAllUsers();
    
    // 按 ID 获取用户
    public Optional<User> getUserById(Long id);
}
```

### 4. DatabaseController 控制器 (Controller)

```java
/**
 * 数据库操作 API 接口
 */
@RestController
@RequestMapping("/api/db")
public class DatabaseController {
    
    // GET /api/db/users - 获取所有用户
    @GetMapping("/users")
    public List<User> getAllUsers();
    
    // GET /api/db/users/{id} - 获取单个用户
    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id);
    
    // POST /api/db/fetch-users - 从外部 API 获取并保存
    @PostMapping("/fetch-users")
    public Map<String, Object> fetchAndSaveUsers();
}
```

### 5. API 接口设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/db/users | 获取数据库中所有用户 |
| GET | /api/db/users/{id} | 获取指定用户 |
| POST | /api/db/fetch-users | 从 JSONPlaceholder 获取并保存用户 |
| GET | /api/db/stats | 获取数据库统计信息 |

## Data Models

### 数据库表结构

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    username VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(50),
    website VARCHAR(100),
    city VARCHAR(100),
    company VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### JSONPlaceholder 数据映射

JSONPlaceholder 返回的用户数据：
```json
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "Sincere@april.biz",
  "address": {
    "city": "Gwenborough"
  },
  "phone": "1-770-736-8031",
  "website": "hildegard.org",
  "company": {
    "name": "Romaguera-Crona"
  }
}
```

映射到 User 实体：
- `id` → `id`
- `name` → `name`
- `username` → `username`
- `email` → `email`
- `phone` → `phone`
- `website` → `website`
- `address.city` → `city`
- `company.name` → `company`

## MCP Configuration

### SQLite MCP 配置

在 `java-backend/.kiro/settings/mcp.json` 中配置：

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "./data/app.db"],
      "disabled": false,
      "autoApprove": ["read_query"]
    }
  }
}
```

### MCP 使用示例

配置完成后，可以在 Kiro 聊天中：
- "查询数据库中所有用户"
- "统计每个城市的用户数量"
- "查找邮箱包含 gmail 的用户"



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


Based on the prework analysis, the following testable properties have been identified:

### Property 1: Fetch and Store Round Trip

*For any* successful call to the fetch-and-save endpoint, the returned users should be retrievable from the database with matching data.

**Validates: Requirements 2.3, 4.2**

### Property 2: Save Idempotence

*For any* user data, saving the same user multiple times should result in exactly one record in the database with the latest data.

**Validates: Requirements 2.4**

### Property 3: Data Retrieval Consistency

*For any* set of users stored in the database, the GET /api/db/users endpoint should return all stored users, and GET /api/db/users/{id} should return the exact user with that ID.

**Validates: Requirements 3.1, 3.2**

## Error Handling

| 场景 | 处理方式 | HTTP 状态码 |
|------|---------|------------|
| 数据库连接失败 | 记录错误日志，返回服务不可用 | 503 |
| 外部 API 调用失败 | 返回错误信息，不影响已存储数据 | 502 |
| 用户不存在 | 返回 404 和错误消息 | 404 |
| 数据验证失败 | 返回具体验证错误 | 400 |

## Testing Strategy

### 单元测试

- 测试 User 实体的字段映射
- 测试 UserRepository 的基本 CRUD 操作
- 测试 UserService 的业务逻辑

### 集成测试

- 测试完整的 API 调用流程
- 测试数据库持久化
- 测试错误处理

### 属性测试

使用 JUnit 5 + jqwik 进行属性测试：
- 测试 fetch-and-store 的往返一致性
- 测试保存操作的幂等性
- 测试数据检索的一致性

## DBeaver 连接指南

### 连接步骤

1. 打开 DBeaver
2. 新建连接 → 选择 SQLite
3. 数据库文件路径：`{项目路径}/java-backend/data/app.db`
4. 点击测试连接 → 完成

### 注意事项

- SQLite 支持多读单写，Java 应用运行时 DBeaver 可以读取数据
- 如需在 DBeaver 中修改数据，建议先停止 Java 应用

## 依赖配置

### Maven 依赖 (pom.xml)

```xml
<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- SQLite JDBC 驱动 -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.45.1.0</version>
</dependency>

<!-- SQLite Hibernate 方言 -->
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-community-dialects</artifactId>
</dependency>
```

### 应用配置 (application.properties)

```properties
# SQLite 数据库配置
spring.datasource.url=jdbc:sqlite:./data/app.db
spring.datasource.driver-class-name=org.sqlite.JDBC

# JPA/Hibernate 配置
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```
