# Implementation Plan: Java 数据库集成与 MCP 学习

## Overview

本实现计划将 Java 后端项目升级为支持 SQLite 数据库，并配置 sqlite-mcp 让 AI 助手可以直接查询数据库。

## Tasks

- [x] 1. 配置 Maven 依赖和数据库连接
  - [x] 1.1 更新 pom.xml 添加 JPA 和 SQLite 依赖
    - 添加 spring-boot-starter-data-jpa
    - 添加 sqlite-jdbc 驱动
    - 添加 hibernate-community-dialects
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 配置 application.properties
    - 配置 SQLite 数据库连接 URL
    - 配置 Hibernate 方言和 DDL 自动更新
    - _Requirements: 1.1, 1.3_
  - [x] 1.3 创建 data 目录
    - 确保数据库文件存储目录存在
    - _Requirements: 1.3_

- [x] 2. 创建数据模型层
  - [x] 2.1 创建 User 实体类
    - 定义 @Entity 和 @Table 注解
    - 添加 id、name、username、email、phone、website、city、company 字段
    - 添加 Getter/Setter 方法
    - 添加详细的中文注释帮助学习
    - _Requirements: 2.1_
  - [x] 2.2 创建 UserRepository 接口
    - 继承 JpaRepository<User, Long>
    - 添加自定义查询方法 findByCity、findByEmailContaining
    - 添加详细注释说明 Spring Data JPA 的魔法
    - _Requirements: 2.2_

- [x] 3. 创建业务逻辑层
  - [x] 3.1 创建 UserService 服务类
    - 实现 fetchAndSaveUsers() 从外部 API 获取并保存
    - 实现 getAllUsers() 获取所有用户
    - 实现 getUserById() 按 ID 获取用户
    - 处理 JSON 数据到 User 实体的映射
    - 添加详细注释说明 @Service 和依赖注入
    - _Requirements: 2.3, 2.4, 3.1, 3.2_

- [x] 4. 创建数据库 API 控制器
  - [x] 4.1 创建 DatabaseController 控制器
    - GET /api/db/users - 获取所有用户
    - GET /api/db/users/{id} - 获取单个用户
    - POST /api/db/fetch-users - 从外部 API 获取并保存
    - GET /api/db/stats - 获取统计信息
    - 添加详细注释说明 REST API 设计
    - _Requirements: 3.1, 3.2, 3.3, 4.2, 4.3_

- [ ] 5. Checkpoint - 验证 Java 后端功能
  - 启动 Java 应用验证数据库连接
  - 测试 API 接口是否正常工作
  - 确认 data/app.db 文件已创建
  - 确保所有功能正常，如有问题请提出

- [ ] 6. 配置 SQLite MCP
  - [ ] 6.1 创建 MCP 配置文件
    - 在 java-backend/.kiro/settings/mcp.json 配置 sqlite-mcp
    - 指向 data/app.db 数据库文件
    - _Requirements: 6.1_
  - [ ] 6.2 创建使用说明文档
    - 更新 README.md 添加数据库和 MCP 使用说明
    - 添加 DBeaver 连接步骤
    - 添加 MCP 使用示例
    - _Requirements: 5.2, 6.4_

- [ ] 7. Final Checkpoint - 完整功能验证
  - 验证 Java 后端 API 正常工作
  - 验证 DBeaver 可以连接数据库
  - 验证 sqlite-mcp 配置正确
  - 确保所有功能正常，如有问题请提出

## Notes

- 每个代码文件都会添加详细的中文注释，帮助理解 Java 和 Spring Boot 概念
- SQLite 数据库文件存储在 `java-backend/data/app.db`
- 配置 sqlite-mcp 后，可以在 Kiro 聊天中直接查询数据库
- DBeaver 可以直接打开 SQLite 文件查看数据
