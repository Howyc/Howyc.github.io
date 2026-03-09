# Requirements Document

## Introduction

本项目是一个完整的 MCP 学习项目，包含三个学习模块：

1. **前端 MCP 学习** - 通过 fetch-mcp-demo 学习如何在前端使用 MCP 获取网页数据
2. **Java 后端学习** - 通过 java-backend 学习 Spring Boot 开发和数据库操作
3. **数据库 MCP 学习** - 学习如何配置数据库 MCP，实现 AI 助手直接操作数据库

整体架构：
```
前端 (fetch-mcp-demo) ←→ Fetch MCP (获取网页数据)
        ↓ 调用 API
Java 后端 (java-backend) ←→ 数据库 (H2)
        ↑
数据库 MCP (sqlite-mcp) ←→ AI 助手直接查询/操作数据库
```

## Glossary

- **MCP**: Model Context Protocol，AI 助手与外部工具通信的协议
- **Fetch_MCP**: 用于获取网页内容的 MCP 服务器（已配置在 fetch-mcp-demo）
- **Database_MCP**: 用于操作数据库的 MCP 服务器（如 sqlite-mcp）
- **Java_Backend**: Spring Boot 后端应用程序
- **SQLite_Database**: 轻量级文件数据库，Java 和 MCP 可共用
- **DBeaver**: 数据库可视化管理工具
- **JPA**: Java Persistence API，Java 数据库操作标准
- **Entity**: Java 数据模型类，映射到数据库表
- **Repository**: Spring Data JPA 数据访问接口

## Requirements

### Requirement 1: Java 后端数据库集成

**User Story:** As a 学习者, I want to 在 Java 后端添加数据库功能, so that 我可以学习 Java 数据库操作

#### Acceptance Criteria

1. WHEN Java_Backend 启动时, THE Java_Backend SHALL 自动连接到 SQLite 数据库文件
2. THE Java_Backend SHALL 自动创建数据库表结构
3. THE SQLite_Database SHALL 存储在项目根目录的 data/app.db 文件中
4. WHEN 数据库连接失败时, THE Java_Backend SHALL 输出清晰的错误信息

### Requirement 2: 用户数据实体和存储

**User Story:** As a 学习者, I want to 定义用户数据模型并存储数据, so that 我可以学习 JPA 实体映射

#### Acceptance Criteria

1. THE Java_Backend SHALL 定义 User 实体类，包含 id、name、username、email、phone、website 字段
2. THE Java_Backend SHALL 定义 UserRepository 接口用于数据库操作
3. WHEN 调用 /api/fetch-and-save/users 接口时, THE Java_Backend SHALL 从 JSONPlaceholder 获取用户并存储到数据库
4. WHEN 存储重复用户数据时, THE Java_Backend SHALL 更新已存在的记录

### Requirement 3: 数据库查询接口

**User Story:** As a 学习者, I want to 查询数据库中的数据, so that 我可以验证数据存储成功

#### Acceptance Criteria

1. WHEN 调用 /api/db/users 接口时, THE Java_Backend SHALL 返回数据库中所有用户
2. WHEN 调用 /api/db/users/{id} 接口时, THE Java_Backend SHALL 返回指定用户
3. IF 查询的用户不存在, THEN THE Java_Backend SHALL 返回 404 状态码

### Requirement 4: 前后端联动

**User Story:** As a 学习者, I want to 前端调用后端 API 并存储数据, so that 我可以理解全栈数据流

#### Acceptance Criteria

1. THE Frontend SHALL 能够调用 Java_Backend 的 API 接口
2. WHEN 前端调用获取用户接口时, THE Java_Backend SHALL 返回数据并自动存储
3. THE Java_Backend SHALL 在响应中包含存储状态信息

### Requirement 5: DBeaver 数据库连接

**User Story:** As a 学习者, I want to 使用 DBeaver 查看数据库, so that 我可以可视化管理数据

#### Acceptance Criteria

1. THE SQLite_Database SHALL 存储为独立文件，可直接用 DBeaver 打开
2. THE Documentation SHALL 提供 DBeaver 连接 SQLite 的步骤说明
3. WHEN 应用运行时, THE SQLite_Database SHALL 可通过 DBeaver 连接查看

### Requirement 6: SQLite MCP 配置

**User Story:** As a 学习者, I want to 配置 sqlite-mcp, so that AI 助手可以直接查询数据库

#### Acceptance Criteria

1. THE Project SHALL 配置 sqlite-mcp 指向 Java 后端使用的同一个数据库文件
2. WHEN sqlite-mcp 配置完成后, THE AI_Assistant SHALL 能够执行 SQL 查询
3. THE AI_Assistant SHALL 能够查询、统计数据库中的数据
4. THE Documentation SHALL 说明如何在 Kiro 聊天中使用数据库 MCP
