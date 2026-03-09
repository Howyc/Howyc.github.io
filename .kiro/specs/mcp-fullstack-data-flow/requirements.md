# Requirements Document

## Introduction

本项目是一个前后端 + MCP 数据交互全流程学习项目，帮助前端开发者从零开始理解：

1. **前端调用 MCP 接口** - 在 fetch-mcp-demo 中通过 MCP 获取外部数据
2. **前端调用后端 API** - 将获取到的数据传递给 Java 后端
3. **后端数据入库** - Java 后端接收数据并存储到 SQLite 数据库
4. **数据库可视化** - 使用 DBeaver 管理和查看数据库

整体数据流：
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  fetch-mcp-demo │────▶│   java-backend  │────▶│  SQLite 数据库   │
│    (前端 React)  │     │  (Spring Boot)  │     │   (app.db)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│   Fetch MCP     │                           │    DBeaver      │
│ (获取网页数据)   │                           │  (数据库管理)    │
└─────────────────┘                           └─────────────────┘
```

## Glossary

- **MCP**: Model Context Protocol，AI 助手与外部工具通信的协议
- **Fetch_MCP**: 用于获取网页内容的 MCP 服务器
- **Frontend**: fetch-mcp-demo 前端 React 应用
- **Backend**: java-backend Spring Boot 后端应用
- **SQLite_Database**: 轻量级文件数据库，存储在 java-backend/data/app.db
- **DBeaver**: 数据库可视化管理工具
- **JSONPlaceholder**: 免费的测试 API，提供模拟用户数据
- **API_Endpoint**: 后端提供的 HTTP 接口

## Requirements

### Requirement 1: 前端获取外部数据

**User Story:** As a 前端开发者, I want to 在前端获取外部 API 数据, so that 我可以学习如何从外部源获取数据

#### Acceptance Criteria

1. WHEN 用户点击"获取用户数据"按钮时, THE Frontend SHALL 从 JSONPlaceholder API 获取用户列表
2. THE Frontend SHALL 在界面上展示获取到的用户数据
3. WHEN 数据获取失败时, THE Frontend SHALL 显示友好的错误提示
4. THE Frontend SHALL 显示数据获取的加载状态

### Requirement 2: 前端调用后端 API 存储数据

**User Story:** As a 前端开发者, I want to 将获取到的数据发送给后端存储, so that 我可以学习前后端数据交互

#### Acceptance Criteria

1. WHEN 用户点击"保存到数据库"按钮时, THE Frontend SHALL 将用户数据发送到 Backend 的 API 接口
2. THE Frontend SHALL 使用 POST 请求发送 JSON 格式的用户数据
3. WHEN 后端返回成功响应时, THE Frontend SHALL 显示保存成功的提示
4. WHEN 后端返回失败响应时, THE Frontend SHALL 显示具体的错误信息
5. THE Frontend SHALL 显示已保存的用户数量统计

### Requirement 3: 后端接收并存储数据

**User Story:** As a 学习者, I want to 后端能接收前端数据并存储, so that 我可以理解后端数据处理流程

#### Acceptance Criteria

1. WHEN Backend 收到 POST /api/users/batch 请求时, THE Backend SHALL 解析 JSON 数据并存储到数据库
2. THE Backend SHALL 返回存储结果，包含成功数量和失败数量
3. WHEN 存储相同 ID 的用户时, THE Backend SHALL 更新已存在的记录而非创建重复记录
4. IF 数据格式不正确, THEN THE Backend SHALL 返回 400 状态码和错误详情

### Requirement 4: 前端查询已存储数据

**User Story:** As a 前端开发者, I want to 查询数据库中已存储的数据, so that 我可以验证数据存储成功

#### Acceptance Criteria

1. WHEN 用户点击"查看数据库用户"按钮时, THE Frontend SHALL 调用 Backend API 获取已存储的用户列表
2. THE Frontend SHALL 在界面上展示数据库中的用户数据
3. THE Frontend SHALL 显示数据库用户总数
4. THE Frontend SHALL 区分显示"外部获取的数据"和"数据库中的数据"

### Requirement 5: 完整数据流演示

**User Story:** As a 学习者, I want to 一键完成获取-存储-查询的完整流程, so that 我可以理解全栈数据流

#### Acceptance Criteria

1. WHEN 用户点击"一键同步"按钮时, THE Frontend SHALL 依次执行：获取外部数据 → 发送到后端 → 查询数据库
2. THE Frontend SHALL 显示每个步骤的执行状态和结果
3. THE Frontend SHALL 在流程完成后显示完整的数据对比

### Requirement 6: DBeaver 数据库连接

**User Story:** As a 学习者, I want to 使用 DBeaver 查看数据库, so that 我可以可视化验证数据存储

#### Acceptance Criteria

1. THE SQLite_Database SHALL 存储为独立文件 java-backend/data/app.db
2. THE Documentation SHALL 提供 DBeaver 连接 SQLite 的详细步骤
3. WHEN 应用运行时, THE SQLite_Database SHALL 可通过 DBeaver 连接查看

