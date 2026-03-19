---
outline: deep
---

# 全栈项目教程

> 从零开始，用前端开发者熟悉的视角，带你走完一个全栈 Demo 项目的完整流程。

## 项目背景

[fetch-mcp-demo](https://github.com/AstroMcp/fetch-mcp-demo) 是一个全栈 Demo 项目，包含 React 前端、Spring Boot 后端和 VitePress 文档站。它实现了一个带用户认证的帖子管理系统，涵盖了前后端开发中最常见的技术点：路由守卫、JWT 认证、RESTful API、数据库 CRUD、统一响应封装、多平台部署等。

**为什么做这个教程？**

如果你是一名熟悉 TypeScript 和 React 的前端开发者，想要了解后端开发但不知道从何入手，这个教程就是为你准备的。我们不会从零讲 Java 语法，而是基于一个真实可运行的项目，用你已经熟悉的前端概念来类比解释后端知识。每段 Java 代码都会配上 TypeScript 等价写法，让你快速建立知识映射。

## 技术栈总览

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 前端 | React 19 + TypeScript + Vite | 使用 Arco Design 组件库，支持暗色主题 |
| 后端 | Spring Boot 3 + JPA | RESTful API，JWT 认证，三层架构 |
| 数据库 | TiDB Cloud（MySQL 兼容） | Serverless 免费方案，云端托管 |
| 前端部署 | Vercel | 自动部署，支持 SPA 路由重写 |
| 后端部署 | Render | Docker 容器部署，免费方案可用 |
| 文档站 | VitePress + GitHub Pages | GitHub Actions 自动构建部署 |

## 章节目录

本教程共分为七章，按前后端分模块组织，建议按顺序阅读：

### 前端模块

#### [第 1 章：前端项目创建](./project-setup)

从 `npm create vite@latest` 开始，讲解如何创建一个 React + TypeScript 项目。涵盖 Vite 配置、TypeScript 配置体系、入口文件解析、依赖管理和 Arco Design 组件库集成。

#### [第 2 章：前端知识点详解](./frontend-knowledge)

深入讲解项目中用到的前端核心技术：React Hooks（useState / useEffect / useContext）、TypeScript 类型定义、React Router 路由守卫、AuthContext 认证上下文、API 请求封装和环境变量管理。

#### [第 3 章：前端部署](./frontend-deployment)

将 React 前端部署到 Vercel：项目导入、环境变量配置、vercel.json SPA 路由重写、GitHub Actions 自动部署工作流。包含前端部署检查清单和常见问题解答。

### 后端模块

#### [第 4 章：后端知识点详解](./backend-knowledge)

用前端视角解读 Spring Boot 后端：三层架构（Controller → Service → Repository）、JPA 实体与数据库映射、JWT 认证实现、统一响应格式、CORS 跨域配置、Maven 依赖管理。每段 Java 代码都配有 TypeScript 对比。

#### [第 5 章：后端部署](./backend-deployment)

将 Spring Boot 后端部署到云端：TiDB Cloud 数据库配置、Render Docker 容器部署、Dockerfile 多阶段构建详解、生产环境配置文件。包含后端部署检查清单和常见问题解答。

### 其他

#### [第 6 章：文档站部署](./docs-deployment)

通过 GitHub Actions 将 VitePress 文档站自动部署到 GitHub Pages。

#### [第 7 章：OpenClaw 完全指南](./openclaw-guide)

OpenClaw 个人AI助手的完整使用指南，涵盖安装、配置、渠道连接、模型设置、技能使用和高级功能。

#### [第 8 章：OpenClaw 安装历程](./openclaw-installation-journey)

记录从零开始安装、配置和使用 OpenClaw 的完整过程，包括环境准备、安装步骤、配置过程、遇到的问题及解决方案。

## 阅读建议

### 推荐阅读顺序

```
前端模块：第 1 章（项目创建）→ 第 2 章（前端知识点）→ 第 3 章（前端部署）
后端模块：第 4 章（后端知识点）→ 第 5 章（后端部署）
其他：第 6 章（文档站部署）
```

前后端模块可以独立阅读。如果你只关心前端，读完前三章就够了；如果想了解后端，继续读第 4、5 章。

### 前置知识要求

- ✅ 熟悉 TypeScript 基础语法（类型、接口、泛型）
- ✅ 熟悉 React 基础（组件、Props、State、Hooks）
- ✅ 了解 npm / Node.js 基本使用
- ✅ 了解 HTTP 请求和 RESTful API 概念
- ❌ **不需要** Java 基础 — 教程会从前端视角解释所有后端概念

## 与现有文档的关系

本教程是对现有文档的补充，三者各有侧重：

| 文档 | 定位 | 适合场景 |
|------|------|---------|
| [fetch-mcp-demo 项目详解](/projects/fetch-mcp-demo) | 项目架构和功能概览 | 快速了解项目全貌 |
| [Java 零基础入门笔记](/notes/java-zero-to-one) | Java 语言基础知识 | 系统学习 Java 语法 |
| **本教程**（你在这里） | 全栈实战教程 | 跟着项目学前后端开发和部署 |

**建议阅读路径：**

1. 先阅读 [fetch-mcp-demo 项目详解](/projects/fetch-mcp-demo)，了解项目整体架构
2. 跟随本教程逐章学习，遇到 Java 语法疑问时参考 [Java 零基础入门笔记](/notes/java-zero-to-one)
3. 完成教程后，尝试在本地运行项目并部署到云端
