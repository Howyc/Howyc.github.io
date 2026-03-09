# Howyc.dev

个人全栈项目与学习笔记。

- 文档站：[howyc.github.io](https://howyc.github.io)
- 前端 Demo：[howyc.vercel.app](https://howyc.vercel.app)

## 项目结构

```
├── docs/               # VitePress 文档站（部署到 GitHub Pages）
├── fetch-mcp-demo/     # React + Vite 前端（部署到 Vercel）
└── java-backend/       # Spring Boot 后端（部署到 Render）
```

## 本地开发

```bash
# 文档站
cd docs && npm install && npm run dev

# 前端
cd fetch-mcp-demo && npm install && npm run dev

# 后端
cd java-backend && ./mvnw spring-boot:run
```
