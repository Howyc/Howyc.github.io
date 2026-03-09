# Design Document: 前后端 + MCP 数据交互全流程

## Overview

本设计实现一个完整的前后端数据交互学习项目，让前端开发者理解：

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据流向图                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    HTTP GET     ┌──────────────────┐         │
│  │   Frontend   │ ───────────────▶│  JSONPlaceholder │         │
│  │  (React App) │◀─────────────── │      API         │         │
│  └──────────────┘    JSON Data    └──────────────────┘         │
│         │                                                       │
│         │ HTTP POST /api/users/batch                           │
│         ▼                                                       │
│  ┌──────────────┐                 ┌──────────────────┐         │
│  │   Backend    │ ───────────────▶│  SQLite Database │         │
│  │ (Spring Boot)│◀─────────────── │    (app.db)      │         │
│  └──────────────┘    JPA/JDBC     └──────────────────┘         │
│         │                                  │                    │
│         │ HTTP GET /api/db/users           │                    │
│         ▼                                  ▼                    │
│  ┌──────────────┐                 ┌──────────────────┐         │
│  │   Frontend   │                 │     DBeaver      │         │
│  │  显示数据库数据│                 │   可视化查看      │         │
│  └──────────────┘                 └──────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**学习目标：**
1. 理解前端如何获取外部 API 数据
2. 理解前端如何调用后端 API 传递数据
3. 理解后端如何接收、处理、存储数据
4. 理解如何使用 DBeaver 可视化管理数据库

## Architecture

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 19 + TypeScript | Vite 构建的现代前端应用 |
| 后端 | Spring Boot 3.2 + Java 17 | RESTful API 服务 |
| 数据库 | SQLite | 轻量级文件数据库 |
| ORM | Spring Data JPA | 数据库操作框架 |
| 数据库工具 | DBeaver | 可视化数据库管理 |

### 前端组件结构

```
fetch-mcp-demo/src/
├── App.tsx                    # 主应用组件（需要扩展）
├── components/
│   ├── UserDataPanel.tsx      # 新增：用户数据面板
│   ├── DatabasePanel.tsx      # 新增：数据库数据面板
│   └── SyncButton.tsx         # 新增：一键同步按钮
├── services/
│   ├── api.ts                 # 新增：API 调用服务
│   └── types.ts               # 新增：TypeScript 类型定义
└── hooks/
    └── useDataSync.ts         # 新增：数据同步 Hook
```

### 后端 API 结构

```
java-backend/src/main/java/com/example/fetchdemo/
├── controller/
│   ├── FetchController.java   # 已有
│   └── DatabaseController.java # 已有，需要扩展
├── entity/
│   └── User.java              # 已有
├── repository/
│   └── UserRepository.java    # 已有
└── service/
    └── UserService.java       # 已有，需要扩展
```

## Components and Interfaces

### 1. 前端 API 服务 (api.ts)

```typescript
// 后端 API 基础地址
const API_BASE = 'http://localhost:8080/api';

// 外部数据源地址
const JSONPLACEHOLDER_URL = 'https://jsonplaceholder.typicode.com/users';

/**
 * 从 JSONPlaceholder 获取用户数据
 */
export async function fetchExternalUsers(): Promise<User[]> {
  const response = await fetch(JSONPLACEHOLDER_URL);
  if (!response.ok) throw new Error('获取外部数据失败');
  return response.json();
}

/**
 * 批量保存用户到后端数据库
 */
export async function saveUsersToBackend(users: User[]): Promise<SaveResult> {
  const response = await fetch(`${API_BASE}/users/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(users)
  });
  if (!response.ok) throw new Error('保存数据失败');
  return response.json();
}

/**
 * 从后端获取数据库中的用户
 */
export async function fetchDatabaseUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE}/db/users`);
  if (!response.ok) throw new Error('获取数据库数据失败');
  return response.json();
}
```

### 2. 前端类型定义 (types.ts)

```typescript
/**
 * 用户数据类型
 */
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  city?: string;
  company?: string;
}

/**
 * 保存结果类型
 */
export interface SaveResult {
  success: boolean;
  savedCount: number;
  updatedCount: number;
  failedCount: number;
  message: string;
}

/**
 * 同步状态类型
 */
export interface SyncStatus {
  step: 'idle' | 'fetching' | 'saving' | 'querying' | 'done' | 'error';
  message: string;
}
```

### 3. 后端批量保存接口 (DatabaseController.java 扩展)

```java
/**
 * 批量保存用户数据
 * 
 * POST /api/users/batch
 * 
 * 请求体：用户数组 JSON
 * 响应：保存结果统计
 */
@PostMapping("/users/batch")
public ResponseEntity<Map<String, Object>> batchSaveUsers(
    @RequestBody List<Map<String, Object>> users
) {
    // 解析并保存用户数据
    // 返回保存结果统计
}
```

### 4. API 接口设计

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/db/users | 获取数据库所有用户 | - | User[] |
| GET | /api/db/users/{id} | 获取单个用户 | - | User |
| POST | /api/users/batch | 批量保存用户 | User[] | SaveResult |
| GET | /api/db/stats | 获取统计信息 | - | Stats |

## Data Models

### 前端数据模型

```typescript
// 从 JSONPlaceholder 获取的原始数据
interface RawUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

// 转换后发送给后端的数据
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  city: string;      // 从 address.city 提取
  company: string;   // 从 company.name 提取
}
```

### 后端数据模型

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    private Long id;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String website;
    private String city;
    private String company;
}
```

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
    company VARCHAR(100)
);
```

## UI Design

### 前端界面布局

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 MCP 全栈数据流演示                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📡 数据操作                                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │获取外部数据│ │保存到数据库│ │查看数据库 │ │ 一键同步  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │ 📥 外部获取的数据      │  │ 💾 数据库中的数据      │           │
│  │                      │  │                      │           │
│  │ 用户列表...           │  │ 用户列表...           │           │
│  │                      │  │                      │           │
│  │ 共 10 条数据          │  │ 共 10 条数据          │           │
│  └──────────────────────┘  └──────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📊 同步状态                                              │   │
│  │  ✅ 获取外部数据 → ✅ 保存到数据库 → ✅ 查询验证           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following testable properties have been identified:

### Property 1: 数据获取一致性

*For any* valid API endpoint (JSONPlaceholder 或 Backend), when the frontend calls the fetch function, the returned data should match the expected schema and contain all required fields.

**Validates: Requirements 1.1, 4.1**

### Property 2: 数据渲染一致性

*For any* user data array, when rendered by the frontend component, all user records should be displayed with their correct id, name, username, and email fields visible.

**Validates: Requirements 1.2, 4.2**

### Property 3: 存储往返一致性 (Round Trip)

*For any* valid user data sent to the backend via POST /api/users/batch, querying the database via GET /api/db/users should return the same user data with matching field values.

**Validates: Requirements 3.1**

### Property 4: 存储幂等性 (Idempotence)

*For any* user data, saving the same user (same ID) multiple times should result in exactly one record in the database, with the latest data values.

**Validates: Requirements 3.3**

### Property 5: 存储结果统计准确性

*For any* batch save operation, the returned savedCount + updatedCount + failedCount should equal the total number of users submitted, and the savedCount should match the number of new records created.

**Validates: Requirements 3.2, 2.5, 4.3**

### Property 6: 完整流程数据一致性

*For any* sync operation, the data fetched from the external API, saved to the backend, and queried from the database should all represent the same set of users with consistent field values.

**Validates: Requirements 5.1, 5.3**

## Error Handling

| 场景 | 前端处理 | 后端处理 | HTTP 状态码 |
|------|---------|---------|------------|
| 外部 API 不可用 | 显示"无法连接外部服务"错误 | - | - |
| 后端服务不可用 | 显示"无法连接后端服务"错误 | - | - |
| 数据格式错误 | 显示具体字段错误 | 返回验证错误详情 | 400 |
| 数据库连接失败 | 显示"数据库服务异常" | 记录错误日志 | 503 |
| 用户不存在 | 显示"用户不存在" | 返回 404 | 404 |

## Testing Strategy

### 单元测试

**前端单元测试 (Vitest)**:
- 测试 API 服务函数的调用逻辑
- 测试数据转换函数
- 测试组件渲染

**后端单元测试 (JUnit)**:
- 测试 UserService 的业务逻辑
- 测试数据转换方法
- 测试 Repository 操作

### 属性测试

使用 fast-check (前端) 和 jqwik (后端) 进行属性测试：

**前端属性测试配置**:
```typescript
import fc from 'fast-check';

// 用户数据生成器
const userArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  username: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  phone: fc.string(),
  website: fc.webUrl(),
  city: fc.string(),
  company: fc.string()
});
```

**后端属性测试配置**:
```java
@Property(tries = 100)
void batchSaveRoundTrip(@ForAll List<@From("validUser") User> users) {
    // 保存用户
    // 查询用户
    // 验证数据一致性
}
```

### 集成测试

- 测试完整的前后端数据流
- 测试错误处理流程
- 测试并发保存场景

## DBeaver 连接指南

### 连接步骤

1. **打开 DBeaver**
   - 如果未安装，从 https://dbeaver.io/download/ 下载安装

2. **新建连接**
   - 点击左上角 "新建连接" 按钮
   - 选择 "SQLite" 数据库类型

3. **配置连接**
   - 数据库文件路径：`{项目路径}/java-backend/data/app.db`
   - 点击 "测试连接" 验证

4. **查看数据**
   - 展开连接 → Tables → users
   - 双击 users 表查看数据

### 注意事项

- SQLite 支持多读单写
- Java 应用运行时 DBeaver 可以读取数据
- 如需在 DBeaver 中修改数据，建议先停止 Java 应用

## 依赖配置

### 前端依赖 (package.json)

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "fast-check": "^3.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

### 后端依赖 (已配置)

后端项目已配置好 Spring Data JPA 和 SQLite 依赖，无需额外配置。

