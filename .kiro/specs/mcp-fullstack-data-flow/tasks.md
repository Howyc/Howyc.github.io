# Implementation Plan: 前后端 + MCP 数据交互全流程

## Overview

本实现计划将 fetch-mcp-demo 前端项目扩展为完整的全栈数据流演示应用，实现从外部 API 获取数据、传递给 Java 后端、存储到数据库的完整流程。

## Tasks

- [x] 1. 后端扩展：添加批量保存接口
  - [x] 1.1 扩展 DatabaseController 添加批量保存接口
    - 添加 POST /api/users/batch 端点
    - 接收 JSON 数组格式的用户数据
    - 返回保存结果统计（savedCount, updatedCount, failedCount）
    - _Requirements: 3.1, 3.2_
  - [x] 1.2 扩展 UserService 添加批量保存方法
    - 实现 batchSaveUsers() 方法
    - 处理数据转换和存储逻辑
    - 实现更新已存在记录的逻辑
    - _Requirements: 3.1, 3.3_

- [x] 2. 前端基础设施：创建 API 服务和类型定义
  - [x] 2.1 创建 TypeScript 类型定义文件
    - 创建 src/types/index.ts
    - 定义 User, SaveResult, SyncStatus 等类型
    - _Requirements: 2.2_
  - [x] 2.2 创建 API 服务模块
    - 创建 src/services/api.ts
    - 实现 fetchExternalUsers() 获取外部数据
    - 实现 saveUsersToBackend() 保存到后端
    - 实现 fetchDatabaseUsers() 查询数据库
    - _Requirements: 1.1, 2.1, 4.1_

- [x] 3. 前端组件：实现数据展示和操作界面
  - [x] 3.1 创建用户数据展示组件
    - 创建 src/components/UserCard.tsx 用户卡片组件
    - 创建 src/components/UserList.tsx 用户列表组件
    - 支持展示外部数据和数据库数据
    - _Requirements: 1.2, 4.2_
  - [x] 3.2 创建数据操作面板组件
    - 创建 src/components/DataPanel.tsx
    - 包含获取数据、保存数据、查询数据库按钮
    - 显示操作状态和结果
    - _Requirements: 1.4, 2.3, 2.5, 4.3_
  - [x] 3.3 创建一键同步组件
    - 创建 src/components/SyncButton.tsx
    - 实现获取 → 保存 → 查询的完整流程
    - 显示每个步骤的执行状态
    - _Requirements: 5.1, 5.2_

- [x] 4. 前端集成：更新主应用组件
  - [x] 4.1 更新 App.tsx 集成新组件
    - 添加数据流演示区域
    - 集成 DataPanel 和 SyncButton 组件
    - 实现外部数据和数据库数据的对比显示
    - _Requirements: 4.4, 5.3_

- [x] 5. Checkpoint - 验证基本功能
  - [x] 启动 Java 后端服务 (http://localhost:8080)
  - [x] 启动前端开发服务器 (http://localhost:5174)
  - [x] 代码诊断检查通过
  - 测试获取外部数据功能
  - 测试保存到数据库功能
  - 测试查询数据库功能
  - 测试一键同步功能
  - 确保所有功能正常，如有问题请提出

- [x] 6. 错误处理和用户体验优化
  - [x] 6.1 添加错误处理逻辑
    - 处理网络请求失败
    - 处理后端返回错误
    - 显示友好的错误提示
    - _Requirements: 1.3, 2.4, 3.4_
  - [x] 6.2 添加加载状态显示
    - 显示数据获取中的加载动画
    - 禁用操作按钮防止重复提交
    - _Requirements: 1.4_

- [x] 7. 文档和说明
  - [x] 7.1 更新 README 添加使用说明
    - 添加项目启动步骤
    - 添加 DBeaver 连接说明
    - 添加数据流程说明
    - _Requirements: 6.2_

- [x] 8. Final Checkpoint - 完整功能验证
  - [x] 后端服务运行在 http://localhost:8080
  - [x] 前端服务运行在 http://localhost:5174
  - [x] 代码诊断检查通过
  - [x] README 文档已更新

## Notes

- 后端项目已有基础的数据库配置和 User 实体，只需扩展批量保存接口
- 前端使用 React 19 + TypeScript，遵循现有代码风格
- 数据库文件位于 java-backend/data/app.db
- 后端运行在 http://localhost:8080
- 前端开发服务器运行在 http://localhost:5173

