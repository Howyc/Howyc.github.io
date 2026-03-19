# 项目实战

从零到部署的全栈项目实践，记录完整的开发过程和技术选型。

## fetch-mcp-demo

一个展示前后端完整数据流的全栈 Demo 项目。

- 前端：React 19 + TypeScript + Vite + Arco Design
- 后端：Spring Boot 3 + JPA + TiDB Cloud
- 认证：JWT（手动实现，不用 Spring Security）
- 部署：Vercel + Render + GitHub Pages

**技术亮点**
- 完整的 JWT 登录认证流程（注册/登录/Token 过期自动跳转）
- 统一 `ApiResponse<T>` 响应格式 + `authFetch` 请求封装
- 内置 API 练习场（类似简化版 Postman）
- 全免费部署方案（Vercel + Render + TiDB Cloud + GitHub Pages）

[查看详细文档](./fetch-mcp-demo) · [源码](https://github.com/Howyc/Howyc.github.io) · [在线 Demo](https://howyc-github-io.vercel.app)
